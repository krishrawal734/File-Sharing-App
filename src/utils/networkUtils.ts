import * as Network from "expo-network";

export async function getLocalIpAddress(): Promise<string | null> {
  try {
    const ipAddress = await Network.getIpAddressAsync();
    if (ipAddress && ipAddress !== "0.0.0.0" && ipAddress !== "::1") {
       return ipAddress;
    }
  } catch (error) {
    console.log("Failed to get local IP address:", error);
  }
  return null;
}

export function isEmulatorIp(ipAddress: string | null): boolean {
  if (!ipAddress) return false;
  return ipAddress.startsWith("10.0.2.") || ipAddress === "127.0.0.1";
}