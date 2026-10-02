import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "file-document-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <View className="w-20 h-20 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center mb-4">
        <MaterialCommunityIcons name={icon} size={38} color="#64748b" />
      </View>
      <Text className="text-white text-lg font-bold text-center">{title}</Text>
      {description && (
        <Text className="text-slate-400 text-xs text-center mt-1.5 leading-5 max-w-xs">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.8}
          className="mt-5 bg-[#0d8274] px-5 py-2.5 rounded-xl active:bg-[#096358]"
        >
          <Text className="text-white text-sm font-bold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
