import React, { useState } from "react";
import { Alert, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import FileCard from "../../components/FileCard";
import { SelectedFile, FileType } from "../../types/file";
import { clearSharedFiles, copyFileToServer } from "../../server/localServer";

export default function SelectFilesScreen() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [copying, setCopying] = useState(false);

  const getFileType = (mimeType?: string | null): FileType => {
    if (!mimeType) return "other";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
      return "document";
    }
    return "other";
  };

  const addFilesToServer = async (selectedFiles: SelectedFile[]) => {
    try {
      setCopying(true);
      await clearSharedFiles();

      const BATCH_SIZE = 4;
      for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
        const chunk = selectedFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(chunk.map((file) => copyFileToServer(file.uri, file.name)));
        await new Promise((res) => setTimeout(res, 10));
      }

      setFiles((current) => [...current, ...selectedFiles]);
    } catch (error: any) {
      console.log("File copy error:", error);
      Alert.alert("Copy Failed", error?.message || "Could not copy selected files.");
    } finally {
      setCopying(false);
    }
  };

  const pickPhotosAndVideos = async () => {
    try {
      let ImagePicker: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ImagePicker = require("expo-image-picker");
      } catch {
        // Module fallback
      }

      if (!ImagePicker) return;

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow access to your media library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      const selectedFiles: SelectedFile[] = result.assets.map((asset: any) => ({
        id: `${asset.assetId ?? ""}-${asset.uri}-${Date.now()}`,
        name: asset.fileName ?? asset.uri.split("/").pop() ?? "Unknown file",
        size: asset.fileSize ?? 0,
        uri: asset.uri,
        type: getFileType(asset.mimeType),
        mimeType: asset.mimeType,
      }));

      await addFilesToServer(selectedFiles);
    } catch (error: any) {
      Alert.alert("Module Error", error?.message || "ImagePicker native module unavailable.");
    }
  };

  const pickDocuments = async () => {
    try {
      let DocumentPicker: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        DocumentPicker = require("expo-document-picker");
      } catch {
        // Module fallback
      }

      if (!DocumentPicker) return;

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selectedFiles: SelectedFile[] = result.assets.map((asset: any) => ({
        id: `${asset.uri}-${Date.now()}`,
        name: asset.name,
        size: asset.size ?? 0,
        uri: asset.uri,
        type: getFileType(asset.mimeType),
        mimeType: asset.mimeType,
      }));

      await addFilesToServer(selectedFiles);
    } catch (error: any) {
      Alert.alert("Module Error", error?.message || "DocumentPicker native module unavailable.");
    }
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  };

  const totalSize = files.reduce((total, file) => total + file.size, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Select Files" subtitle="Choose files to share" />
      </View>

      <View className="flex-1 p-4">
        {/* Buttons Grid */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={copying ? () => {} : pickPhotosAndVideos}
            activeOpacity={0.8}
            className="flex-1 rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-center gap-2.5 shadow-md"
          >
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#0d8274" />
            <Text className="text-white text-sm font-bold">Photos & Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={copying ? () => {} : pickDocuments}
            activeOpacity={0.8}
            className="flex-1 rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-center gap-2.5 shadow-md"
          >
            <MaterialCommunityIcons name="file-document-outline" size={22} color="#38bdf8" />
            <Text className="text-white text-sm font-bold">Documents</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Files List */}
        <View className="flex-1">
          {copying ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0d8274" />
              <Text className="text-slate-400 text-xs mt-3 font-medium">Preparing files...</Text>
            </View>
          ) : files.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <MaterialCommunityIcons name="folder-open-outline" size={48} color="#475569" />
              <Text className="text-white text-base font-bold mt-3">No files selected</Text>
              <Text className="text-slate-400 text-xs mt-1 text-center">
                Tap above to select photos, videos, or documents
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white text-base font-bold">Selected Files ({files.length})</Text>
                <TouchableOpacity onPress={() => setFiles([])} activeOpacity={0.7}>
                  <Text className="text-red-400 text-xs font-bold">Clear All</Text>
                </TouchableOpacity>
              </View>

              {files.map((file) => (
                <FileCard key={file.id} file={file} onRemove={removeFile} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Continue Bar */}
        <View className="border-t border-[#1f2d36] pt-4 bg-[#090d10]">
          <TouchableOpacity
            onPress={() => {
              if (files.length === 0) {
                Alert.alert("No files selected", "Please select at least one file to continue.");
                return;
              }
              router.push("/send/devices" as any);
            }}
            activeOpacity={0.88}
            className="w-full bg-[#0d8274] py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-xl active:bg-[#096358]"
          >
            <Text className="text-white text-base font-bold">
              Continue ({files.length} • {(totalSize / 1024 / 1024).toFixed(2)} MB)
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
