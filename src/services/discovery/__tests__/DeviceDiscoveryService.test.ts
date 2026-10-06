import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { DeviceDiscoveryService, DiscoveryService } from "../DeviceDiscoveryService";

// Mock adapters
jest.mock("../adapters/AndroidDiscoveryAdapter", () => {
  return {
    AndroidDiscoveryAdapter: jest.fn().mockImplementation(() => ({
      setListeners: jest.fn(),
      startScan: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      stopScan: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    })),
  };
});

describe("DeviceDiscoveryService", () => {
  let discoveryService: DeviceDiscoveryService;

  beforeEach(() => {
    discoveryService = DeviceDiscoveryService.getInstance();
  });

  it("returns the singleton instance", () => {
    const instance2 = DeviceDiscoveryService.getInstance();
    expect(discoveryService).toBe(instance2);
  });

  it("adds listeners and receives device updates", () => {
    const listener = jest.fn();
    const unsubscribe = discoveryService.addListener(listener as any);

    expect(listener).toHaveBeenCalledWith(expect.any(Array));

    unsubscribe();
  });

  it("returns array of discovered devices", () => {
    const devices = discoveryService.getDiscoveredDevices();
    expect(Array.isArray(devices)).toBe(true);
  });

  it("DiscoveryService wrapper calls startDiscovery", async () => {
    const startScanSpy = jest.spyOn(discoveryService, "startDiscovery");
    const result = await DiscoveryService.discoverNearbyDevices();
    expect(startScanSpy).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });
});
