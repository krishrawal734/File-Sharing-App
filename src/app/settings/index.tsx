import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Settings" subtitle="Manage your File Share app" />

        <View className="gap-3">
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-base font-bold text-slate-900">
              Device Name
            </Text>

            <Text className="mt-1 text-slate-500">My Device</Text>
          </View>

          <View className="rounded-2xl bg-white p-5">
            <Text className="text-base font-bold text-slate-900">Storage</Text>

            <Text className="mt-1 text-slate-500">Manage received files</Text>
          </View>

          <View className="rounded-2xl bg-white p-5">
            <Text className="text-base font-bold text-slate-900">About</Text>

            <Text className="mt-1 text-slate-500">File Share MVP</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
