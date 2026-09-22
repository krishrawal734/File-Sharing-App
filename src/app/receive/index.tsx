import { router } from "expo-router";
import { SafeAreaView, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";

export default function ReceiveScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Receive Files"
          subtitle="Connect with a nearby sender"
        />

        <View className="mt-4">
          <PrimaryButton
            title="Scan QR Code"
            onPress={() => router.push("/receive/scan")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
