import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import BottomNavigation from "../components/BottomNavigation";
import StorageCard from "../components/StorageCard";
import { getLocalIpAddress } from "../utils/networkUtils";
import { getTransferHistory, TransferHistory } from "../database/database";
import { formatFileSize } from "../utils/fileUtils";

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localIp, setLocalIp] = useState<string>("");
  const [recentTransfers, setRecentTransfers] = useState<TransferHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch network IP for status indicator
  useEffect(() => {
    getLocalIpAddress()
      .then((ip) => {
        if (ip) setLocalIp(ip);
      })
      .catch((err) => console.log("Failed to fetch IP:", err));
  }, []);

  // Fetch recent transfers on screen focus
  const loadRecentTransfers = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const history = await getTransferHistory();
      setRecentTransfers(history.slice(0, 4));
    } catch (err) {
      console.log("Error loading recent transfers:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentTransfers();
    }, [loadRecentTransfers])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Top Header Bar */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-[#18242c] bg-[#0c1318]">
        {/* Left: Hamburger Menu Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-2xl bg-[#141e24] border border-[#1f2d36] items-center justify-center"
          accessibilityLabel="Open menu"
        >
          <MaterialCommunityIcons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center: Title with green line indicator */}
        <View className="items-center">
          <Text className="text-white text-xl font-bold tracking-wide">Home</Text>
          <View className="w-5 h-1 bg-[#0d8274] rounded-full mt-1" />
        </View>

        {/* Right: Network Status Indicator */}
        <View className="flex-row items-center bg-[#141e24] border border-[#1f2d36] px-2.5 py-1 rounded-full">
          <View className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5" />
          <Text className="text-slate-300 text-[11px] font-medium" numberOfLines={1}>
            {localIp ? "Online" : "Ready"}
          </Text>
        </View>
      </View>

      {/* Main Content Body */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-extrabold tracking-tight">Air—DropX</Text>
          <Text className="text-slate-400 text-xs font-medium mt-0.5">
            Fast. Private. Simple. Everywhere.
          </Text>
        </View>

        {/* Main Connectivity Section */}
        <View className="gap-3 mb-6">
          {/* Connect to PC/Mac Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/pc" as any)}
            className="rounded-3xl bg-gradient-to-r from-[#0d8274] to-[#075046] p-5 shadow-xl border border-[#149d8c]/40 relative overflow-hidden"
            style={{ backgroundColor: "#0b5349" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <View className="bg-white/20 px-2 py-0.5 rounded-md">
                    <Text className="text-white text-[10px] font-bold">WINDOWS & macOS</Text>
                  </View>
                </View>

                <Text className="text-white text-2xl font-extrabold tracking-tight leading-7">
                  Connect to{"\n"}PC / Mac
                </Text>

                <Text className="text-teal-100 text-xs font-medium mt-2 leading-4">
                  Transfer files seamlessly to computer browser via QR Code.
                </Text>

                <View className="flex-row items-center gap-1.5 mt-3 bg-white/15 self-start px-3 py-1.5 rounded-xl">
                  <Text className="text-white text-xs font-bold">Connect Now</Text>
                  <MaterialCommunityIcons name="arrow-right" size={14} color="#FFFFFF" />
                </View>
              </View>

              <View className="w-20 h-20 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shadow-inner">
                <MaterialCommunityIcons name="laptop" size={44} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Connect to iPhone & Connect to Android */}
          <View className="flex-row gap-3">
            {/* Connect to iPhone */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/send/devices")}
              className="flex-1 rounded-3xl bg-[#141e24] border border-[#1f2d36] p-4 shadow-md justify-between min-h-[125px]"
            >
              <View className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 items-center justify-center mb-2">
                <MaterialCommunityIcons name="apple" size={22} color="#38bdf8" />
              </View>
              <View>
                <Text className="text-white text-base font-bold leading-5">Connect to iPhone</Text>
                <Text className="text-slate-400 text-[11px] mt-1">Nearby iOS devices</Text>
              </View>
            </TouchableOpacity>

            {/* Connect to Android */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/send/devices")}
              className="flex-1 rounded-3xl bg-[#141e24] border border-[#1f2d36] p-4 shadow-md justify-between min-h-[125px]"
            >
              <View className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-2">
                <MaterialCommunityIcons name="android" size={22} color="#34d399" />
              </View>
              <View>
                <Text className="text-white text-base font-bold leading-5">Connect to Android</Text>
                <Text className="text-slate-400 text-[11px] mt-1">Nearby Android devices</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Card Section */}
        <View className="mb-6">
          <StorageCard />
        </View>

        {/* Quick Actions Header */}
        <Text className="text-white text-base font-bold mb-3 tracking-wide">Quick Actions</Text>

        {/* Quick Action Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {/* Send */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/send")}
            className="w-[18%] items-center"
          >
            <View className="w-14 h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center mb-1.5 shadow-sm">
              <MaterialCommunityIcons name="send" size={24} color="#0d8274" style={{ transform: [{ rotate: "-45deg" }] }} />
            </View>
            <Text className="text-slate-300 text-[11px] font-semibold text-center">Send</Text>
          </TouchableOpacity>

          {/* Receive */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/receive")}
            className="w-[18%] items-center"
          >
            <View className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 items-center justify-center mb-1.5 shadow-sm">
              <MaterialCommunityIcons name="tray-arrow-down" size={24} color="#38bdf8" />
            </View>
            <Text className="text-slate-300 text-[11px] font-semibold text-center">Receive</Text>
          </TouchableOpacity>

          {/* Scan QR */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/receive/scan")}
            className="w-[18%] items-center"
          >
            <View className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 items-center justify-center mb-1.5 shadow-sm">
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#c084fc" />
            </View>
            <Text className="text-slate-300 text-[11px] font-semibold text-center">Scan QR</Text>
          </TouchableOpacity>

          {/* Nearby */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/devices" as any)}
            className="w-[18%] items-center"
          >
            <View className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 items-center justify-center mb-1.5 shadow-sm">
              <MaterialCommunityIcons name="radar" size={24} color="#fbbf24" />
            </View>
            <Text className="text-slate-300 text-[11px] font-semibold text-center">Nearby</Text>
          </TouchableOpacity>

          {/* File Manager */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/file-manager" as any)}
            className="w-[18%] items-center"
          >
            <View className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center mb-1.5 shadow-sm">
              <MaterialCommunityIcons name="folder-text-outline" size={24} color="#34d399" />
            </View>
            <Text className="text-slate-300 text-[11px] font-semibold text-center">Files</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transfers Section */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-4 shadow-xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-base font-bold">Recent Transfers</Text>
            <TouchableOpacity onPress={() => router.push("/history")} activeOpacity={0.7}>
              <Text className="text-[#0d8274] text-xs font-bold">See All</Text>
            </TouchableOpacity>
          </View>

          {loadingHistory ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#0d8274" />
            </View>
          ) : recentTransfers.length === 0 ? (
            <View className="items-center justify-center py-6">
              <MaterialCommunityIcons name="file-document-outline" size={40} color="#475569" />
              <Text className="text-slate-300 font-semibold text-sm mt-2">No recent transfers</Text>
              <Text className="text-slate-500 text-xs mt-0.5 text-center">
                Your transfer history will appear here
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {recentTransfers.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between p-3 rounded-2xl bg-[#1b2830] border border-[#273844]"
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-[#0d8274]/20 items-center justify-center">
                      <MaterialCommunityIcons
                        name={item.direction === "sent" ? "export" : "import"}
                        size={20}
                        color="#0d8274"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                        {item.fileName}
                      </Text>
                      <Text className="text-slate-400 text-xs mt-0.5">
                        {formatFileSize(item.fileSize)} • {item.direction}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[#10b981] text-xs font-bold capitalize">{item.status}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sidebar Navigation Drawer Modal */}
      <Modal
        visible={isSidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View className="flex-1 flex-row">
          <Pressable
            className="absolute inset-0 bg-black/70"
            onPress={() => setIsSidebarOpen(false)}
          />

          <View className="w-4/5 max-w-xs bg-[#0c1318] h-full z-10 shadow-2xl justify-between border-r border-[#18242c]">
            <ScrollView>
              {/* Drawer Top Header */}
              <View className="pt-12 pb-6 px-5 bg-[#141e24] border-b border-[#1f2d36]">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-[#0d8274] items-center justify-center shadow-lg">
                    <MaterialCommunityIcons name="share-variant" size={30} color="#FFFFFF" />
                  </View>

                  <TouchableOpacity
                    onPress={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text className="text-white text-xl font-bold">Air—DropX</Text>
                <Text className="text-slate-400 text-xs mt-1">Fast. Private. Simple. Everywhere.</Text>
              </View>

              {/* Sidebar Menu Items */}
              <View className="p-3 gap-1">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/send");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="send" size={22} color="#0d8274" />
                  <Text className="text-white text-sm font-semibold">Send Files</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/receive");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="tray-arrow-down" size={22} color="#38bdf8" />
                  <Text className="text-white text-sm font-semibold">Receive Files</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/pc" as any);
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="laptop" size={22} color="#c084fc" />
                  <Text className="text-white text-sm font-semibold">Connect to PC / Mac</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/devices" as any);
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="radar" size={22} color="#fbbf24" />
                  <Text className="text-white text-sm font-semibold">Nearby Devices</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/file-manager" as any);
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="folder-text-outline" size={22} color="#34d399" />
                  <Text className="text-white text-sm font-semibold">File Manager</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/history" as any);
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="clock-outline" size={22} color="#38bdf8" />
                  <Text className="text-white text-sm font-semibold">Transfer History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/security" as any);
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="shield-check-outline" size={22} color="#10b981" />
                  <Text className="text-white text-sm font-semibold">Security & App Lock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/settings");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3 rounded-xl active:bg-[#141e24]"
                >
                  <MaterialCommunityIcons name="cog-outline" size={22} color="#94a3b8" />
                  <Text className="text-white text-sm font-semibold">Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View className="p-4 border-t border-[#18242c] bg-[#141e24]">
              <Text className="text-slate-500 text-xs text-center font-medium">
                Air—DropX v1.0.0 • Local Network Share
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation */}
      <BottomNavigation currentTab="home" />
    </SafeAreaView>
  );
}
