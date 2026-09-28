import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type ConnectionQRCodeProps = {
  value: string;
};

export default function ConnectionQRCode({
  value,
}: ConnectionQRCodeProps) {
  return (
    <View className="m-5 items-center justify-center rounded-2xl bg-white p-5">
      <QRCode
        value={value}
        size={220}
      />
    </View>
  );
}