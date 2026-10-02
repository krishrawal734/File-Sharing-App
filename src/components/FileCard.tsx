import React, { memo } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SelectedFile } from "../types/file";
import { formatFileSize } from "../utils/fileUtils";

type FileCardProps = {
  file: SelectedFile;
  onRemove: (id: string) => void;
};

function FileCardComponent({ file, onRemove }: FileCardProps) {
  const getIcon = () => {
    switch (file.type) {
      case "image":
        return "image";
      case "video":
        return "video";
      case "audio":
        return "music-note";
      case "document":
        return "file-document-outline";
      default:
        return "file-outline";
    }
  };

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#141e24] border border-[#1f2d36] p-3.5 shadow-md">
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        <View className="w-12 h-12 rounded-xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
          <MaterialCommunityIcons name={getIcon()} size={22} color="#0d8274" />
        </View>

        <View className="flex-1">
          <Text className="text-white text-sm font-bold" numberOfLines={1}>
            {file.name}
          </Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            {formatFileSize(file.size)} • {file.type.toUpperCase()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(file.id)}
        activeOpacity={0.7}
        className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center"
      >
        <MaterialCommunityIcons name="close" size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

FileCardComponent.displayName = "FileCardComponent";
export default memo(FileCardComponent);