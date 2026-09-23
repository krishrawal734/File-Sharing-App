export type DeviceType = "android" | "ios" | "pc";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  connected: boolean;
};
