import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppHeader from "../../components/AppHeader";
import ConnectionQRCode from "../../components/ConnectionQRCode";
import { startLocalServer, stopLocalServer, clearSharedFiles } from "../../server/localServer";
import { isEmulatorIp } from "../../utils/networkUtils";

export default function PCConnectScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [connectionState, setConnectionState] = useState<"searching" | "connected" | "disconnected">("searching");
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const startConnection = async () => {
      try {
        const url = await startLocalServer();
        if (isMounted && url) {
          setServerUrl(url);
          setConnectionState("searching");
        }
      } catch (error) {
        console.log("PC Connection setup error:", error);
        if (isMounted) setConnectionState("disconnected");
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      stopLocalServer();
    };
  }, []);

  const handleClearCache = async () => {
    try {
      setIsClearing(true);
      await clearSharedFiles();
      Alert.alert("Shared Files Cleared", "All cached files have been cleared from the Web Server.");
    } catch {
      Alert.alert("Error", "Could not clear shared files.");
    } finally {
      setIsClearing(false);
    }
  };

  const isEmulator = serverUrl.includes("10.0.2.") || serverUrl.includes("127.0.0.1");

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Connect to PC / Mac" subtitle="Air—DropX Web Transfer" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 50, alignItems: "center" }}>
        <View className="w-full max-w-2xl self-center">
          {/* Main QR Card */}
          <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 sm:p-7 items-center shadow-xl mb-6">
            <View className="flex-row items-center justify-between w-full mb-4">
              <View className="flex-row items-center gap-2 bg-[#0d8274]/20 border border-[#0d8274]/40 px-3 py-1 rounded-full">
                <View className="w-2 h-2 rounded-full bg-[#10b981]" />
                <Text className="text-[#10b981] text-xs font-bold capitalize">
                  Status: {connectionState}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleClearCache}
                disabled={isClearing}
                className="flex-row items-center gap-1.5 px-3 py-1 bg-[#1f2d36] rounded-full"
              >
                <MaterialCommunityIcons name="delete-outline" size={14} color="#94a3b8" />
                <Text className="text-slate-400 text-xs font-medium">
                  {isClearing ? "Clearing..." : "Clear Cache"}
                </Text>
              </TouchableOpacity>
            </View>

            {serverUrl ? (
              <ConnectionQRCode value={serverUrl} size={210} />
            ) : (
              <View className="w-[210px] h-[210px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36]">
                <ActivityIndicator size="large" color="#0d8274" />
                <Text className="text-slate-400 text-xs mt-2 font-medium">Starting Web Server...</Text>
              </View>
            )}

            {serverUrl !== "" && (
              <View className="mt-5 bg-[#0c1318] border border-[#1f2d36] px-4 py-3 rounded-2xl items-center w-full">
                <Text className="text-slate-400 text-xs">Scan the QR code or copy this private link:</Text>
                <Text selectable className="text-[#10b981] text-sm font-extrabold mt-0.5 text-center">
                  {serverUrl}
                </Text>
              </View>
            )}

            {/* Android Emulator Tip Box */}
            {isEmulator && (
              <View className="mt-4 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl w-full">
                <View className="flex-row items-center gap-2 mb-1">
                  <MaterialCommunityIcons name="cellphone-cog" size={18} color="#f59e0b" />
                  <Text className="text-amber-400 text-xs font-bold">Android Emulator Detected</Text>
                </View>
                <Text className="text-slate-300 text-[11px] leading-4">
                  <Text className="font-semibold text-amber-200">10.0.2.x</Text> is an emulator internal IP and cannot be reached directly by Windows PC browsers.
                </Text>
                <Text className="text-slate-300 text-[11px] leading-4 mt-1">
                  To open in host PC browser: run <Text selectable className="font-mono text-emerald-400">adb forward tcp:8080 tcp:8080</Text> in terminal, then visit <Text selectable className="font-bold text-sky-400">http://localhost:8080</Text>.
                </Text>
              </View>
            )}
          </View>

          {/* Step-by-Step Instructions */}
          <Text className="text-white text-base font-bold mb-3">Connection Instructions</Text>

          <View className="gap-3">
            <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
              <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center shrink-0">
                <Text className="text-white text-sm font-bold">1</Text>
              </View>
              <Text className="text-slate-200 text-sm font-medium flex-1">
                Ensure phone and PC/Mac are connected to the same local Wi-Fi network (or physical Wi-Fi for mobile devices).
              </Text>
            </View>

            <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
              <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center shrink-0">
                <Text className="text-white text-sm font-bold">2</Text>
              </View>
              <Text className="text-slate-200 text-sm font-medium flex-1">
                Scan the QR code or copy the full private link into your PC browser. Keep the link private.
              </Text>
            </View>

            <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
              <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center shrink-0">
                <Text className="text-white text-sm font-bold">3</Text>
              </View>
              <Text className="text-slate-200 text-sm font-medium flex-1">
                Browse, search, and download your shared files directly from your PC browser!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
