import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import NearbyDeviceCard from "../../components/NearbyDeviceCard";
import DiscoveryStatusView from "../../components/DiscoveryStatus";
import ConnectionRequestModal from "../../components/ConnectionRequestModal";
import { useNearbyDevices } from "../../hooks/useNearbyDevices";
import { NearbyDevice } from "../../types/device";

export default function NearbyDevicesScreen() {
  const [activeTab, setActiveTab] = useState<"nearby" | "trusted">("nearby");
  const [selectedDevice, setSelectedDevice] = useState<NearbyDevice | null>(null);

  const {
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
  } = useNearbyDevices();

  const handleConnect = async (device: NearbyDevice) => {
    setSelectedDevice(device);
    await requestConnection(device);
  };

  const displayedDevices = activeTab === "trusted" ? trustedDevices : discoveredDevices;

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* HEADER BAR */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader
          title="Nearby Devices"
          subtitle="Automatic local network discovery"
          rightElement={
            <TouchableOpacity
              onPress={refreshDiscovery}
              disabled={isScanning}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center"
            >
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={isScanning ? "#0d8274" : "#f8fafc"}
              />
            </TouchableOpacity>
          }
        />

        {/* SUBTITLE INFORMATION */}
        <View className="mt-1 mb-3 bg-[#141e24] border border-[#1f2d36] px-3.5 py-2.5 rounded-2xl flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-xl bg-[#0d8274]/20 items-center justify-center">
            <MaterialCommunityIcons name="wifi" size={18} color="#0d8274" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">Devices nearby</Text>
            <Text className="text-slate-400 text-[11px] mt-0.5">
              Make sure both devices are connected to the same network.
            </Text>
          </View>
        </View>

        {/* TABS */}
        <View className="flex-row bg-[#141e24] p-1 rounded-2xl border border-[#1f2d36]">
          <TouchableOpacity
            onPress={() => setActiveTab("nearby")}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === "nearby" ? "bg-[#0d8274]" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "nearby" ? "text-white" : "text-slate-400"
              }`}
            >
              📡 Discovered ({discoveredDevices.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("trusted")}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === "trusted" ? "bg-[#0d8274]" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "trusted" ? "text-white" : "text-slate-400"
              }`}
            >
              ⭐ My Devices ({trustedDevices.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {displayedDevices.length === 0 ? (
          <DiscoveryStatusView
            status={status}
            onRefresh={refreshDiscovery}
            onUseQR={() => router.push("/receive/scan" as any)}
          />
        ) : (
          <View className="gap-1">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-white text-sm font-bold">Available Devices</Text>
              <TouchableOpacity
                onPress={() => router.push("/receive/scan" as any)}
                className="flex-row items-center gap-1"
              >
                <MaterialCommunityIcons name="qrcode-scan" size={14} color="#0d8274" />
                <Text className="text-[#0d8274] text-xs font-bold">Connect with QR</Text>
              </TouchableOpacity>
            </View>

            {displayedDevices.map((device) => (
              <NearbyDeviceCard
                key={device.id}
                device={device}
                onConnect={handleConnect}
                onToggleTrust={toggleTrustDevice}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* CONNECTION REQUEST APPROVAL MODAL */}
      <ConnectionRequestModal
        session={connectionSession}
        onAccept={acceptConnection}
        onReject={rejectConnection}
        onDisconnect={disconnect}
        onTryAgain={() => {
          if (selectedDevice) requestConnection(selectedDevice);
        }}
      />
    </SafeAreaView>
  );
}
