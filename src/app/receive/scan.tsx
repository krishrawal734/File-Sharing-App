import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [enableTorch, setEnableTorch] = useState(false);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] items-center justify-center">
        <ActivityIndicator size="large" color="#0d8274" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-[#0d8274]/20 items-center justify-center mb-4 border border-[#0d8274]/40">
          <MaterialCommunityIcons name="camera-off-outline" size={40} color="#0d8274" />
        </View>
        <Text className="text-white text-xl font-bold text-center mb-2">Camera Permission Required</Text>
        <Text className="text-slate-400 text-xs text-center leading-5 mb-6">
          Air—DropX needs camera access to scan QR codes for quick connection.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.85}
          className="w-full bg-[#0d8274] py-3.5 rounded-2xl items-center shadow-lg active:bg-[#096358]"
        >
          <Text className="text-white text-base font-bold">Grant Camera Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Camera View */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        enableTorch={enableTorch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                console.log("QR connection URL:", data);
                router.push({
                  pathname: "/receive/transfer",
                  params: { serverUrl: data },
                } as any);
              }
        }
      >
        {/* Top Header Overlay */}
        <SafeAreaView className="px-4 pt-3 flex-row items-center justify-between z-10 bg-black/40">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/20"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold">Scan QR Code</Text>

          <TouchableOpacity
            onPress={() => setEnableTorch(!enableTorch)}
            activeOpacity={0.7}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              enableTorch ? "bg-[#0d8274] border-white" : "bg-black/60 border-white/20"
            }`}
          >
            <MaterialCommunityIcons
              name={enableTorch ? "flashlight" : "flashlight-off"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Center Target Frame */}
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-[240px] h-[240px] border-2 border-[#0d8274] rounded-3xl relative items-center justify-center bg-[#0d8274]/5">
            <View className="w-12 h-12 border-t-4 border-l-4 border-[#10b981] absolute -top-1 -left-1 rounded-tl-xl" />
            <View className="w-12 h-12 border-t-4 border-r-4 border-[#10b981] absolute -top-1 -right-1 rounded-tr-xl" />
            <View className="w-12 h-12 border-b-4 border-l-4 border-[#10b981] absolute -bottom-1 -left-1 rounded-bl-xl" />
            <View className="w-12 h-12 border-b-4 border-r-4 border-[#10b981] absolute -bottom-1 -right-1 rounded-br-xl" />
          </View>
        </View>

        {/* Bottom Helper Bar */}
        <SafeAreaView className="pb-8 items-center justify-center px-6 z-10 bg-black/50">
          <View className="bg-slate-900/80 border border-slate-700/80 px-5 py-3 rounded-2xl items-center">
            <Text className="text-white text-xs font-semibold text-center">
              Align the QR code inside the frame to connect automatically
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}