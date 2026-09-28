import * as Network from "expo-network";

export async function getLocalIpAddress() {
  const ipAddress = await Network.getIpAddressAsync();

  return ipAddress;
}