import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Device } from "../types/device";

type DeviceCardProps = {
  device: Device;
  onConnect: (device: Device) => void;
};

export default function DeviceCard({ device, onConnect }: DeviceCardProps) {
  const getIcon = () => {
    switch (device.type) {
      case "ios":
        return "apple";
      case "android":
        return "android";
      case "pc":
        return "laptop";
      default:
        return "cellphone";
    }
  };

  const getBadgeColor = () => {
    switch (device.type) {
      case "ios":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "android":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 shadow-md">
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        <View className="w-12 h-12 rounded-xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
          <MaterialCommunityIcons name={getIcon()} size={24} color="#0d8274" />
        </View>

        <View className="flex-1">
          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {device.name}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <View className={`px-2 py-0.5 rounded-md border ${getBadgeColor()}`}>
              <Text className="text-[10px] font-bold uppercase">{device.type}</Text>
            </View>
            <Text className="text-slate-400 text-xs font-medium">Ready to connect</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onConnect(device)}
        activeOpacity={0.8}
        className="rounded-xl bg-[#0d8274] px-4 py-2.5 active:bg-[#096358] shadow-sm"
      >
        <Text className="text-xs font-bold text-white tracking-wide">Connect</Text>
      </TouchableOpacity>
    </View>
  );
}
