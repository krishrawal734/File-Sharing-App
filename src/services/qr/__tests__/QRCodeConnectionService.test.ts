import { describe, expect, it, jest } from "@jest/globals";
import { QRCodeConnectionService } from "../QRCodeConnectionService";

jest.mock("../../../utils/networkUtils", () => ({
  getLocalIpAddress: jest.fn<() => Promise<string>>().mockResolvedValue("192.168.1.50"),
}));

describe("QRCodeConnectionService", () => {
  describe("generateQRSession", () => {
    it("generates a structured session payload with unique token and expiry", async () => {
      const payload1 = await QRCodeConnectionService.generateQRSession(8080, "Sender Phone");
      const payload2 = await QRCodeConnectionService.generateQRSession(8080, "Sender Phone");

      expect(payload1.service).toBe("air-dropx");
      expect(payload1.version).toBe("1.0");
      expect(payload1.ip).toBe("192.168.1.50");
      expect(payload1.port).toBe(8080);
      expect(payload1.serverUrl).toBe("http://192.168.1.50:8080");
      expect(payload1.deviceName).toBe("Sender Phone");
      expect(payload1.expiresAt).toBeGreaterThan(Date.now());
      
      // Tokens and session IDs should be unique
      expect(payload1.token).not.toBe(payload2.token);
      expect(payload1.sessionId).not.toBe(payload2.sessionId);
    });
  });

  describe("generateQRSessionToken", () => {
    it("generates a valid JSON token payload string with correct properties", async () => {
      const qrString = await QRCodeConnectionService.generateQRSessionToken(8080);
      expect(typeof qrString).toBe("string");

      const parsed = JSON.parse(qrString);
      expect(parsed.service).toBe("air-dropx");
      expect(parsed.version).toBe("1.0");
      expect(parsed.ip).toBe("192.168.1.50");
      expect(parsed.port).toBe(8080);
      expect(parsed.token).toMatch(/^qr_/);
      expect(typeof parsed.expiresAt).toBe("number");
      expect(parsed.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("parseQRSession", () => {
    it("successfully parses valid AirDropX QR payload", () => {
      const validPayload = JSON.stringify({
        service: "air-dropx",
        version: "1.0",
        ip: "192.168.1.100",
        port: 8080,
        token: "qr_test1234",
        sessionId: "sess_123",
        deviceName: "Pixel 7",
        expiresAt: Date.now() + 300000,
      });

      const result = QRCodeConnectionService.parseQRSession(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payload.service).toBe("air-dropx");
        expect(result.payload.ip).toBe("192.168.1.100");
        expect(result.payload.port).toBe(8080);
        expect(result.payload.serverUrl).toBe("http://192.168.1.100:8080");
        expect(result.payload.token).toBe("qr_test1234");
        expect(result.payload.deviceName).toBe("Pixel 7");
      }
    });

    it("rejects expired QR payloads with EXPIRED error", () => {
      const expiredPayload = JSON.stringify({
        service: "air-dropx",
        version: "1.0",
        ip: "192.168.1.100",
        port: 8080,
        token: "qr_expired123",
        expiresAt: Date.now() - 1000, // 1 second ago
      });

      const result = QRCodeConnectionService.parseQRSession(expiredPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("EXPIRED");
      }
    });

    it("rejects invalidated/cancelled session tokens with CANCELLED error", () => {
      const token = "qr_cancel_me";
      const payloadString = JSON.stringify({
        service: "air-dropx",
        version: "1.0",
        ip: "192.168.1.100",
        port: 8080,
        token,
        expiresAt: Date.now() + 300000,
      });

      // Initially valid
      expect(QRCodeConnectionService.parseQRSession(payloadString).success).toBe(true);

      // Invalidate session
      QRCodeConnectionService.invalidateSession(token);

      // Now rejected as CANCELLED
      const result = QRCodeConnectionService.parseQRSession(payloadString);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("CANCELLED");
      }
    });

    it("parses direct http URL as fallback", () => {
      const result = QRCodeConnectionService.parseQRSession("http://192.168.1.150:8080");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.payload.ip).toBe("192.168.1.150");
        expect(result.payload.port).toBe(8080);
        expect(result.payload.serverUrl).toBe("http://192.168.1.150:8080");
      }
    });

    it("returns INVALID for non-AirDropX payloads", () => {
      const result = QRCodeConnectionService.parseQRSession("invalid-qr");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("INVALID");
      }
    });
  });
});
