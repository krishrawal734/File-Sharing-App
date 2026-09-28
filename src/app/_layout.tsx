import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";

import { initializeDatabase } from "../database/database";

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log(
          "Database ready."
        );
      })
      .catch((error) => {
        console.log(
          "Database initialization error:",
          error
        );
      });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}