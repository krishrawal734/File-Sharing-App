import React from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type ConnectionQRCodeProps = {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
};

export default function ConnectionQRCode({
  value,
  size = 200,
  backgroundColor = "#FFFFFF",
  color = "#000000",
}: ConnectionQRCodeProps) {
  return (
    <View className="m-4 items-center justify-center rounded-2xl bg-white p-4 shadow-md">
      <QRCode value={value} size={size} backgroundColor={backgroundColor} color={color} />
    </View>
  );
}