import { useEffect, useState, useCallback } from "react";
import { ConnectionSession, NearbyDevice } from "../types/device";
import { DeviceDiscoveryService } from "../services/discovery/DeviceDiscoveryService";
import { ConnectionService } from "../services/connection/ConnectionService";

export type DiscoveryStatus =
  | "initial"
  | "discovering"
  | "found"
  | "empty"
  | "permission_denied"
  | "error";

export function useNearbyDevices() {
  const [discoveredDevices, setDiscoveredDevices] = useState<NearbyDevice[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<NearbyDevice[]>([]);
  const [status, setStatus] = useState<DiscoveryStatus>("discovering");
  const [connectionSession, setConnectionSession] = useState<ConnectionSession | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const discoveryService = DeviceDiscoveryService.getInstance();
    const connectionService = ConnectionService.getInstance();

    // Subscribe to discovery updates
    const unsubscribeDiscovery = discoveryService.addListener((devices) => {
      if (!isMounted) return;
      setDiscoveredDevices(devices);
      if (devices.length > 0) {
        setStatus("found");
      } else {
        setStatus("empty");
      }
    });

    // Subscribe to connection updates
    const unsubscribeConnection = connectionService.addListener((session) => {
      if (!isMounted) return;
      setConnectionSession(session);
    });

    // Start scanning
    discoveryService.startDiscovery().catch((err) => {
      if (isMounted) {
        console.log("[AirDropX:Discovery] Start discovery error:", err);
        setStatus("error");
      }
    });

    return () => {
      isMounted = false;
      unsubscribeDiscovery();
      unsubscribeConnection();
      discoveryService.stopDiscovery().catch(() => {});
    };
  }, []);

  const refreshDiscovery = useCallback(async () => {
    setStatus("discovering");
    setIsScanning(true);
    try {
      await DeviceDiscoveryService.getInstance().refreshDiscovery();
    } catch {
      setStatus("error");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const requestConnection = useCallback(async (device: NearbyDevice) => {
    return await ConnectionService.getInstance().requestConnection(device);
  }, []);

  const acceptConnection = useCallback(async () => {
    await ConnectionService.getInstance().acceptConnection();
  }, []);

  const rejectConnection = useCallback(async () => {
    await ConnectionService.getInstance().rejectConnection();
  }, []);

  const disconnect = useCallback(() => {
    ConnectionService.getInstance().disconnect();
  }, []);

  const toggleTrustDevice = useCallback((device: NearbyDevice) => {
    setTrustedDevices((prev) => {
      const exists = prev.some((d) => d.id === device.id);
      if (exists) {
        return prev.filter((d) => d.id !== device.id);
      } else {
        return [...prev, { ...device, isTrusted: true }];
      }
    });

    setDiscoveredDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, isTrusted: !d.isTrusted } : d))
    );
  }, []);

  return {
    discoveredDevices,
    trustedDevices,
    status,
    isScanning,
    connectionSession,
    refreshDiscovery,
    requestConnection,
    acceptConnection,
    rejectConnection,
    disconnect,
    toggleTrustDevice,
  };
}
