import { router } from "expo-router";
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



import AppHeader from "../../components/AppHeader";

export default function ReceiveScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Receive Files"
          subtitle="Connect with a nearby sender"
        />

        <View className="mt-4">
          <Pressable
  onPress={() => router.push("/receive/scan")}
  className="rounded-xl bg-blue-600 px-5 py-4"
>
  <Text className="text-center font-semibold text-white">
    Scan QR Code
  </Text>
</Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
