import React, { useRef, useState } from "react";
import { Alert, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";

import AppHeader from "../../components/AppHeader";
import FileCard from "../../components/FileCard";
import { SelectedFile, FileType } from "../../types/file";
import { clearSharedFiles, copyFileToServer, removeSharedFile } from "../../server/localServer";

export default function SelectFilesScreen() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [copying, setCopying] = useState(false);
  const filesRef = useRef<SelectedFile[]>([]);
  const busyRef = useRef(false);

  const showFiles = (nextFiles: SelectedFile[]) => {
    filesRef.current = nextFiles;
    setFiles(nextFiles);
  };

  const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Please try again.";

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
    if (!selectedFiles.length) return;

    const names = selectedFiles.map((f) => f.name);
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      const duplicateName = names.find((name, index) => names.indexOf(name) !== index);
      throw new Error(`"${duplicateName}" is already shared.`);
    }

    const currentNames = new Set(filesRef.current.map((f) => f.name));
    for (const file of selectedFiles) {
      if (currentNames.has(file.name)) {
        throw new Error(`"${file.name}" is already shared.`);
      }
    }

    const sharedDir = `${FileSystem.documentDirectory}shared-files/`;
    try {
      const info = await FileSystem.getInfoAsync(sharedDir);
      if (info.exists && info.isDirectory) {
        const diskFiles = await FileSystem.readDirectoryAsync(sharedDir);
        for (const file of selectedFiles) {
          if (diskFiles.includes(file.name)) {
            throw new Error(`"${file.name}" is already shared.`);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("already shared")) {
        throw error;
      }
    }

    const failed: string[] = [];
    for (const file of selectedFiles) {
      try {
        await copyFileToServer(file.uri, file.name);
        showFiles([...filesRef.current, file]);
      } catch (error) {
        console.log("File copy error:", error);
        failed.push(`${file.name}: ${errorMessage(error)}`);
        try {
          await removeSharedFile(file.name);
        } catch (cleanupError) {
          failed.push(`Could not clean up ${file.name}: ${errorMessage(cleanupError)}`);
        }
      }
    }
    if (failed.length) {
      Alert.alert("Copy Failed", failed.join("\n"));
    }
  };

  const pickAndShare = async (pick: () => Promise<SelectedFile[] | null>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setCopying(true);
    try {
      const selectedFiles = await pick();
      if (selectedFiles) await addFilesToServer(selectedFiles);
    } catch (error) {
      Alert.alert("Sharing Failed", errorMessage(error));
    } finally {
      busyRef.current = false;
      setCopying(false);
    }
  };

  const pickPhotosAndVideos = () => pickAndShare(async () => {
    let ImagePicker: typeof import("expo-image-picker");
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ImagePicker = require("expo-image-picker");
    } catch {
      throw new Error("ImagePicker native module unavailable.");
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your media library.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled) return null;

    return result.assets.map((asset, index) => ({
      id: `${asset.assetId ?? ""}-${asset.uri}-${Date.now()}-${index}`,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "Unknown file",
      size: asset.fileSize ?? 0,
      uri: asset.uri,
      type: getFileType(asset.mimeType),
      mimeType: asset.mimeType ?? undefined,
    }));
  });

  const pickDocuments = () => pickAndShare(async () => {
    let DocumentPicker: typeof import("expo-document-picker");
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      DocumentPicker = require("expo-document-picker");
    } catch {
      throw new Error("DocumentPicker native module unavailable.");
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;

    return result.assets.map((asset, index) => ({
      id: `${asset.uri}-${Date.now()}-${index}`,
      name: asset.name,
      size: asset.size ?? 0,
      uri: asset.uri,
      type: getFileType(asset.mimeType),
      mimeType: asset.mimeType ?? undefined,
    }));
  });

  const removeFile = async (id: string) => {
    if (busyRef.current) return;
    const file = filesRef.current.find((item) => item.id === id);
    if (!file) return;
    busyRef.current = true;
    setCopying(true);
    try {
      await removeSharedFile(file.name);
      showFiles(filesRef.current.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert("Remove Failed", errorMessage(error));
    } finally {
      busyRef.current = false;
      setCopying(false);
    }
  };

  const clearAll = async () => {
    if (busyRef.current || filesRef.current.length === 0) return;
    busyRef.current = true;
    setCopying(true);
    try {
      await clearSharedFiles();
      showFiles([]);
    } catch (error) {
      Alert.alert("Clear Failed", errorMessage(error));
    } finally {
      busyRef.current = false;
      setCopying(false);
    }
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
            onPress={pickPhotosAndVideos}
            disabled={copying}
            activeOpacity={0.8}
            className="flex-1 rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-center gap-2.5 shadow-md"
          >
            <MaterialCommunityIcons name="image-multiple-outline" size={22} color="#0d8274" />
            <Text className="text-white text-sm font-bold">Photos & Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickDocuments}
            disabled={copying}
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
              <Text className="text-slate-400 text-xs mt-3 font-medium">Updating shared files...</Text>
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
                <TouchableOpacity onPress={clearAll} disabled={copying} activeOpacity={0.7}>
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
              if (busyRef.current) return;
              if (filesRef.current.length === 0) {
                Alert.alert("No files selected", "Please select at least one file to continue.");
                return;
              }
              router.push("/send/devices" as any);
            }}
            disabled={copying}
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
