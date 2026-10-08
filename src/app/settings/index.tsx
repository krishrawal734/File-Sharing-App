import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AppHeader from "../../components/AppHeader";

export default function SettingsScreen() {
  const [deviceName, setDeviceName] = useState("Air—DropX Device");

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Settings" subtitle="Manage your Air—DropX preferences" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* GENERAL */}
        <Text className="text-[#0d8274] text-xs font-bold uppercase tracking-wider mb-2">General</Text>
        <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 mb-5 gap-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-sm font-bold">Device Name</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{deviceName}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.prompt
                  ? Alert.prompt("Rename Device", "Enter new device name", (val) => {
                      if (val?.trim()) setDeviceName(val.trim());
                    })
                  : Alert.alert("Device Name", "Change device name in system settings.")
              }
            >
              <Text className="text-[#0d8274] text-xs font-bold">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-[#1f2d36]" />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-sm font-bold">App Theme</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Dark Mode (Default)</Text>
            </View>
            <Text className="text-slate-500 text-xs font-semibold">Dark</Text>
          </View>
        </View>

        {/* ABOUT */}
        <Text className="text-[#0d8274] text-xs font-bold uppercase tracking-wider mb-2">About</Text>
        <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 mb-5 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-bold">Application Name</Text>
            <Text className="text-slate-300 text-xs font-semibold">Air—DropX</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-bold">Version</Text>
            <Text className="text-slate-400 text-xs font-semibold">v1.0.0 (Expo SDK 57)</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-bold">Tagline</Text>
            <Text className="text-slate-400 text-xs font-semibold">Fast. Private. Simple. Everywhere.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
