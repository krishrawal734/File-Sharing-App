import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, View } from "react-native";

import AppHeader from "../components/AppHeader";
import PrimaryButton from "../components/PrimaryButton";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      <View className="flex-1 px-5 pt-8 font-bold text-slate-900">
        <AppHeader
          title="File Share"
          subtitle="Share files with nearby devices "
        />

        <View className="gap-4">
          <PrimaryButton
            title="Send Files"
            onPress={() => router.push("/send")}
          />

          <PrimaryButton
            title="Receive Files"
            onPress={() => router.push("/receive")}
          />

          <PrimaryButton
            title="Transfer History"
            onPress={() => router.push("/history")}
          />

          <PrimaryButton
            title="Settings"
            onPress={() => router.push("/settings")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
