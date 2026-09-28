import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Button,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

export default function ScanScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center">
          Camera permission is required.
        </Text>

        <Button
          title="Allow Camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);

                console.log(
                  "QR connection URL:",
                  data
                );

                // Open receiver transfer screen
                router.push({
                  pathname: "/receive/transfer",
                  params: {
                    serverUrl: data,
                  },
                });
              }
        }
      />

      <View className="absolute bottom-10 left-0 right-0 items-center">
        <Text className="rounded-xl bg-black/70 px-5 py-3 text-white">
          Scan the sender QR code
        </Text>
      </View>
    </View>
  );
}