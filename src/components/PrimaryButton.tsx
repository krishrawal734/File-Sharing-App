import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const getBgColor = () => {
    if (disabled) return "bg-slate-800 opacity-60";
    switch (variant) {
      case "secondary":
        return "bg-slate-800 active:bg-slate-700 border border-slate-700";
      case "danger":
        return "bg-red-600 active:bg-red-700";
      case "ghost":
        return "bg-transparent active:bg-slate-800/50";
      default:
        return "bg-[#0d8274] active:bg-[#096358]";
    }
  };

  const getTextColor = () => {
    if (variant === "secondary" || variant === "ghost") return "text-white";
    return "text-white";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-2xl px-6 py-4 shadow-md ${getBgColor()} ${className}`}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon && <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" />}
          <Text className={`text-base font-bold tracking-wide ${getTextColor()}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}