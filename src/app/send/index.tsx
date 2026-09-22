import { router } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";

export default function SendScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Send Files" subtitle="Choose files to send" />

        <View className="rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-slate-900">
            Ready to send?
          </Text>

          <Text className="mt-2 text-slate-500">
            Select photos, videos, documents or other files.
          </Text>

          <View className="mt-6">
            <PrimaryButton
              title="Select Files"
              onPress={() => router.push("/send/files")}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
