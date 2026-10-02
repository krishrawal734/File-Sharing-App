import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search files...",
  onClear,
  className = "",
}: SearchBarProps) {
  return (
    <View className={`flex-row items-center bg-[#141e24] border border-[#1f2d36] rounded-2xl px-3.5 py-2.5 ${className}`}>
      <MaterialCommunityIcons name="magnify" size={20} color="#64748b" className="mr-2" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        className="flex-1 text-white text-sm py-0 font-medium"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText("");
            if (onClear) onClear();
          }}
          activeOpacity={0.7}
          className="w-6 h-6 rounded-full bg-slate-800 items-center justify-center ml-1"
        >
          <MaterialCommunityIcons name="close" size={14} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
}
