 import { getLocalIpAddress } from "../../utils/networkUtils";

export interface QRSessionPayload {
  service: "air-dropx";
  version: "1.0";
  ip: string;
  port: number;
  token: string;
  expiresAt: number;
}

export class QRCodeConnectionService {
  public static async generateQRSessionToken(port = 8080): Promise<string> {
    const ip = await getLocalIpAddress();
    const payload: QRSessionPayload = {
      service: "air-dropx",
      version: "1.0",
      ip: ip || "127.0.0.1",
      port,
      token: `qr_${Math.random().toString(36).substring(2, 10)}`,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
    };

    return JSON.stringify(payload);
    
  }

  public static parseQRSessionToken(qrString: string): QRSessionPayload | null {
    try {
      const parsed = JSON.parse(qrString);
      if (parsed && parsed.service === "air-dropx" && parsed.ip) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
}
