import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";

export default function ReceiveTransferScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Receiving" subtitle="Files are being received" />

        <View className="rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-slate-900">photos.zip</Text>

          <Text className="mt-2 text-slate-500">120 MB</Text>

          <View className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
            <View className="h-full w-3/5 rounded-full bg-blue-600" />
          </View>

          <Text className="mt-3 text-slate-600">60% completed</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
