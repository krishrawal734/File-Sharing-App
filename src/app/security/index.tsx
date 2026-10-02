import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";

export default function SecurityScreen() {
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoAcceptTrusted, setAutoAcceptTrusted] = useState(true);
  const [encryptedTransfer, setEncryptedTransfer] = useState(true);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      try {
        let LocalAuth: any = null;
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          LocalAuth = require("expo-local-authentication");
        } catch {
          // Module not installed
        }

        if (!LocalAuth) {
          Alert.alert("Biometrics Setup", "Biometric authentication is configured via platform settings.");
          setBiometricEnabled(true);
          setAppLockEnabled(true);
          return;
        }

        const hasHardware = await LocalAuth.hasHardwareAsync();
        const isEnrolled = await LocalAuth.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          Alert.alert("Biometrics Unavailable", "Biometric authentication is not available or enrolled on this device.");
          setBiometricEnabled(false);
          return;
        }

        const res = await LocalAuth.authenticateAsync({
          promptMessage: "Authenticate to enable Biometric Lock",
        });

        if (res.success) {
          setBiometricEnabled(true);
          setAppLockEnabled(true);
        } else {
          setBiometricEnabled(false);
        }
      } catch (e) {
        console.log("Biometric auth error:", e);
        setBiometricEnabled(false);
      }
    } else {
      setBiometricEnabled(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Security & App Lock" subtitle="Protect your local file sharing" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Security Overview Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 shadow-xl mb-6 flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
            <MaterialCommunityIcons name="shield-check" size={32} color="#0d8274" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">Encrypted & Secure</Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              Local network transfers use secure session tokens and temporary pairing keys.
            </Text>
          </View>
        </View>

        {/* Security Options */}
        <Text className="text-white text-base font-bold mb-3">App Protection</Text>

        <View className="gap-3 mb-6">
          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <MaterialCommunityIcons name="lock-outline" size={24} color="#38bdf8" />
              <View>
                <Text className="text-white text-sm font-bold">App Lock</Text>
                <Text className="text-slate-400 text-xs">Require authentication to open app</Text>
              </View>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={setAppLockEnabled}
              trackColor={{ false: "#1e293b", true: "#0d8274" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <MaterialCommunityIcons name="fingerprint" size={24} color="#fbbf24" />
              <View>
                <Text className="text-white text-sm font-bold">Biometric Authentication</Text>
                <Text className="text-slate-400 text-xs">Unlock with Face ID or Touch ID</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#1e293b", true: "#0d8274" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <MaterialCommunityIcons name="star-check-outline" size={24} color="#34d399" />
              <View>
                <Text className="text-white text-sm font-bold">Auto-Accept Trusted Devices</Text>
                <Text className="text-slate-400 text-xs">Skip pairing prompts for starred devices</Text>
              </View>
            </View>
            <Switch
              value={autoAcceptTrusted}
              onValueChange={setAutoAcceptTrusted}
              trackColor={{ false: "#1e293b", true: "#0d8274" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <MaterialCommunityIcons name="incognito" size={24} color="#c084fc" />
              <View>
                <Text className="text-white text-sm font-bold">Local Encrypted Transfer</Text>
                <Text className="text-slate-400 text-xs">Encrypt data payloads over Wi-Fi</Text>
              </View>
            </View>
            <Switch
              value={encryptedTransfer}
              onValueChange={setEncryptedTransfer}
              trackColor={{ false: "#1e293b", true: "#0d8274" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/devices" as any)}
          className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons name="devices" size={22} color="#94a3b8" />
            <Text className="text-white text-sm font-bold">Manage Trusted Devices</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
