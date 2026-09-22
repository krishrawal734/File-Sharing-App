import { Text, View } from "react-native";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({
  title,
  subtitle,
}: AppHeaderProps) {
  return (
    <View className="mb-6">
      <Text className="text-3xl font-bold text-slate-900">
        {title}
      </Text>

      {subtitle && (
        <Text className="mt-1 text-base text-slate-500">
          {subtitle}
        </Text>
      )}
    </View>
  );
}