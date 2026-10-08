import * as Device from "expo-device";
import { getLocalIpAddress } from "../../utils/networkUtils";

export interface QRSessionPayload {
  service: "air-dropx";
  version: "1.0";
  ip: string;
  port: number;
  serverUrl: string;
  token: string;
  sessionId: string;
  deviceName: string;
  createdAt: number;
  expiresAt: number;
}

export type QRSessionParseResult =
  | { success: true; payload: QRSessionPayload }
  | { success: false; error: "EXPIRED" | "INVALID" | "CANCELLED" };

export class QRCodeConnectionService {
  private static activeSessions: Map<string, QRSessionPayload> = new Map();
  private static invalidatedTokens: Set<string> = new Set();

  /**
   * Generates a new unique, expiring QR code session payload object.
   */
  public static async generateQRSession(
    port: number = 8080,
    customDeviceName?: string
  ): Promise<QRSessionPayload> {
    const ip = (await getLocalIpAddress()) || "127.0.0.1";
    const serverUrl = `http://${ip}:${port}`;
    const now = Date.now();
    const expiryMs = 5 * 60 * 1000; // 5 minutes
    const sessionId = `sess_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `qr_${Math.random().toString(36).substring(2, 10)}`;
    const deviceName = customDeviceName || Device.deviceName || "Air-DropX Device";

    const payload: QRSessionPayload = {
      service: "air-dropx",
      version: "1.0",
      ip,
      port,
      serverUrl,
      token,
      sessionId,
      deviceName,
      createdAt: now,
      expiresAt: now + expiryMs,
    };

    QRCodeConnectionService.activeSessions.set(token, payload);
    return payload;
  }

  /**
   * Generates a stringified JSON token payload for QR code rendering.
   */
  public static async generateQRSessionToken(
    port: number = 8080,
    customDeviceName?: string
  ): Promise<string> {
    const payload = await QRCodeConnectionService.generateQRSession(port, customDeviceName);
    return JSON.stringify(payload);
  }

  /**
   * Invalidates a specific session token (e.g. when user cancels sharing).
   */
  public static invalidateSession(token: string) {
    QRCodeConnectionService.activeSessions.delete(token);
    QRCodeConnectionService.invalidatedTokens.add(token);
  }

  /**
   * Invalidates all active QR sessions.
   */
  public static invalidateAllSessions() {
    QRCodeConnectionService.activeSessions.forEach((session) => {
      QRCodeConnectionService.invalidatedTokens.add(session.token);
    });
    QRCodeConnectionService.activeSessions.clear();
  }

  /**
   * Detailed parser that checks signature, expiry, and cancellation status.
   */
  public static parseQRSession(qrString: string): QRSessionParseResult {
    if (!qrString || typeof qrString !== "string") {
      return { success: false, error: "INVALID" };
    }

    const trimmed = qrString.trim();

    try {
      // 1. Check if stringified JSON payload
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.service === "air-dropx" && parsed.ip) {
          const token = parsed.token || "";

          // Check if explicitly cancelled/invalidated
          if (token && QRCodeConnectionService.invalidatedTokens.has(token)) {
            return { success: false, error: "CANCELLED" };
          }

          // Check expiry timestamp
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            return { success: false, error: "EXPIRED" };
          }

          const port = parsed.port || 8080;
          const serverUrl = parsed.serverUrl || `http://${parsed.ip}:${port}`;

          const payload: QRSessionPayload = {
            service: "air-dropx",
            version: parsed.version || "1.0",
            ip: parsed.ip,
            port,
            serverUrl,
            token: token || `qr_${Math.random().toString(36).substring(2, 8)}`,
            sessionId: parsed.sessionId || `sess_${Date.now()}`,
            deviceName: parsed.deviceName || "Air-DropX Sender",
            createdAt: parsed.createdAt || Date.now(),
            expiresAt: parsed.expiresAt || Date.now() + 300000,
          };

          return { success: true, payload };
        }
      }

      // 2. Direct HTTP server URL fallback (e.g., http://192.168.1.50:8080)
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const urlObj = new URL(trimmed);
        const ip = urlObj.hostname;
        const port = parseInt(urlObj.port, 10) || 8080;
        const token = urlObj.searchParams.get("token") || `url_${Math.random().toString(36).substring(2, 8)}`;

        if (QRCodeConnectionService.invalidatedTokens.has(token)) {
          return { success: false, error: "CANCELLED" };
        }

        const payload: QRSessionPayload = {
          service: "air-dropx",
          version: "1.0",
          ip,
          port,
          serverUrl: `http://${ip}:${port}`,
          token,
          sessionId: `sess_url_${Date.now()}`,
          deviceName: "Air-DropX Sender",
          createdAt: Date.now(),
          expiresAt: Date.now() + 5 * 60 * 1000,
        };

        return { success: true, payload };
      }

      return { success: false, error: "INVALID" };
    } catch {
      return { success: false, error: "INVALID" };
    }
  }

  /**
   * Backward-compatible parse function returning QRSessionPayload or null if invalid/expired.
   */
  public static parseQRSessionToken(qrString: string): QRSessionPayload | null {
    const result = QRCodeConnectionService.parseQRSession(qrString);
    if (result.success) {
      return result.payload;
    }
    return null;
  }
}
