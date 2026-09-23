import { SafeAreaView, ScrollView, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import DeviceCard from "../../components/DeviceCard";

import { Device } from "../../types/device";

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
  const handleConnect = (device: Device) => {
    console.log("Selected device:", device);

    router.push("/send/transfer");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Connect Device"
          subtitle="Choose a nearby device"
        />

        <ScrollView
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
