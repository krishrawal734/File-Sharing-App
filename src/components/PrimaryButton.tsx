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
      className="items-center justify-center rounded-2xl bg-[#0d8274] px-6 py-4 active:bg-[#08574e] shadow-sm"
    >
      <Text className="text-base font-bold text-white tracking-wide">
        {title}
      </Text>
    </Pressable>
  );
}