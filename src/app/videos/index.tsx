import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../../components/BottomNavigation";

export default function VideosScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-white text-xl font-bold">Videos</Text>
      </View>
      <BottomNavigation currentTab="videos" />
    </SafeAreaView>
  );
}
