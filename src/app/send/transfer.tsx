import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";

export default function TransferScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader title="Transfer" subtitle="Sending files" />

        <View className="rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-slate-900">
            example-video.mp4
          </Text>

          <Text className="mt-2 text-slate-500">250 MB</Text>

          <View className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
            <View className="h-full w-2/5 rounded-full bg-blue-600" />
          </View>

          <Text className="mt-3 text-slate-600">40% completed</Text>

          <View className="mt-4 flex-row justify-between">
            <Text className="text-slate-500">Speed: 8.5 MB/s</Text>

            <Text className="text-slate-500">ETA: 18 sec</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
