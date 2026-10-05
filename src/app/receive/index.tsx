import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";

export default function ReceiveScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Receive Files" subtitle="Waiting for nearby sender connection" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Radar Radar Waiting Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-6 items-center shadow-xl mb-6">
          <View className="w-24 h-24 rounded-full bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center mb-4 relative">
            <View className="w-16 h-16 rounded-full bg-[#0d8274]/30 items-center justify-center">
              <MaterialCommunityIcons name="radar" size={36} color="#0d8274" />
            </View>
          </View>

          <Text className="text-white text-lg font-bold text-center">Waiting for Connection...</Text>
          <Text className="text-slate-400 text-xs text-center mt-1 leading-5">
            Keep Air—DropX open on this screen so nearby senders can discover your device.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/receive/scan" as any)}
            className="mt-5 bg-[#0d8274] px-6 py-3 rounded-2xl flex-row items-center gap-2 shadow-md active:bg-[#096358]"
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFFFFF" />
            <Text className="text-white text-sm font-bold">Scan Sender QR Code</Text>
          </TouchableOpacity>
        </View>

        
        

        {/* Quick Connection Options */}
        <Text className="text-white text-base font-bold mb-3">Connection Options</Text>

        <View className="gap-3">

          <TouchableOpacity
            onPress={() => router.push("/receive/scan" as any)}
            className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
                <MaterialCommunityIcons name="qrcode-scan" size={22} color="#c084fc" />
              </View>
              <View>
                <Text className="text-white text-sm font-bold">Scan QR Code</Text>
                <Text className="text-slate-400 text-xs">Scan sender&apos;s Air—DropX QR code</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/devices" as any)}
            className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="w-10 h-10 rounded-xl bg-sky-500/20 items-center justify-center">
                <MaterialCommunityIcons name="radar" size={22} color="#38bdf8" />
              </View>
              <View>
                <Text className="text-white text-sm font-bold">Nearby Senders</Text>
                <Text className="text-slate-400 text-xs">View active senders on local network</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
