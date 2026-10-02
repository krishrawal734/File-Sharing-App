import { NearbyDevice } from "../../../types/device";

export interface DiscoveryAdapterEvents {
  onDeviceDiscovered: (device: NearbyDevice) => void;
  onDeviceLost: (deviceId: string) => void;
  onError: (error: Error) => void;
}

export abstract class BaseDiscoveryAdapter {
  protected isScanning = false;
  protected listeners: Partial<DiscoveryAdapterEvents> = {};

  public setListeners(listeners: Partial<DiscoveryAdapterEvents>) {
    this.listeners = listeners;
  }

  public abstract startScan(): Promise<void>;
  public abstract stopScan(): Promise<void>;
  public abstract announceDevice(deviceInfo: NearbyDevice): Promise<void>;

  public getIsScanning(): boolean {
    return this.isScanning;
  }
}
