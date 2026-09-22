import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center rounded-xl bg-blue-600 px-6 py-4"
    >
      <Text className="text-base font-bold text-white">
        {title}
      </Text>
    </Pressable>
  );
}