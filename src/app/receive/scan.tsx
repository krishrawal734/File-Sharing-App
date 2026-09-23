import { router } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";

export default function ScanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Scan QR" subtitle="Scan the sender's QR code" />

        <View className="flex-1 items-center justify-center">
          <View className="h-64 w-64 items-center justify-center rounded-2xl bg-slate-200">
            <Text className="text-slate-500">QR Scanner</Text>
          </View>
        </View>

        <View className="pb-6 mb-10">
          <PrimaryButton
            title="Connect"
            onPress={() => router.push("/receive/transfer")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
