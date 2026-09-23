import { Pressable, Text, View } from "react-native";

import { Device } from "../types/device";

type DeviceCardProps = {
  device: Device;
  onConnect: (device: Device) => void;
};

export default function DeviceCard({
  device,
  onConnect,
}: DeviceCardProps) {
  const icon =
    device.type === "android"
      ? "📱"
      : device.type === "ios"
      ? "🍎"
      : "💻";

  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-white p-4">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Text className="text-xl">{icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-slate-900">
          {device.name}
        </Text>

        <Text className="mt-1 text-sm text-slate-500">
          {device.type.toUpperCase()}
        </Text>
      </View>

      <Pressable
        onPress={() => onConnect(device)}
        className="rounded-xl bg-blue-600 px-4 py-2"
      >
        <Text className="font-semibold text-white">
          Connect
        </Text>
      </Pressable>
    </View>
  );
}
