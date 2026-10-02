export interface DiscoveredDevice {
  id: string;
  name: string;
  type: "android" | "ios" | "pc" | "tablet";
  ipAddress: string;
  connected: boolean;
  isTrusted?: boolean;
  lastConnected?: string;
  osVersion?: string;
}

export class DiscoveryService {
  /**
   * Search nearby local network devices
   */
  public static async discoverNearbyDevices(): Promise<DiscoveredDevice[]> {
    // Service abstraction for local network mDNS / UDP broadcast discovery
    return [
      {
        id: "dev-1",
        name: "Krish's Phone",
        type: "ios",
        ipAddress: "192.168.1.12",
        connected: false,
        isTrusted: true,
        lastConnected: "Today",
      },
      {
        id: "dev-2",
        name: "My PC",
        type: "pc",
        ipAddress: "192.168.1.45",
        connected: false,
        isTrusted: true,
        lastConnected: "Yesterday",
      },
      {
        id: "dev-3",
        name: "Samsung Galaxy S24",
        type: "android",
        ipAddress: "192.168.1.88",
        connected: false,
        isTrusted: false,
        lastConnected: "Never",
      },
      {
        id: "dev-4",
        name: "Office iPad",
        type: "tablet",
        ipAddress: "192.168.1.95",
        connected: false,
        isTrusted: false,
        lastConnected: "3 days ago",
      },
    ];
  }
}
