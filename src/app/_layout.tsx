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
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="photos/index" />
          <Stack.Screen name="videos/index" />
          <Stack.Screen name="music/index" />
          <Stack.Screen name="downloads/index" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}