import { describe, expect, it, jest } from "@jest/globals";
import { QRCodeConnectionService } from "../QRCodeConnectionService";

jest.mock("../../../utils/networkUtils", () => ({
  getLocalIpAddress: jest.fn<() => Promise<string>>().mockResolvedValue("192.168.1.50"),
}));

describe("QRCodeConnectionService", () => {
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

  describe("parseQRSessionToken", () => {
    it("successfully parses valid AirDropX QR payload", () => {
      const validPayload = JSON.stringify({
        service: "air-dropx",
        version: "1.0",
        ip: "192.168.1.100",
        port: 8080,
        token: "qr_test1234",
        expiresAt: Date.now() + 300000,
      });

      const result = QRCodeConnectionService.parseQRSessionToken(validPayload);
      expect(result).not.toBeNull();
      expect(result?.service).toBe("air-dropx");
      expect(result?.ip).toBe("192.168.1.100");
      expect(result?.port).toBe(8080);
      expect(result?.token).toBe("qr_test1234");
    });

    it("returns null for invalid or non-AirDropX QR payload", () => {
      const invalidService = JSON.stringify({
        service: "other-app",
        ip: "192.168.1.100",
      });

      expect(QRCodeConnectionService.parseQRSessionToken(invalidService)).toBeNull();
      expect(QRCodeConnectionService.parseQRSessionToken("not-a-json-string")).toBeNull();
      expect(QRCodeConnectionService.parseQRSessionToken("{}")).toBeNull();
    });
  });
});
