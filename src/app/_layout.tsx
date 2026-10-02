import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { initializeDatabase } from "../database/database";

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log("Database ready.");
      })
      .catch((error) => {
        console.log("Database initialization error:", error);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="photos/index" />
          <Stack.Screen name="videos/index" />
          <Stack.Screen name="music/index" />
          <Stack.Screen name="downloads/index" />
          <Stack.Screen name="send/index" />
          <Stack.Screen name="send/files" />
          <Stack.Screen name="send/devices" />
          <Stack.Screen name="send/transfer" />
          <Stack.Screen name="receive/index" />
          <Stack.Screen name="receive/scan" />
          <Stack.Screen name="receive/transfer" />
          <Stack.Screen name="pc/index" />
          <Stack.Screen name="devices/index" />
          <Stack.Screen name="file-manager/index" />
          <Stack.Screen name="history/index" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="security/index" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}