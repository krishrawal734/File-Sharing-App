import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";

import SearchBar from "../../components/ui/SearchBar";
import { formatFileSize, getFileExtension } from "../../utils/fileUtils";

type CategoryType = "all" | "photos" | "videos" | "music" | "documents" | "archives" | "apks";

interface FileEntry {
  id: string;
  name: string;
  size: number;
  uri: string;
  category: CategoryType;
  modificationTime: number;
}

export default function FileManagerScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Load files from document directory
  const loadFiles = async () => {
    setLoading(true);
    try {
      const docDir = FileSystem.documentDirectory;
      if (!docDir) return;

      const fileNames = await FileSystem.readDirectoryAsync(docDir);
      const entries: FileEntry[] = [];

      for (const name of fileNames) {
        const fileUri = `${docDir}${name}`;
        const info = await FileSystem.getInfoAsync(fileUri);
        if (info.exists && !info.isDirectory) {
          const ext = getFileExtension(name);
          let category: CategoryType = "documents";
          if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) category = "photos";
          else if (["mp4", "mov", "mkv", "avi"].includes(ext)) category = "videos";
          else if (["mp3", "wav", "m4a", "aac"].includes(ext)) category = "music";
          else if (["zip", "rar", "7z", "tar"].includes(ext)) category = "archives";
          else if (ext === "apk") category = "apks";

          entries.push({
            id: fileUri,
            name,
            size: info.size || 0,
            uri: fileUri,
            category,
            modificationTime: info.modificationTime || Date.now(),
          });
        }
      }

      setFiles(entries);
    } catch (e) {
      console.log("Error loading file manager files:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) loadFiles();
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesCategory = activeCategory === "all" || f.category === activeCategory;
      const matchesSearch = !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [files, activeCategory, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedFileIds.size === 0) return;
    Alert.alert("Delete Files", `Delete ${selectedFileIds.size} selected item(s)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          for (const uri of selectedFileIds) {
            try {
              await FileSystem.deleteAsync(uri, { idempotent: true });
            } catch (e) {
              console.log("Error deleting file:", e);
            }
          }
          setSelectedFileIds(new Set());
          loadFiles();
        },
      },
    ]);
  };

  const renderFileRow = ({ item }: { item: FileEntry }) => {
    const isSelected = selectedFileIds.has(item.id);
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = "file-document-outline";
    if (item.category === "photos") iconName = "image";
    else if (item.category === "videos") iconName = "video";
    else if (item.category === "music") iconName = "music-note";
    else if (item.category === "archives") iconName = "zip-box";
    else if (item.category === "apks") iconName = "android";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        
        onPress={() => toggleSelect(item.id)}
        className={`flex-row items-center justify-between p-3.5 mb-2.5 rounded-2xl bg-[#141e24] border ${
          isSelected ? "border-[#0d8274] bg-[#0d8274]/15" : "border-[#1f2d36]"
        }`}
      >
        <View className="flex-row items-center gap-3.5 flex-1 pr-2">
          <View className="w-12 h-12 rounded-xl bg-[#0d8274]/20 border border-[#0d8274]/30 items-center justify-center">
            <MaterialCommunityIcons name={iconName} size={22} color="#0d8274" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {formatFileSize(item.size)} • {item.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => Share.share({ url: item.uri })} className="p-2">
          <MaterialCommunityIcons name="share-variant-outline" size={20} color="#38bdf8" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold tracking-wide">File Manager</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{files.length} items listed</Text>
            </View>
          </View>

          {selectedFileIds.size > 0 && (
            <TouchableOpacity
              onPress={handleDeleteSelected}
              className="bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
            >
              <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
              <Text className="text-red-400 text-xs font-bold">Delete ({selectedFileIds.size})</Text>
            </TouchableOpacity>
          )}
        </View>

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search files..." />
      </View>

      {/* Category Pills */}
      <View className="py-3 px-4 border-b border-[#1f2d36] bg-[#0c1318]">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["all", "photos", "videos", "music", "documents", "archives", "apks"] as CategoryType[]}
          keyExtractor={(cat) => cat}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl mr-2 capitalize border ${
                activeCategory === cat
                  ? "bg-[#0d8274] border-[#0d8274]"
                  : "bg-[#141e24] border-[#1f2d36]"
              }`}
            >
              <Text
                className={`text-xs font-bold capitalize ${
                  activeCategory === cat ? "text-white" : "text-slate-400"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* File List */}
      <View className="flex-1 px-4 pt-3">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0d8274" />
          </View>
        ) : filteredFiles.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialCommunityIcons name="folder-outline" size={44} color="#475569" />
            <Text className="text-white text-base font-bold mt-3">No Files Found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFiles}
            keyExtractor={(item) => item.id}
            renderItem={renderFileRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
