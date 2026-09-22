import { router } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";

export default function DevicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Connect Device"
          subtitle="Connect to a nearby device"
        />

        <View className="rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-slate-900">
            QR Connection
          </Text>

          <View className="mt-5 h-48 items-center justify-center rounded-xl bg-slate-100">
            <Text className="text-slate-500">QR Code</Text>
          </View>

          <Text className="mt-4 text-center text-slate-500">
            Real QR generation will be added on Day 3.
          </Text>
        </View>

        <View className="mt-auto pb-6">
          <PrimaryButton
            title="Start Transfer"
            onPress={() => router.push("/send/transfer")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
