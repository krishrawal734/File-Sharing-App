import { router } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";

export default function SelectFilesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Select Files" subtitle="Choose files for transfer" />

        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-base text-slate-500">
            File picker will be added on Day 2.
          </Text>
        </View>

        <View className="pb-6">
          <PrimaryButton
            title="Continue"
            onPress={() => router.push("/send/devices")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
