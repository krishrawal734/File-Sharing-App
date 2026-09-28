import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import DeviceCard from "../../components/DeviceCard";
import ConnectionQRCode from "../../components/ConnectionQRCode";

import { Device } from "../../types/device";
import { getLocalIpAddress } from "../../utils/networkUtils";

import {
  startLocalServer,
  stopLocalServer,
} from "../../server/localServer";

const nearbyDevices: Device[] = [
  {
    id: "1",
    name: "Rahul's Android",
    type: "android",
    connected: false,
  },
  {
    id: "2",
    name: "Krish's iPhone",
    type: "ios",
    connected: false,
  },
  {
    id: "3",
    name: "Office PC",
    type: "pc",
    connected: false,
  },
];

export default function DevicesScreen() {
  const [localIp, setLocalIp] = useState("");
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    const startConnection = async () => {
      try {
        // Get local IP
        const ip = await getLocalIpAddress();

        console.log("My local IP:", ip);

        setLocalIp(ip);

        // Start local server
        const url = await startLocalServer();

        console.log("Local server URL:", url);

        if (url) {
          setServerUrl(url);

          Alert.alert(
            "Server Started",
            url
          );
        }
      } catch (error) {
        console.log(
          "Connection setup error:",
          error
        );

        Alert.alert(
          "Connection Error",
          "Could not start the local server."
        );
      }
    };

    startConnection();

    return () => {
      stopLocalServer();
    };
  }, []);

  const handleConnect = (device: Device) => {
    console.log("Selected device:", device);

    router.push("/send/transfer");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">

        <AppHeader
          title="Connect Device"
          subtitle="Scan this QR code to connect"
        />

        {/* QR Code */}
        {serverUrl !== "" && (
          <ConnectionQRCode
            value={serverUrl}
          />
        )}

        <ScrollView
          className="mt-4"
          showsVerticalScrollIndicator={false}
        >
          {nearbyDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onConnect={handleConnect}
            />
          ))}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}