import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../../components/AppHeader";
import ConnectionQRCode from "../../components/ConnectionQRCode";
import ConnectionRequestModal from "../../components/ConnectionRequestModal";
import NearbyDeviceCard from "../../components/NearbyDeviceCard";
import { useNearbyDevices } from "../../hooks/useNearbyDevices";

import { startLocalServer, stopLocalServer } from "../../server/localServer";
import { NearbyDevice } from "../../types/device";
import {
  QRCodeConnectionService,
  QRSessionPayload,
} from "../../services/qr/QRCodeConnectionService";

export default function DevicesScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [qrPayload, setQrPayload] = useState<QRSessionPayload | null>(null);
  const [loadingServer, setLoadingServer] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<NearbyDevice | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 300 seconds (5 min)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    discoveredDevices,
    connectionSession,
    requestConnection,
    acceptConnection,
    rejectConnection,
    disconnect,
    toggleTrustDevice,
  } = useNearbyDevices();

  const startSession = async () => {
    try {
      setLoadingServer(true);
      const url = await startLocalServer();
      if (url) {
        setServerUrl(url);
        // Extract port if present in URL
        const match = url.match(/:(\d+)/);
        const port = match ? parseInt(match[1], 10) : 8080;
        const payload = await QRCodeConnectionService.generateQRSession(port);
        setQrPayload(payload);
        setTimeLeft(Math.max(0, Math.floor((payload.expiresAt - Date.now()) / 1000)));
      }
    } catch (error) {
      console.log("Connection setup error:", error);
    } finally {
      setLoadingServer(false);
    }
  };

  useEffect(() => {
    startSession();

    return () => {
      if (qrPayload?.token) {
        QRCodeConnectionService.invalidateSession(qrPayload.token);
      }
      stopLocalServer();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Expiry countdown timer effect
  useEffect(() => {
    if (!qrPayload) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((qrPayload.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrPayload]);

  const handleRegenerateQR = async () => {
    if (qrPayload?.token) {
      QRCodeConnectionService.invalidateSession(qrPayload.token);
    }
    await startSession();
  };

  const handleStopSharing = () => {
    if (qrPayload?.token) {
      QRCodeConnectionService.invalidateSession(qrPayload.token);
    }
    setQrPayload(null);
    setServerUrl("");
    stopLocalServer();
  };

  const handleConnect = async (device: NearbyDevice) => {
    setSelectedDevice(device);
    await requestConnection(device);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <SafeAreaView
      className="flex-1 bg-[#090d10]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader
          title="Connect Device"
          subtitle="Scan QR code or select a nearby device"
        />
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* QR Code Section Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 items-center shadow-xl mb-6">
          <View className="flex-row items-center justify-between w-full mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
                <MaterialCommunityIcons
                  name="qrcode"
                  size={18}
                  color="#0d8274"
                />
              </View>
              <Text className="text-white text-base font-bold">
                Session QR Code
              </Text>
            </View>

            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full border ${
                serverUrl && !isExpired
                  ? "bg-[#10b981]/15 border-[#10b981]/30"
                  : "bg-red-500/15 border-red-500/30"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${
                  serverUrl && !isExpired ? "bg-[#10b981]" : "bg-red-500"
                }`}
              />
              <Text
                className={`text-[11px] font-bold ${
                  serverUrl && !isExpired ? "text-[#10b981]" : "text-red-400"
                }`}
              >
                {loadingServer
                  ? "Starting..."
                  : isExpired
                  ? "QR Expired"
                  : serverUrl
                  ? "Server Active"
                  : "Server Offline"}
              </Text>
            </View>
          </View>

          {loadingServer ? (
            <View className="w-[200px] h-[200px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36] my-2">
              <ActivityIndicator size="large" color="#0d8274" />
              <Text className="text-slate-400 text-xs mt-3 font-medium">
                Generating unique session QR...
              </Text>
            </View>
          ) : serverUrl !== "" && qrPayload && !isExpired ? (
            <View className="items-center">
              <ConnectionQRCode
                value={JSON.stringify(qrPayload)}
                size={180}
              />
              <View className="flex-row items-center gap-1.5 mt-1 bg-[#0c1318] px-3 py-1.5 rounded-full border border-[#1f2d36]">
                <MaterialCommunityIcons name="clock-outline" size={14} color="#38bdf8" />
                <Text className="text-sky-400 text-xs font-semibold">
                  Expires in {formatTimer(timeLeft)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="w-[200px] h-[200px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36] my-2 px-4">
              <MaterialCommunityIcons
                name={isExpired ? "clock-alert-outline" : "wifi-off"}
                size={36}
                color="#ef4444"
              />
              <Text className="text-slate-300 text-xs mt-2 text-center font-semibold">
                {isExpired
                  ? "QR Code Expired"
                  : "Sharing session is inactive"}
              </Text>
              <Text className="text-slate-400 text-[11px] text-center mt-1">
                {isExpired
                  ? "Tap Regenerate QR to create a fresh secure session token"
                  : "Tap Start Server to begin local Wi-Fi sharing"}
              </Text>
            </View>
          )}

          {serverUrl !== "" && (
            <View className="mt-3 bg-[#0c1318] border border-[#1f2d36] px-4 py-2.5 rounded-xl items-center w-full">
              <Text className="text-slate-400 text-[11px]">
                Local Wi-Fi Server Endpoint:
              </Text>
              <Text selectable className="text-[#0d8274] text-xs font-bold mt-0.5">
                {serverUrl}
              </Text>
            </View>
          )}

          {/* QR Action Buttons: Regenerate & Stop */}
          <View className="flex-row gap-3 w-full mt-4">
            <TouchableOpacity
              onPress={handleRegenerateQR}
              activeOpacity={0.8}
              className="flex-1 bg-[#0d8274]/20 border border-[#0d8274]/40 py-2.5 rounded-xl flex-row items-center justify-center gap-2"
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#0d8274" />
              <Text className="text-[#0d8274] text-xs font-bold">
                Regenerate QR
              </Text>
            </TouchableOpacity>

            {serverUrl !== "" && (
              <TouchableOpacity
                onPress={handleStopSharing}
                activeOpacity={0.8}
                className="px-4 bg-red-500/10 border border-red-500/30 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
              >
                <MaterialCommunityIcons name="stop-circle-outline" size={18} color="#f87171" />
                <Text className="text-red-400 text-xs font-bold">
                  Stop
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Nearby Devices Section */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="radar" size={20} color="#0d8274" />
            <Text className="text-white text-base font-bold">
              Nearby Devices
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/devices" as any)}
          >
            <Text className="text-[#0d8274] text-xs font-bold">Radar Search</Text>
          </TouchableOpacity>
        </View>

        {discoveredDevices.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/devices" as any)}
            className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-6 items-center justify-center"
          >
            <MaterialCommunityIcons name="radar" size={36} color="#0d8274" />
            <Text className="text-white text-sm font-bold mt-2">
              Searching for Nearby Devices...
            </Text>
            <Text className="text-slate-400 text-xs mt-1 text-center">
              Tap to open full radar discovery on your local network
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="gap-2">
            {discoveredDevices.map((device) => (
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

      {/* CONNECTION REQUEST MODAL */}
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
