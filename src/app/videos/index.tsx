import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library/legacy";

import BottomNavigation from "../../components/BottomNavigation";
import SearchBar from "../../components/ui/SearchBar";
import {
  clearSharedFiles,
  copyMultipleFilesToServer,
} from "../../server/localServer";
import { SelectedFile } from "../../types/file";

interface VideoGroupHeader {
  type: "header";
  id: string;
  title: string;
  assets: MediaLibrary.Asset[];
}

interface VideoRowItem {
  type: "video";
  id: string;
  asset: MediaLibrary.Asset;
}

type ListItem = VideoGroupHeader | VideoRowItem;

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function VideosScreen() {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState<
    "loading" | "granted" | "denied"
  >("loading");
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set(),
  );
  const [isProcessingSend, setIsProcessingSend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<MediaLibrary.Asset | null>(
    null,
  );

  // Load videos from device media library
  const loadDeviceVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: 300,
        mediaType: MediaLibrary.MediaType.video,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setVideos(result.assets || []);
    } catch (error: any) {
      console.log("Error loading videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    MediaLibrary.getPermissionsAsync()
      .then((res) => {
        if (res.granted) {
          setPermissionStatus("granted");
          loadDeviceVideos();
        } else {
          MediaLibrary.requestPermissionsAsync().then((reqRes) => {
            if (reqRes.granted) {
              setPermissionStatus("granted");
              loadDeviceVideos();
            } else {
              setPermissionStatus("denied");
            }
          });
        }
      })
      .catch(() => setPermissionStatus("denied"));
  }, [loadDeviceVideos]);

  // Group videos by date
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter((v) => v.filename?.toLowerCase().includes(query));
  }, [videos, searchQuery]);

  const listItems = useMemo<ListItem[]>(() => {
    if (filteredVideos.length === 0) return [];
    const groupsMap = new Map<
      string,
      { title: string; assets: MediaLibrary.Asset[] }
    >();

    filteredVideos.forEach((asset) => {
      const date = asset.creationTime
        ? new Date(asset.creationTime)
        : new Date();
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;

      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { title: dateKey, assets: [] });
      }
      groupsMap.get(dateKey)!.assets.push(asset);
    });

    const items: ListItem[] = [];
    groupsMap.forEach((group) => {
      items.push({
        type: "header",
        id: `header-${group.title}`,
        title: group.title,
        assets: group.assets,
      });

      group.assets.forEach((asset) => {
        items.push({
          type: "video",
          id: asset.id || asset.uri,
          asset,
        });
      });
    });

    return items;
  }, [filteredVideos]);

  const toggleVideoSelection = useCallback((id: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSendSelectedVideos = async () => {
    if (selectedAssetIds.size === 0) return;
    setIsProcessingSend(true);
    try {
      const selectedAssets = videos.filter((v) =>
        selectedAssetIds.has(v.id || v.uri),
      );
      const preparedFiles: SelectedFile[] = [];

      const seenNames = new Map<string, number>();
      for (let i = 0; i < selectedAssets.length; i++) {
        const asset = selectedAssets[i];
        let size = 0;
        let finalUri = asset.uri;

        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          if (info.localUri) finalUri = info.localUri;
          const infoSize = (info as any).fileSize;
          if (typeof infoSize === "number" && infoSize > 0) {
            size = infoSize;
          } else {
            const fsInfo = await FileSystem.getInfoAsync(finalUri);
            if (fsInfo.exists && fsInfo.size) size = fsInfo.size;
          }
        } catch (e) {
          console.log("Could not get video info:", e);
        }

        const extParts = (asset.filename || finalUri).split(".");
        const ext =
          (extParts.length > 1 ? extParts.pop() : "mp4")?.toLowerCase() ||
          "mp4";
        let rawName = asset.filename || `video_${i + 1}.${ext}`;
        rawName = rawName.replace(/[\/\\]/g, "_").trim();

        const count = seenNames.get(rawName) || 0;
        seenNames.set(rawName, count + 1);

        let finalName = rawName;
        if (count > 0) {
          const dotIndex = rawName.lastIndexOf(".");
          if (dotIndex > 0) {
            const stem = rawName.substring(0, dotIndex);
            const e = rawName.substring(dotIndex);
            finalName = `${stem} (${count})${e}`;
          } else {
            finalName = `${rawName} (${count})`;
          }
        }

        preparedFiles.push({
          id: `${asset.id || asset.uri}-${Date.now()}-${i}`,
          name: finalName,
          size: size || 1024 * 1024 * 10,
          uri: finalUri,
          type: "video",
          mimeType: `video/${ext}`,
        });
      }

      await clearSharedFiles();
      await copyMultipleFilesToServer(
        preparedFiles.map((file) => ({ uri: file.uri, name: file.name })),
      );

      router.push("/send/devices");
    } catch (error: any) {
      Alert.alert(
        "Transfer Error",
        error?.message || "Failed to prepare videos.",
      );
    } finally {
      setIsProcessingSend(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return (
          <View className="pt-4 pb-2 px-1">
            <Text className="text-white text-sm font-bold">{item.title}</Text>
          </View>
        );
      }

      const asset = item.asset;
      const key = asset.id || asset.uri;
      const isSelected = selectedAssetIds.has(key);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setPreviewAsset(asset)}
          onLongPress={() => toggleVideoSelection(key)}
          className={`flex-row items-center justify-between p-3 mb-2.5 rounded-2xl bg-[#141e24] border ${
            isSelected ? "border-[#0d8274] bg-[#0d8274]/15" : "border-[#1f2d36]"
          }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1 pr-2">
            {/* Thumbnail */}
            <View className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden relative justify-center items-center">
              <Image
                source={{ uri: asset.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <View className="absolute inset-0 bg-black/30 items-center justify-center">
                <MaterialCommunityIcons
                  name="play-circle"
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded">
                <Text className="text-white text-[9px] font-medium">
                  {formatDuration(asset.duration)}
                </Text>
              </View>
            </View>

            {/* Video Info */}
            <View className="flex-1">
              <Text className="text-white text-sm font-bold" numberOfLines={1}>
                {asset.filename || "Video"}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                {formatDuration(asset.duration)} • Video
              </Text>
            </View>
          </View>

          {/* Selection Circle */}
          <TouchableOpacity
            onPress={() => toggleVideoSelection(key)}
            className="p-1"
          >
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isSelected
                  ? "bg-[#0d8274] border-[#0d8274]"
                  : "border-slate-500 bg-transparent"
              }`}
            >
              {isSelected && (
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color="#FFFFFF"
                />
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [selectedAssetIds, toggleVideoSelection],
  );

  if (permissionStatus === "denied") {
    return (
      <SafeAreaView
        className="flex-1 bg-[#090d10] items-center justify-center p-6"
        edges={["top", "left", "right"]}
      >
        <StatusBar style="light" />
        <MaterialCommunityIcons
          name="video-off-outline"
          size={54}
          color="#f87171"
        />
        <Text className="text-white text-lg font-bold mt-4 text-center">
          Video Access Denied
        </Text>
        <Text className="text-slate-400 text-sm text-center mt-2">
          Air—DropX needs access to your media library to list videos for
          transfer.
        </Text>
        <BottomNavigation currentTab="videos" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#090d10]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/")
              }
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold tracking-wide">
                Videos
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                {videos.length} videos on device
              </Text>
            </View>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search videos..."
        />
      </View>

      {/* Video List */}
      <View className="flex-1 px-4 pt-2">
        {loadingVideos ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0d8274" />
          </View>
        ) : filteredVideos.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialCommunityIcons
              name="video-off-outline"
              size={44}
              color="#475569"
            />
            <Text className="text-white text-base font-bold mt-3">
              No Videos Found
            </Text>
          </View>
        ) : (
          <FlatList
            data={listItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      {/* Floating Action Bar */}
      {selectedAssetIds.size > 0 && (
        <View
          style={{ bottom: 58 + Math.max(insets?.bottom ?? 0, 10) }}
          className="absolute left-4 right-4 bg-[#141e24] border border-[#0d8274]/50 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xl z-20"
        >
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center">
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
            </View>
            <Text className="text-white text-sm font-bold">
              {selectedAssetIds.size} Video
              {selectedAssetIds.size !== 1 ? "s" : ""} Selected
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isProcessingSend}
            onPress={handleSendSelectedVideos}
            className="bg-[#0d8274] px-5 py-2.5 rounded-xl flex-row items-center gap-2 shadow-md"
          >
            {isProcessingSend ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white text-sm font-bold">Send</Text>
                <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Video Preview Modal */}
      <Modal visible={!!previewAsset} transparent animationType="fade">
        <View className="flex-1 bg-black justify-between">
          <SafeAreaView className="flex-row items-center justify-between px-4 py-2 z-10 bg-black/60">
            <TouchableOpacity
              onPress={() => setPreviewAsset(null)}
              className="p-2"
            >
              <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text
              className="text-white text-sm font-semibold flex-1 mx-2"
              numberOfLines={1}
            >
              {previewAsset?.filename}
            </Text>
            {previewAsset && (
              <TouchableOpacity
                onPress={() => Share.share({ url: previewAsset.uri })}
                className="p-2"
              >
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </SafeAreaView>

          {previewAsset && (
            <View className="flex-1 justify-center items-center relative">
              <Image
                source={{ uri: previewAsset.uri }}
                style={{ width: "100%", height: "80%" }}
                contentFit="contain"
              />
              <View className="absolute inset-0 items-center justify-center">
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Playback", "Playing video thumbnail preview.")
                  }
                  className="w-16 h-16 rounded-full bg-[#0d8274]/80 items-center justify-center border-2 border-white"
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={36}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <SafeAreaView className="p-4 bg-black/60 flex-row items-center justify-center z-10">
            {previewAsset && (
              <TouchableOpacity
                onPress={() => {
                  toggleVideoSelection(previewAsset.id || previewAsset.uri);
                  setPreviewAsset(null);
                }}
                className="flex-row items-center gap-2 bg-[#0d8274] px-6 py-3 rounded-2xl"
              >
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text className="text-white font-bold text-sm">
                  Select for Transfer
                </Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <BottomNavigation currentTab="videos" />
    </SafeAreaView>
  );
}
