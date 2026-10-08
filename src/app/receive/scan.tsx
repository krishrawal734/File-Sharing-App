import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { QRCodeConnectionService } from "../../services/qr/QRCodeConnectionService";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [enableTorch, setEnableTorch] = useState(false);

  // Reset scanned state when returning to screen
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    console.log("[AirDropX:Scan] Scanned QR raw data:", data);
    const result = QRCodeConnectionService.parseQRSession(data);

    if (!result.success) {
      let title = "Invalid QR Code";
      let message = "This QR code is not recognized by Air-DropX.";

      if (result.error === "EXPIRED") {
        title = "QR Code Expired";
        message = "This QR code has expired. Please ask the sender to tap 'Regenerate QR'.";
      } else if (result.error === "CANCELLED") {
        title = "Session Cancelled";
        message = "This sharing session was stopped or cancelled by the sender.";
      }

      Alert.alert(title, message, [
        {
          text: "Scan Again",
          onPress: () => setScanned(false),
        },
      ]);
      return;
    }

    const { payload } = result;
    console.log(`[AirDropX:Scan] Connected to ${payload.deviceName} at ${payload.serverUrl}`);

    router.push({
      pathname: "/receive/transfer",
      params: {
        serverUrl: payload.serverUrl,
        senderName: payload.deviceName,
        sessionId: payload.sessionId,
      },
    } as any);
  };

  const handleRequestPermission = async () => {
    if (permission && !permission.canAskAgain) {
      Linking.openSettings().catch(() => {
        Alert.alert("Permission Error", "Please open your phone settings and allow camera access for Air-DropX.");
      });
      return;
    }
    await requestPermission();
  };

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
          onPress={handleRequestPermission}
          activeOpacity={0.85}
          className="w-full bg-[#0d8274] py-3.5 rounded-2xl items-center shadow-lg active:bg-[#096358]"
        >
          <Text className="text-white text-base font-bold">
            {!permission.canAskAgain ? "Open Phone Settings" : "Grant Camera Access"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Live Camera View with overlay elements as direct children */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={enableTorch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Top Navigation Header */}
        <SafeAreaView style={styles.headerSafeArea} edges={["top", "left", "right"]}>
          <View className="px-4 py-3 flex-row items-center justify-between ">
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/20"
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="text-white text-base font-bold">Scan QR Code</Text>

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
          </View>
        </SafeAreaView>

        {/* Centered Target Scanner Frame & Helper Text */}
        <View style={styles.finderContainer}>
          <View className="w-[240px] h-[240px] border-2 border-[#0d8274] rounded-3xl relative items-center justify-center bg-[#0d8274]/10">
            <View className="w-10 h-10 border-t-4 border-l-4 border-[#10b981] absolute -top-1 -left-1 rounded-tl-xl" />
            <View className="w-10 h-10 border-t-4 border-r-4 border-[#10b981] absolute -top-1 -right-1 rounded-tr-xl" />
            <View className="w-10 h-10 border-b-4 border-l-4 border-[#10b981] absolute -bottom-1 -left-1 rounded-bl-xl" />
            <View className="w-10 h-10 border-b-4 border-r-4 border-[#10b981] absolute -bottom-1 -right-1 rounded-br-xl" />
          </View>
          <Text className="text-slate-200 text-xs font-medium mt-6 bg-black/70 px-4 py-2 rounded-xl text-center">
            Align QR code within frame to connect automatically
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  headerSafeArea: {
    width: "100%",
  },
  finderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
});