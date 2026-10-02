import { Platform } from "react-native";
import { NearbyDevice } from "../../types/device";
import { BaseDiscoveryAdapter } from "./adapters/BaseDiscoveryAdapter";
import { AndroidDiscoveryAdapter } from "./adapters/AndroidDiscoveryAdapter";
import { IOSDiscoveryAdapter } from "./adapters/IOSDiscoveryAdapter";
import { DesktopDiscoveryAdapter } from "./adapters/DesktopDiscoveryAdapter";
import { LocalNetworkAdapter } from "./adapters/LocalNetworkAdapter";

export type DiscoveryListener = (devices: NearbyDevice[]) => void;

export class DeviceDiscoveryService {
  private static instance: DeviceDiscoveryService;
  private adapter: BaseDiscoveryAdapter;
  private discoveredDevices: Map<string, NearbyDevice> = new Map();
  private listeners: Set<DiscoveryListener> = new Set();
  private ttlCleanupTimer: any = null;
  private isScanning = false;

  private constructor() {
    this.adapter = this.selectAdapter();
    this.adapter.setListeners({
      onDeviceDiscovered: (device) => this.handleDeviceDiscovered(device),
      onDeviceLost: (deviceId) => this.handleDeviceLost(deviceId),
      onError: (err) => console.log("[AirDropX:Discovery] Adapter error:", err.message),
    });
  }

  public static getInstance(): DeviceDiscoveryService {
    if (!DeviceDiscoveryService.instance) {
      DeviceDiscoveryService.instance = new DeviceDiscoveryService();
    }
    return DeviceDiscoveryService.instance;
  }

  private selectAdapter(): BaseDiscoveryAdapter {
    if (Platform.OS === "android") {
      return new AndroidDiscoveryAdapter();
    } else if (Platform.OS === "ios") {
      return new IOSDiscoveryAdapter();
    } else if (Platform.OS === "web") {
      return new DesktopDiscoveryAdapter();
    }
    return new LocalNetworkAdapter();
  }

  public async startDiscovery(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;
    console.log("[AirDropX:Discovery] Starting discovery");

    this.startTtlCleanup();
    await this.adapter.startScan();
  }

  public async stopDiscovery(): Promise<void> {
    if (!this.isScanning) return;
    this.isScanning = false;
    console.log("[AirDropX:Discovery] Stopping discovery");

    this.stopTtlCleanup();
    await this.adapter.stopScan();
  }

  public async refreshDiscovery(): Promise<void> {
    console.log("[AirDropX:Discovery] Refreshing discovery - clearing stale devices");
    this.discoveredDevices.clear();
    this.notifyListeners();
    await this.stopDiscovery();
    await this.startDiscovery();
  }

  public addListener(listener: DiscoveryListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current discovered devices
    listener(Array.from(this.discoveredDevices.values()));
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getDiscoveredDevices(): NearbyDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  private handleDeviceDiscovered(device: NearbyDevice) {
    const existing = this.discoveredDevices.get(device.id);
    if (!existing) {
      console.log(`[AirDropX:Discovery] Device discovered: ${device.name} (${device.address})`);
    }
    this.discoveredDevices.set(device.id, {
      ...device,
      lastSeen: Date.now(),
    });
    this.notifyListeners();
  }

  private handleDeviceLost(deviceId: string) {
    if (this.discoveredDevices.has(deviceId)) {
      const dev = this.discoveredDevices.get(deviceId);
      console.log(`[AirDropX:Discovery] Device removed: ${dev?.name || deviceId}`);
      this.discoveredDevices.delete(deviceId);
      this.notifyListeners();
    }
  }

  private startTtlCleanup() {
    if (this.ttlCleanupTimer) clearInterval(this.ttlCleanupTimer);
    // Check for stale devices every 5 seconds (TTL: 25s)
    this.ttlCleanupTimer = setInterval(() => {
      const now = Date.now();
      const TTL = 25000;
      let changed = false;

      for (const [id, device] of this.discoveredDevices.entries()) {
        if (device.lastSeen && now - device.lastSeen > TTL) {
          console.log(`[AirDropX:Discovery] Device removed (TTL expired): ${device.name}`);
          this.discoveredDevices.delete(id);
          changed = true;
        }
      }

      if (changed) {
        this.notifyListeners();
      }
    }, 5000);
  }

  private stopTtlCleanup() {
    if (this.ttlCleanupTimer) {
      clearInterval(this.ttlCleanupTimer);
      this.ttlCleanupTimer = null;
    }
  }

  private notifyListeners() {
    const list = Array.from(this.discoveredDevices.values());
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (err) {
        console.log("[AirDropX:Discovery] Listener error:", err);
      }
    });
  }
}

// Preserve backward compatibility for DiscoveryService
export class DiscoveryService {
  public static async discoverNearbyDevices(): Promise<NearbyDevice[]> {
    const instance = DeviceDiscoveryService.getInstance();
    await instance.startDiscovery();
    return instance.getDiscoveredDevices();
  }
}
