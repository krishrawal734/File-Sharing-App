export type PlatformType =
  | "ios"
  | "android"
  | "windows"
  | "macos"
  | "linux"
  | "web"
  | "unknown";

export type DeviceType = "phone" | "tablet" | "computer" | "android" | "ios" | "pc" | "unknown";

export type DeviceStatus =
  | "discovering"
  | "available"
  | "connecting"
  | "connected"
  | "busy"
  | "offline";

export interface DeviceCapabilities {
  sendFiles: boolean;
  receiveFiles: boolean;
  sendFolders: boolean;
  receiveFolders: boolean;
}

export interface NearbyDevice {
  id: string;
  name: string;
  platform: PlatformType;
  deviceType: DeviceType;
  status: DeviceStatus;
  address?: string;
  port?: number;
  protocolVersion?: string;
  capabilities?: DeviceCapabilities;
  isTrusted?: boolean;
  lastSeen?: number;
  lastConnected?: string;
}

export interface ConnectionSession {
  sessionId: string;
  authToken: string;
  targetDevice: NearbyDevice;
  status: "requesting" | "pending_approval" | "connected" | "rejected" | "expired" | "disconnected";
  createdAt: number;
  expiresAt: number;
}

// Backward-compatible type for existing views
export type Device = {
  id: string;
  name: string;
  type: "android" | "ios" | "pc" | "tablet";
  connected: boolean;
  ipAddress?: string;
  isTrusted?: boolean;
  lastConnected?: string;
};
