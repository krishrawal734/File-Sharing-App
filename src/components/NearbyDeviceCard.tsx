import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NearbyDevice, PlatformType } from "../types/device";

interface NearbyDeviceCardProps {
  device: NearbyDevice;
  onConnect: (device: NearbyDevice) => void;
  onToggleTrust?: (device: NearbyDevice) => void;
}

export default function NearbyDeviceCard({
  device,
  onConnect,
  onToggleTrust,
}: NearbyDeviceCardProps) {
  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case "ios":
        return "apple";
      case "android":
        return "android";
      case "windows":
      case "macos":
      case "linux":
        return "laptop";
      case "web":
        return "web";
      default:
        return "cellphone-link";
    }
  };

  const getPlatformLabel = (platform: PlatformType) => {
    switch (platform) {
      case "ios":
        return "iPhone";
      case "android":
        return "Android";
      case "windows":
        return "Windows";
      case "macos":
        return "macOS";
      case "linux":
        return "Linux";
      case "web":
        return "Web Browser";
      default:
        return "Device";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onConnect(device)}
      className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between shadow-md mb-3"
    >
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        <View className="w-12 h-12 rounded-xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
          <MaterialCommunityIcons
            name={getPlatformIcon(device.platform)}
            size={24}
            color="#0d8274"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-white text-base font-bold" numberOfLines={1}>
              {device.name}
            </Text>
            {device.isTrusted && (
              <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
            )}
          </View>
          <Text className="text-slate-400 text-xs mt-0.5">
            {getPlatformLabel(device.platform)} •{" "}
            {device.status === "connected"
              ? "🟢 Connected"
              : device.status === "connecting"
              ? "Connecting..."
              : "Ready"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {onToggleTrust && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleTrust(device);
            }}
            className="p-1.5"
          >
            <MaterialCommunityIcons
              name={device.isTrusted ? "star" : "star-outline"}
              size={20}
              color={device.isTrusted ? "#fbbf24" : "#64748b"}
            />
          </TouchableOpacity>
        )}
        <View className="w-8 h-8 rounded-full bg-[#1b2830] border border-[#273844] items-center justify-center">
          <MaterialCommunityIcons name="chevron-right" size={20} color="#0d8274" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
