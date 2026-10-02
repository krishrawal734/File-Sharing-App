import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DiscoveryStatus } from "../hooks/useNearbyDevices";

interface DiscoveryStatusProps {
  status: DiscoveryStatus;
  onRefresh: () => void;
  onUseQR: () => void;
}

export default function DiscoveryStatusView({
  status,
  onRefresh,
  onUseQR,
}: DiscoveryStatusProps) {
  if (status === "discovering" || status === "initial") {
    return (
      <View className="py-16 items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-[#0d8274]/15 border border-[#0d8274]/30 items-center justify-center mb-4">
          <ActivityIndicator size="large" color="#0d8274" />
        </View>
        <Text className="text-white text-base font-bold">Looking for nearby devices...</Text>
        <Text className="text-slate-400 text-xs mt-1 text-center px-6">
          Searching for Air—DropX instances on your local Wi-Fi network
        </Text>
      </View>
    );
  }

  if (status === "empty") {
    return (
      <View className="py-12 px-4 items-center justify-center rounded-3xl bg-[#141e24] border border-[#1f2d36]">
        <View className="w-16 h-16 rounded-full bg-[#1b2830] border border-[#273844] items-center justify-center mb-3">
          <MaterialCommunityIcons name="radar" size={32} color="#64748b" />
        </View>
        <Text className="text-white text-base font-bold text-center">No nearby devices found</Text>
        <Text className="text-slate-400 text-xs mt-1.5 text-center px-4 leading-5">
          Make sure both devices are connected to the same network and Air—DropX is open.
        </Text>

        <View className="flex-row items-center gap-3 mt-5 w-full">
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.8}
            className="flex-1 bg-[#0d8274] py-3 rounded-xl items-center flex-row justify-center gap-1.5"
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold">Scan Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onUseQR}
            activeOpacity={0.8}
            className="flex-1 bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center flex-row justify-center gap-1.5"
          >
            <MaterialCommunityIcons name="qrcode-scan" size={18} color="#0d8274" />
            <Text className="text-[#0d8274] text-xs font-bold">Use QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === "permission_denied") {
    return (
      <View className="py-12 px-4 items-center justify-center rounded-3xl bg-[#141e24] border border-[#1f2d36]">
        <MaterialCommunityIcons name="shield-lock-outline" size={44} color="#f87171" />
        <Text className="text-white text-base font-bold text-center mt-3">
          Permission Required
        </Text>
        <Text className="text-slate-400 text-xs mt-1.5 text-center px-4 leading-5">
          Local Network permission is required to discover nearby devices.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openSettings()}
          activeOpacity={0.85}
          className="bg-[#0d8274] px-6 py-3 rounded-xl mt-5"
        >
          <Text className="text-white text-xs font-bold">Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="py-12 px-4 items-center justify-center rounded-3xl bg-[#141e24] border border-[#1f2d36]">
        <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#f87171" />
        <Text className="text-white text-base font-bold text-center mt-3">
          Couldn&apos;t discover nearby devices
        </Text>
        <Text className="text-slate-400 text-xs mt-1 text-center">
          An error occurred while scanning your local network.
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          activeOpacity={0.85}
          className="bg-[#0d8274] px-6 py-3 rounded-xl mt-5 flex-row items-center gap-2"
        >
          <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
          <Text className="text-white text-xs font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
