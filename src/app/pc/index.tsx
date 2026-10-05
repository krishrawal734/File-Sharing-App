import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AppHeader from "../../components/AppHeader";
import ConnectionQRCode from "../../components/ConnectionQRCode";
import { startLocalServer, stopLocalServer } from "../../server/localServer";

export default function PCConnectScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [connectionState, setConnectionState] = useState<"searching" | "connected" | "disconnected">("searching");

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

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Connect to PC / Mac" subtitle="Air—DropX Web Transfer" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Main QR Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 items-center shadow-xl mb-6">
          <View className="flex-row items-center gap-2 mb-4 bg-[#0d8274]/20 border border-[#0d8274]/40 px-3 py-1 rounded-full">
            <View className="w-2 h-2 rounded-full bg-[#10b981]" />
            <Text className="text-[#10b981] text-xs font-bold capitalize">
              Status: {connectionState}
            </Text>
          </View>

          {serverUrl ? (
            <ConnectionQRCode value={serverUrl} size={200} />
          ) : (
            <View className="w-[200px] h-[200px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36]">
              <ActivityIndicator size="large" color="#0d8274" />
              <Text className="text-slate-400 text-xs mt-2 font-medium">Starting Web Server...</Text>
            </View>
          )}

          {serverUrl !== "" && (
            <View className="mt-4 bg-[#0c1318] border border-[#1f2d36] px-4 py-2.5 rounded-2xl items-center w-full">
              <Text className="text-slate-400 text-xs">Or open this address in PC Browser:</Text>
              <Text className="text-[#10b981] text-base font-extrabold mt-0.5 tracking-wide">
                {serverUrl}
              </Text>
            </View>
          )}
        </View>

        {/* Step-by-Step Instructions */}
        <Text className="text-white text-base font-bold mb-3">Connection Instructions</Text>

        <View className="gap-3">
          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
            <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center">
              <Text className="text-white text-sm font-bold">1</Text>
            </View>
            <Text className="text-slate-200 text-sm font-medium flex-1">
              Ensure phone and PC/Mac are on the same Wi-Fi network.
            </Text>
          </View>

          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
            <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center">
              <Text className="text-white text-sm font-bold">2</Text>
            </View>
            <Text className="text-slate-200 text-sm font-medium flex-1">
              Open Chrome, Safari, or Edge on your PC and enter the URL shown above (e.g. {serverUrl || "http://192.168.x.x:8080"}).
            </Text>
          </View>

          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3.5">
            <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center">
              <Text className="text-white text-sm font-bold">3</Text>
            </View>
            <Text className="text-slate-200 text-sm font-medium flex-1">
              Enjoy the Web Dashboard in your browser! Filter files by category, preview images, and download files with a single click.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
