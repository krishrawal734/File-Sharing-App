import { Pressable, Text, View } from "react-native";

import { SelectedFile } from "../types/file";
import { formatFileSize } from "../utils/fileUtils";

type FileCardProps = {
  file: SelectedFile;
  onRemove: (id: string) => void;
};

export default function FileCard({
  file,
  onRemove,
}: FileCardProps) {
  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-white p-4">
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Text className="text-xl">
          {file.type === "image"
            ? "🖼️"
            : file.type === "video"
            ? "🎥"
            : file.type === "audio"
            ? "🎵"
            : "📄"}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          className="font-semibold text-slate-900"
          numberOfLines={1}
        >
          {file.name}
        </Text>

        <Text className="mt-1 text-sm text-slate-500">
          {formatFileSize(file.size)}
        </Text>
      </View>

      <Pressable
        onPress={() => onRemove(file.id)}
        className="ml-3 rounded-full bg-red-50 px-3 py-2"
      >
        <Text className="font-bold text-red-600">
          ✕
        </Text>
      </Pressable>
    </View>
  );
}