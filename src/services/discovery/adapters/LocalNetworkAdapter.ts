import * as Network from "expo-network";
import { Platform } from "react-native";
import { NearbyDevice, PlatformType, DeviceType } from "../../../types/device";
import { BaseDiscoveryAdapter } from "./BaseDiscoveryAdapter";

export class LocalNetworkAdapter extends BaseDiscoveryAdapter {
  private scanTimer: any = null;
  private portsToScan = [8080, 8085, 9090];

  public async startScan(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;
    console.log("[AirDropX:Discovery] Starting local network subnet discovery scan");

    await this.performSubnetScan();
    // Periodically re-scan every 10 seconds while active
    this.scanTimer = setInterval(() => {
      if (this.isScanning) {
        this.performSubnetScan();
      }
    }, 10000);
  }

  public async stopScan(): Promise<void> {
    this.isScanning = false;
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    console.log("[AirDropX:Discovery] Stopped local network scan");
  }

  public async announceDevice(_deviceInfo: NearbyDevice): Promise<void> {
    // Local server endpoint `/airdropx/info` handles incoming announcements
  }

  private async performSubnetScan() {
    try {
      const localIp = await Network.getIpAddressAsync();
      if (!localIp || localIp === "0.0.0.0" || localIp === "127.0.0.1") {
        console.log("[AirDropX:Discovery] Invalid or unassigned local IP address");
        return;
      }

      const ipParts = localIp.split(".");
      if (ipParts.length !== 4) return;
      const subnetPrefix = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
      const ownSubnetOctet = parseInt(ipParts[3], 10);

      // Probe candidate IPs in parallel batches
      const candidateOctets: number[] = [];
      for (let i = 1; i <= 254; i++) {
        if (i !== ownSubnetOctet) {
          candidateOctets.push(i);
        }
      }

      // Batch scan candidates
      const BATCH_SIZE = 30;
      for (let i = 0; i < candidateOctets.length && this.isScanning; i += BATCH_SIZE) {
        const batch = candidateOctets.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((octet) => this.probeIp(`${subnetPrefix}.${octet}`))
        );
      }
    } catch (err: any) {
      console.log("[AirDropX:Discovery] Subnet scan error:", err?.message || err);
      if (this.listeners.onError) {
        this.listeners.onError(new Error(err?.message || "Local network scan error"));
      }
    }
  }

  private async probeIp(ip: string) {
    for (const port of this.portsToScan) {
      if (!this.isScanning) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(`http://${ip}:${port}/airdropx/info`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const payload = await response.json();
          if (payload && payload.service === "air-dropx") {
            const discovered: NearbyDevice = {
              id: payload.deviceId || `device-${ip.replace(/\./g, "-")}`,
              name: payload.deviceName || `Air-DropX Device (${ip})`,
              platform: (payload.platform as PlatformType) || this.detectPlatform(),
              deviceType: (payload.deviceType as DeviceType) || "phone",
              status: "available",
              address: ip,
              port: payload.port || port,
              protocolVersion: payload.protocolVersion || "1.0",
              capabilities: payload.capabilities || {
                sendFiles: true,
                receiveFiles: true,
                sendFolders: true,
                receiveFolders: true,
              },
              lastSeen: Date.now(),
            };

            console.log(`[AirDropX:Discovery] Device discovered at ${ip}:${port} (${discovered.name})`);
            if (this.listeners.onDeviceDiscovered) {
              this.listeners.onDeviceDiscovered(discovered);
            }
            break; // Found device on this port
          }
        }
      } catch {
        // Connection refused or timed out - node not running Air-DropX
      }
    }
  }

  private detectPlatform(): PlatformType {
    if (Platform.OS === "ios") return "ios";
    if (Platform.OS === "android") return "android";
    if (Platform.OS === "web") return "web";
    return "unknown";
  }
}
