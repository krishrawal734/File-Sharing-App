import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { getLocalIpAddress } from "../../utils/networkUtils";

export default function DevicesScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [localIp, setLocalIp] = useState("");
  const [loadingServer, setLoadingServer] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<NearbyDevice | null>(
    null,
  );

  const {
    discoveredDevices,
    connectionSession,
    requestConnection,
    acceptConnection,
    rejectConnection,
    disconnect,
    toggleTrustDevice,
  } = useNearbyDevices();

  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      try {
        const ip = await getLocalIpAddress();
        if (isMounted && ip) setLocalIp(ip);

        const url = await startLocalServer();
        if (isMounted && url) {
          setServerUrl(url);
        }
      } catch (error) {
        console.log("Connection setup error:", error);
      } finally {
        if (isMounted) setLoadingServer(false);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      stopLocalServer();
    };
  }, []);

  const handleConnect = async (device: NearbyDevice) => {
    setSelectedDevice(device);
    await requestConnection(device);
  };

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
                QR Connection
              </Text>
            </View>

            <View className="flex-row items-center bg-[#10b981]/15 border border-[#10b981]/30 px-2.5 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#10b981] mr-1.5" />
              <Text className="text-[#10b981] text-[11px] font-bold">
                Server Active
              </Text>
            </View>
          </View>

          {loadingServer ? (
            <View className="w-[200px] h-[200px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36] my-2">
              <ActivityIndicator size="large" color="#0d8274" />
              <Text className="text-slate-400 text-xs mt-3 font-medium">
                Starting local server...
              </Text>
            </View>
          ) : serverUrl !== "" ? (
            <ConnectionQRCode value={serverUrl} size={190} />
          ) : (
            <View className="w-[200px] h-[200px] bg-[#0c1318] rounded-2xl items-center justify-center border border-[#1f2d36] my-2">
              <MaterialCommunityIcons
                name="wifi-off"
                size={36}
                color="#ef4444"
              />
              <Text className="text-slate-400 text-xs mt-2 text-center px-4">
                Local Wi-Fi server unavailable. Reconnecting...
              </Text>
            </View>
          )}

          {localIp !== "" && (
            <View className="mt-3 bg-[#0c1318] border border-[#1f2d36] px-4 py-2 rounded-xl items-center w-full">
              <Text className="text-slate-400 text-[11px]">
                Local Wi-Fi Endpoint:
              </Text>
              <Text className="text-white text-xs font-bold mt-0.5 tracking-wide">
                {serverUrl || `http://${localIp}:8080`}
              </Text>
            </View>
          )}
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
            <Text className="text-[#0d8274] text-xs font-bold"></Text>
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
