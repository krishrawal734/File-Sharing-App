import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/AppHeader";

export default function HistoryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Transfer History"
          subtitle="Your previous transfers"
        />

        <View className="rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-slate-900">
            sample-file.pdf
          </Text>

          <Text className="mt-2 text-slate-500">Sent • 5 MB</Text>

          <Text className="mt-2 font-semibold text-green-600">Completed</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
