import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Modal,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library/legacy";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import SearchBar from "../../components/ui/SearchBar";
import { SelectedFile } from "../../types/file";
import { clearSharedFiles, copyFileToServer } from "../../server/localServer";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = SCREEN_WIDTH > 600 ? 5 : 4;
const GRID_PADDING = 8;
const GAP = 4;
const ITEM_SIZE = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);

interface DateGroupHeaderItem {
  type: "header";
  id: string;
  title: string;
  dateKey: string;
  assets: MediaLibrary.Asset[];
}

interface PhotoRowItem {
  type: "row";
  id: string;
  assets: MediaLibrary.Asset[];
}

type ListItem = DateGroupHeaderItem | PhotoRowItem;

const PhotoCell = React.memo(
  ({
    asset,
    isSelected,
    itemSize,
    onToggle,
    onPreview,
  }: {
    asset: MediaLibrary.Asset;
    isSelected: boolean;
    itemSize: number;
    onToggle: (key: string) => void;
    onPreview: (asset: MediaLibrary.Asset) => void;
  }) => {
    const key = asset.id || asset.uri;
    return (
      <Pressable
        onPress={() => onPreview(asset)}
        onLongPress={() => onToggle(key)}
        style={({ pressed }) => ({
          width: itemSize,
          height: itemSize,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#141e24",
          position: "relative",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Image
          source={{ uri: asset.uri }}
          style={{ width: itemSize, height: itemSize }}
          contentFit="cover"
          transition={100}
          cachePolicy="memory-disk"
          recyclingKey={key}
        />

        {isSelected && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(13, 130, 116, 0.45)",
              borderWidth: 2.5,
              borderColor: "#0d8274",
              borderRadius: 10,
              zIndex: 10,
            }}
          />
        )}

        <TouchableOpacity
          onPress={() => onToggle(key)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 20,
          }}
        >
          {isSelected ? (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#0d8274",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
              }}
            >
              <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" />
            </View>
          ) : (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.9)",
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          )}
        </TouchableOpacity>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.itemSize === next.itemSize &&
    (prev.asset.id || prev.asset.uri) === (next.asset.id || next.asset.uri)
);
PhotoCell.displayName = "PhotoCell";

const PhotoRowComponent = React.memo(
  ({
    assets,
    selectedAssetIds,
    itemSize,
    onToggle,
    onPreview,
  }: {
    assets: MediaLibrary.Asset[];
    selectedAssetIds: Set<string>;
    itemSize: number;
    onToggle: (key: string) => void;
    onPreview: (asset: MediaLibrary.Asset) => void;
  }) => {
    return (
      <View style={{ flexDirection: "row", gap: GAP, marginBottom: GAP }}>
        {assets.map((asset) => {
          const key = asset.id || asset.uri;
          const isSelected = selectedAssetIds.has(key);
          return (
            <PhotoCell
              key={key}
              asset={asset}
              isSelected={isSelected}
              itemSize={itemSize}
              onToggle={onToggle}
              onPreview={onPreview}
            />
          );
        })}
        {Array.from({ length: NUM_COLUMNS - assets.length }).map((_, index) => (
          <View key={`empty-${index}`} style={{ width: itemSize, height: itemSize }} />
        ))}
      </View>
    );
  }
);
PhotoRowComponent.displayName = "PhotoRowComponent";

export default function PhotosScreen() {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState<
    "loading" | "granted" | "denied" | "undetermined"
  >("loading");
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [isProcessingSend, setIsProcessingSend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<MediaLibrary.Asset | null>(null);

  // Load photos
  const loadDevicePhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: 600,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setPhotos(result.assets || []);
    } catch (error: any) {
      console.log("Error loading device photos:", error);
      Alert.alert("Loading Error", error?.message || "Failed to load photos.");
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  // Request permissions
  const requestPermissions = async () => {
    try {
      const res = await MediaLibrary.requestPermissionsAsync();
      if (res.granted) {
        setPermissionStatus("granted");
        await loadDevicePhotos();
      } else {
        setPermissionStatus("denied");
      }
    } catch (error) {
      console.log("Error requesting photo permissions:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    MediaLibrary.getPermissionsAsync()
      .then((res) => {
        if (!isMounted) return;
        if (res.granted) {
          setPermissionStatus("granted");
          loadDevicePhotos();
        } else {
          setPermissionStatus(res.status === "denied" ? "denied" : "undetermined");
        }
      })
      .catch(() => {
        if (isMounted) setPermissionStatus("denied");
      });
    return () => {
      isMounted = false;
    };
  }, [loadDevicePhotos]);

  // Date formatting
  const formatDateHeading = (timestamp: number): { title: string; dateKey: string } => {
    if (!timestamp || timestamp <= 0) return { title: "Photos", dateKey: "photos" };
    let timeMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    const photoDate = new Date(timeMs);
    if (isNaN(photoDate.getTime())) return { title: "Photos", dateKey: "photos" };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const dateKey = `${photoDate.getFullYear()}-${String(photoDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(photoDate.getDate()).padStart(2, "0")}`;

    if (isSameDay(photoDate, today)) return { title: "Today", dateKey };
    if (isSameDay(photoDate, yesterday)) return { title: "Yesterday", dateKey };

    return { title: dateKey, dateKey };
  };

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    const query = searchQuery.toLowerCase();
    return photos.filter((p) => p.filename?.toLowerCase().includes(query));
  }, [photos, searchQuery]);

  // Group photos by date
  const listItems = useMemo<ListItem[]>(() => {
    if (filteredPhotos.length === 0) return [];
    const groupsMap = new Map<
      string,
      { title: string; dateKey: string; assets: MediaLibrary.Asset[] }
    >();

    filteredPhotos.forEach((asset) => {
      const { title, dateKey } = formatDateHeading(asset.creationTime);
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, { title, dateKey, assets: [] });
      }
      groupsMap.get(dateKey)!.assets.push(asset);
    });

    const items: ListItem[] = [];
    groupsMap.forEach((group) => {
      items.push({
        type: "header",
        id: `header-${group.dateKey}`,
        title: group.title,
        dateKey: group.dateKey,
        assets: group.assets,
      });

      for (let i = 0; i < group.assets.length; i += NUM_COLUMNS) {
        items.push({
          type: "row",
          id: `row-${group.dateKey}-${i}`,
          assets: group.assets.slice(i, i + NUM_COLUMNS),
        });
      }
    });

    return items;
  }, [filteredPhotos]);

  // Selection handlers
  const togglePhotoSelection = useCallback((assetId: string) => {
    if (!assetId) return;
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }, []);

  const toggleGroupSelection = useCallback((groupAssets: MediaLibrary.Asset[]) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupAssets.every((a) => next.has(a.id || a.uri));
      groupAssets.forEach((a) => {
        const key = a.id || a.uri;
        if (allSelected) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  }, []);

  const selectAllPhotos = useCallback(() => {
    setSelectedAssetIds(new Set(photos.map((p) => p.id || p.uri)));
  }, [photos]);

  const clearSelection = useCallback(() => {
    setSelectedAssetIds(new Set());
  }, []);

  // Send files flow
  const handleSendSelectedPhotos = async () => {
    if (selectedAssetIds.size === 0) return;
    setIsProcessingSend(true);
    try {
      const selectedAssets = photos.filter((p) => selectedAssetIds.has(p.id || p.uri));
      const preparedFiles: SelectedFile[] = [];

      for (const asset of selectedAssets) {
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
          console.log("Could not get asset info:", e);
        }

        const extParts = (asset.filename || finalUri).split(".");
        const ext = (extParts.length > 1 ? extParts.pop() : "jpg")?.toLowerCase() || "jpg";

        preparedFiles.push({
          id: `${asset.id || asset.uri}-${Date.now()}`,
          name: asset.filename || `photo_${Date.now()}.${ext}`,
          size: size || 1024,
          uri: finalUri,
          type: "image",
          mimeType: `image/${ext === "png" ? "png" : "jpeg"}`,
        });
      }

      await clearSharedFiles();
      const BATCH_SIZE = 4;
      for (let i = 0; i < preparedFiles.length; i += BATCH_SIZE) {
        const chunk = preparedFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(chunk.map((file) => copyFileToServer(file.uri, file.name)));
        await new Promise((res) => setTimeout(res, 10));
      }

      router.push("/send/devices");
    } catch (error: any) {
      Alert.alert("Transfer Error", error?.message || "Failed to prepare photos.");
    } finally {
      setIsProcessingSend(false);
    }
  };

  // Render list item
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        const isGroupFullySelected =
          item.assets.length > 0 &&
          item.assets.every((a) => selectedAssetIds.has(a.id || a.uri));

        return (
          <View className="flex-row items-center justify-between pt-4 pb-2 px-1">
            <Text className="text-white text-sm font-bold">{item.title}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleGroupSelection(item.assets)}
              className="py-1 px-2.5 rounded-full bg-[#141e24] flex-row items-center gap-1 border border-[#1f2d36]"
            >
              <MaterialCommunityIcons
                name={isGroupFullySelected ? "check-circle" : "circle-outline"}
                size={14}
                color={isGroupFullySelected ? "#0d8274" : "#94a3b8"}
              />
              <Text
                className={`text-[11px] font-medium ${
                  isGroupFullySelected ? "text-[#0d8274]" : "text-slate-400"
                }`}
              >
                {isGroupFullySelected ? "Deselect" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <PhotoRowComponent
          assets={item.assets}
          selectedAssetIds={selectedAssetIds}
          itemSize={ITEM_SIZE}
          onToggle={togglePhotoSelection}
          onPreview={(asset) => setPreviewAsset(asset)}
        />
      );
    },
    [selectedAssetIds, toggleGroupSelection, togglePhotoSelection]
  );

  if (permissionStatus === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] items-center justify-center">
        <ActivityIndicator size="large" color="#0d8274" />
      </SafeAreaView>
    );
  }

  if (permissionStatus !== "granted") {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] justify-between" edges={["top", "left", "right"]}>
        <View className="px-5 pt-4 pb-2 border-b border-[#1f2d36] flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            className="w-10 h-10 rounded-full bg-[#141e24] items-center justify-center"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Photos</Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="image-lock-outline" size={54} color="#0d8274" />
          <Text className="text-white text-xl font-bold text-center mt-4 mb-2">
            Allow Photo Access
          </Text>
          <Text className="text-slate-400 text-xs text-center leading-5 mb-6">
            Air—DropX requires photo library access to browse and share photos.
          </Text>
          <TouchableOpacity
            onPress={requestPermissions}
            className="w-full bg-[#0d8274] py-3.5 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white text-base font-bold">Grant Permission</Text>
          </TouchableOpacity>
        </View>

        <BottomNavigation currentTab="photos" />
      </SafeAreaView>
    );
  }

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
              <Text className="text-white text-xl font-bold tracking-wide">Photos</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{photos.length} photos on device</Text>
            </View>
          </View>

          {photos.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={selectedAssetIds.size === photos.length ? clearSelection : selectAllPhotos}
              className="px-3 py-1.5 rounded-lg bg-[#141e24] border border-[#1f2d36]"
            >
              <Text className="text-[#0d8274] text-xs font-semibold">
                {selectedAssetIds.size === photos.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search photos..."
        />
      </View>

      {/* Main Photo Content */}
      <View className="flex-1 px-2">
          {loadingPhotos ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0d8274" />
            </View>
          ) : filteredPhotos.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <MaterialCommunityIcons name="image-off-outline" size={44} color="#475569" />
              <Text className="text-white text-base font-bold mt-3">No Photos Found</Text>
            </View>
          ) : (
            <FlatList
              data={listItems}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 4, paddingBottom: 120 }}
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={7}
              removeClippedSubviews={Platform.OS === "android"}
            />
          )}
        </View>

      {/* Floating Send Action Bar */}
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
              {selectedAssetIds.size} Selected
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isProcessingSend}
            onPress={handleSendSelectedPhotos}
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

      {/* Photo Preview Modal */}
      <Modal visible={!!previewAsset} transparent animationType="fade">
        <View className="flex-1 bg-black justify-between">
          <SafeAreaView className="flex-row items-center justify-between px-4 py-2 z-10 bg-black/50">
            <TouchableOpacity onPress={() => setPreviewAsset(null)} className="p-2">
              <MaterialCommunityIcons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
              {previewAsset?.filename}
            </Text>
            {previewAsset && (
              <TouchableOpacity
                onPress={() => Share.share({ url: previewAsset.uri })}
                className="p-2"
              >
                <MaterialCommunityIcons name="share-variant-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </SafeAreaView>

          {previewAsset && (
            <Image
              source={{ uri: previewAsset.uri }}
              style={{ flex: 1, width: "100%" }}
              contentFit="contain"
            />
          )}

          <SafeAreaView className="p-4 bg-black/60 flex-row items-center justify-around z-10">
            {previewAsset && (
              <TouchableOpacity
                onPress={() => {
                  togglePhotoSelection(previewAsset.id || previewAsset.uri);
                  setPreviewAsset(null);
                }}
                className="flex-row items-center gap-2 bg-[#0d8274] px-6 py-3 rounded-2xl"
              >
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm">Select for Transfer</Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <BottomNavigation currentTab="photos" />
    </SafeAreaView>
  );
}
