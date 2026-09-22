import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";
import FileCard from "../../components/FileCard";

import { SelectedFile, FileType } from "../../types/file";

export default function SelectFilesScreen() {
  const [files, setFiles] = useState<SelectedFile[]>([]);

  const getFileType = (
    mimeType?: string | null
  ): FileType => {
    if (!mimeType) {
      return "other";
    }

    if (mimeType.startsWith("image/")) {
      return "image";
    }

    if (mimeType.startsWith("video/")) {
      return "video";
    }

    if (mimeType.startsWith("audio/")) {
      return "audio";
    }

    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("text")
    ) {
      return "document";
    }

    return "other";
  };

  const pickPhotosAndVideos = async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos and videos."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsMultipleSelection: true,
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      const selectedFiles: SelectedFile[] =
        result.assets.map((asset: any) => ({
          id: `${asset.assetId ?? ""}-${asset.uri}-${Date.now()}`,
          name:
            asset.fileName ??
            asset.uri.split("/").pop() ??
            "Unknown file",
          size: asset.fileSize ?? 0,
          uri: asset.uri,
          type: getFileType(asset.mimeType),
          mimeType: asset.mimeType,
        }));

      setFiles((current) => [
        ...current,
        ...selectedFiles,
      ]);
    } catch (error: any) {
      Alert.alert(
        "Module Error",
        error?.message || "ImagePicker native module is not available."
      );
    }
  };

  const pickDocuments = async () => {
    try {
      const DocumentPicker = require("expo-document-picker");
      const result =
        await DocumentPicker.getDocumentAsync({
          type: "*/*",
          multiple: true,
          copyToCacheDirectory: true,
        });

      if (result.canceled) {
        return;
      }

      const selectedFiles: SelectedFile[] =
        result.assets.map((asset: any) => ({
          id: `${asset.uri}-${Date.now()}`,
          name: asset.name,
          size: asset.size ?? 0,
          uri: asset.uri,
          type: getFileType(asset.mimeType),
          mimeType: asset.mimeType,
        }));

      setFiles((current) => [
        ...current,
        ...selectedFiles,
      ]);
    } catch (error: any) {
      Alert.alert(
        "Module Error",
        error?.message || "DocumentPicker native module is not available."
      );
    }
  };

  const removeFile = (id: string) => {
    setFiles((current) =>
      current.filter((file) => file.id !== id)
    );
  };

  const totalSize = files.reduce(
    (total, file) => total + file.size,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">
        <AppHeader
          title="Select Files"
          subtitle="Choose files to send"
        />

        <View className="gap-3">
          <PrimaryButton
            title="📷 Photos & Videos"
            onPress={pickPhotosAndVideos}
          />

          <PrimaryButton
            title="📄 Documents & Files"
            onPress={pickDocuments}
          />
        </View>

        <View className="mt-6 flex-1">
          {files.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-center text-slate-500">
                No files selected yet.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <Text className="mb-3 text-lg font-bold text-slate-900">
                Selected Files ({files.length})
              </Text>

              {files.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="border-t border-slate-200 pt-4">
          <Text className="mb-3 text-center text-slate-500">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </Text>

          <PrimaryButton
            title={`Continue (${(totalSize / 1024 / 1024).toFixed(
              2
            )} MB)`}
            onPress={() => {
              if (files.length === 0) {
                Alert.alert(
                  "No files selected",
                  "Please select at least one file."
                );
                return;
              }

              router.push("/send/devices");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}