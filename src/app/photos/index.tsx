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
  Linking,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library/legacy";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import { SelectedFile } from "../../types/file";
import { clearSharedFiles, copyFileToServer } from "../../server/localServer";

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
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
  }: {
    asset: MediaLibrary.Asset;
    isSelected: boolean;
    itemSize: number;
    onToggle: (key: string) => void;
  }) => {
    const key = asset.id || asset.uri;
    return (
      <Pressable
        onPress={() => onToggle(key)}
        style={({ pressed }) => ({
          width: itemSize,
          height: itemSize,
          borderRadius: 8,
          overflow: "hidden",
          backgroundColor: "#1e293b",
          position: "relative",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Image
          source={{ uri: asset.uri }}
          style={{ width: itemSize, height: itemSize }}
          contentFit="cover"
          transition={150}
          cachePolicy="disk"
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
              backgroundColor: "rgba(13, 130, 116, 0.4)",
              borderWidth: 2,
              borderColor: "#0d8274",
              borderRadius: 8,
              zIndex: 10,
            }}
          />
        )}

        <View
          pointerEvents="none"
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
                borderWidth: 1,
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
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "transparent",
                }}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.itemSize === next.itemSize &&
    (prev.asset.id || prev.asset.uri) === (next.asset.id || next.asset.uri)
);

const PhotoRowComponent = React.memo(
  ({
    assets,
    selectedAssetIds,
    itemSize,
    onToggle,
  }: {
    assets: MediaLibrary.Asset[];
    selectedAssetIds: Set<string>;
    itemSize: number;
    onToggle: (key: string) => void;
  }) => {
    return (
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
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
            />
          );
        })}
        {Array.from({ length: NUM_COLUMNS - assets.length }).map((_, index) => (
          <View
            key={`empty-${index}`}
            style={{ width: itemSize, height: itemSize }}
          />
        ))}
      </View>
    );
  }
);

export default function PhotosScreen() {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState<
    "loading" | "granted" | "denied" | "undetermined"
  >("loading");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
    new Set()
  );
  const [isProcessingSend, setIsProcessingSend] = useState(false);

  // 1. Fetch Real Photos from Device
  const loadDevicePhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        first: 500,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setPhotos(result.assets || []);
    } catch (error: any) {
      console.log("Error loading device photos:", error);
      Alert.alert(
        "Loading Error",
        error?.message || "Failed to load photos from your device."
      );
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  // 2. Permission Request Handler
  const requestPermissions = async () => {
    try {
      const res = await MediaLibrary.requestPermissionsAsync();
      setCanAskAgain(res.canAskAgain);
      if (res.granted) {
        setPermissionStatus("granted");
        await loadDevicePhotos();
      } else {
        setPermissionStatus("denied");
        if (!res.canAskAgain) {
          Alert.alert(
            "Permission Required",
            "Photo library access was denied. Please allow access in device settings to select photos.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    } catch (error) {
      console.log("Error requesting photo permissions:", error);
      Alert.alert("Permission Error", "Could not request photo permissions.");
    }
  };

  // 3. Initial Permission Check Effect
  useEffect(() => {
    let isMounted = true;
    MediaLibrary.getPermissionsAsync()
      .then((res) => {
        if (!isMounted) return;
        setCanAskAgain(res.canAskAgain);
        if (res.granted) {
          setPermissionStatus("granted");
          loadDevicePhotos();
        } else {
          setPermissionStatus(res.status === "denied" ? "denied" : "undetermined");
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        console.log("Error checking photo permissions:", error);
        setPermissionStatus("denied");
      });

    return () => {
      isMounted = false;
    };
  }, [loadDevicePhotos]);

  // 4. Format Date Header
  const formatDateHeading = (timestamp: number): { title: string; dateKey: string } => {
    if (!timestamp || timestamp <= 0) return { title: "Photos", dateKey: "photos" };
    let timeMs = timestamp;
    if (timeMs < 10000000000) {
      timeMs = timeMs * 1000;
    }
    const photoDate = new Date(timeMs);
    if (isNaN(photoDate.getTime())) return { title: "Photos", dateKey: "photos" };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const dateKey = `${photoDate.getFullYear()}-${String(
      photoDate.getMonth() + 1
    ).padStart(2, "0")}-${String(photoDate.getDate()).padStart(2, "0")}`;

    if (isSameDay(photoDate, today)) {
      return { title: "Today", dateKey };
    }
    if (isSameDay(photoDate, yesterday)) {
      return { title: "Yesterday", dateKey };
    }

    return { title: dateKey, dateKey };
  };

  // 5. Group Photos by Date & Chunk into Rows of 4
  const listItems = useMemo<ListItem[]>(() => {
    if (photos.length === 0) return [];

    const groupsMap = new Map<string, { title: string; dateKey: string; assets: MediaLibrary.Asset[] }>();

    photos.forEach((asset) => {
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
        const rowAssets = group.assets.slice(i, i + NUM_COLUMNS);
        items.push({
          type: "row",
          id: `row-${group.dateKey}-${i}`,
          assets: rowAssets,
        });
      }
    });

    return items;
  }, [photos]);

  // 6. Selection Toggles
  const togglePhotoSelection = useCallback((assetId: string) => {
    if (!assetId) return;
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const toggleGroupSelection = useCallback((groupAssets: MediaLibrary.Asset[]) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      const allSelected = groupAssets.every((a) => next.has(a.id || a.uri));
      groupAssets.forEach((a) => {
        const key = a.id || a.uri;
        if (allSelected) {
          next.delete(key);
        } else {
          next.add(key);
        }
      });
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAssetIds(new Set());
  }, []);

  const selectAllPhotos = useCallback(() => {
    setSelectedAssetIds(new Set(photos.map((p) => p.id || p.uri)));
  }, [photos]);

  // 7. Handle Send Button Press -> Existing Transfer Flow
  const handleSendSelectedPhotos = async () => {
    if (selectedAssetIds.size === 0) {
      Alert.alert("No Photos Selected", "Please select at least one photo to send.");
      return;
    }

    setIsProcessingSend(true);
    try {
      const selectedAssets = photos.filter((p) => selectedAssetIds.has(p.id || p.uri));
      const preparedFiles: SelectedFile[] = [];

      for (const asset of selectedAssets) {
        let size = 0;
        let finalUri = asset.uri;

        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          if (info.localUri) {
            finalUri = info.localUri;
          }
          const infoSize = (info as any).fileSize;
          if (typeof infoSize === "number" && infoSize > 0) {
            size = infoSize;
          } else {
            const fsInfo = await FileSystem.getInfoAsync(finalUri);
            if (fsInfo.exists && fsInfo.size) {
              size = fsInfo.size;
            }
          }
        } catch (e) {
          console.log("Could not get detailed asset info:", e);
        }

        const extParts = (asset.filename || finalUri).split(".");
        const ext = (extParts.length > 1 ? extParts.pop() : "jpg")?.toLowerCase() || "jpg";
        let mimeType = "image/jpeg";
        if (ext === "png") mimeType = "image/png";
        if (ext === "gif") mimeType = "image/gif";
        if (ext === "webp") mimeType = "image/webp";
        if (ext === "heic") mimeType = "image/heic";

        const fileName =
          asset.filename ||
          `photo_${(asset.id || "img").replace(/[^a-zA-Z0-9]/g, "_")}.${ext}`;

        preparedFiles.push({
          id: `${asset.id || asset.uri}-${Date.now()}`,
          name: fileName,
          size: size || 1024,
          uri: finalUri,
          type: "image",
          mimeType,
        });
      }

      await clearSharedFiles();

      const BATCH_SIZE = 4;
      for (let i = 0; i < preparedFiles.length; i += BATCH_SIZE) {
        const chunk = preparedFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(chunk.map((file) => copyFileToServer(file.uri, file.name)));
      }

      router.push("/send/devices");
    } catch (error: any) {
      console.log("Send photos error:", error);
      Alert.alert(
        "Transfer Preparation Failed",
        error?.message || "Failed to prepare photos for sharing."
      );
    } finally {
      setIsProcessingSend(false);
    }
  };

  // 8. Render Item Handler for FlatList
  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        const isGroupFullySelected =
          item.assets.length > 0 &&
          item.assets.every((a) => selectedAssetIds.has(a.id || a.uri));

        return (
          <View className="flex-row items-center justify-between pt-5 pb-2 px-1">
            <Text className="text-white text-base font-bold tracking-wide">
              {item.title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleGroupSelection(item.assets)}
              className="py-1 px-2.5 rounded-full bg-slate-800/60 flex-row items-center gap-1.5"
            >
              <MaterialCommunityIcons
                name={isGroupFullySelected ? "check-circle" : "circle-outline"}
                size={14}
                color={isGroupFullySelected ? "#0d8274" : "#94a3b8"}
              />
              <Text
                className={`text-xs font-medium ${
                  isGroupFullySelected ? "text-[#0d8274]" : "text-slate-400"
                }`}
              >
                {isGroupFullySelected ? "Deselect All" : "Select All"}
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
        />
      );
    },
    [selectedAssetIds, toggleGroupSelection, togglePhotoSelection]
  );

  // 9. Permission Request Screen
  if (permissionStatus === "loading") {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] items-center justify-center">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#0d8274" />
        <Text className="text-slate-400 text-sm mt-3 font-medium">
          Checking permissions...
        </Text>
      </SafeAreaView>
    );
  }

  if (permissionStatus !== "granted") {
    return (
      <SafeAreaView className="flex-1 bg-[#090d10] justify-between" edges={["top", "left", "right"]}>
        <StatusBar barStyle="light-content" />
        <View className="px-5 pt-4 pb-2 border-b border-slate-800/60 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-800/60 items-center justify-center"
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Photos</Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-[#0d8274]/20 items-center justify-center mb-6 border border-[#0d8274]/30">
            <MaterialCommunityIcons name="image-lock-outline" size={40} color="#0d8274" />
          </View>

          <Text className="text-white text-xl font-bold text-center mb-3">
            Allow Air-DropX to access your photos
          </Text>

          <Text className="text-slate-400 text-sm text-center leading-6 mb-8">
            Air-DropX requires permission to access your photo library so you can select and transfer photos to nearby devices.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={requestPermissions}
            className="w-full bg-[#0d8274] py-4 rounded-xl items-center justify-center shadow-lg active:bg-[#0a665b]"
          >
            <Text className="text-white text-base font-bold">Allow Photo Access</Text>
          </TouchableOpacity>

          {!canAskAgain && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openSettings()}
              className="mt-4 py-2 px-4"
            >
              <Text className="text-[#0d8274] text-sm font-semibold">
                Open Device Settings
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <BottomNavigation currentTab="photos" />
      </SafeAreaView>
    );
  }

  // 10. Main Photos Screen Render
  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-slate-800/80 bg-[#0b1217] flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full bg-slate-800/70 items-center justify-center"
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold tracking-wide">
              Photos
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} on device
            </Text>
          </View>
        </View>

        {photos.length > 0 && (
          <View className="flex-row items-center gap-2">
            {selectedAssetIds.size > 0 ? (
              <TouchableOpacity
                onPress={clearSelection}
                activeOpacity={0.7}
                className="py-1.5 px-3 rounded-full bg-slate-800/80"
              >
                <Text className="text-slate-300 text-xs font-semibold">Clear</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={selectAllPhotos}
                activeOpacity={0.7}
                className="py-1.5 px-3 rounded-full bg-slate-800/80"
              >
                <Text className="text-[#0d8274] text-xs font-semibold">Select All</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Grid List Container */}
      <View className="flex-1 px-2">
        {loadingPhotos ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0d8274" />
            <Text className="text-slate-400 text-sm mt-3 font-medium">
              Loading Photos...
            </Text>
          </View>
        ) : photos.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-16 h-16 rounded-full bg-slate-800/60 items-center justify-center mb-4">
              <MaterialCommunityIcons name="image-off-outline" size={36} color="#64748b" />
            </View>
            <Text className="text-white text-lg font-bold text-center">
              No Photos Found
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1 leading-5">
              Photos from your device will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={listItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            updateCellsBatchingPeriod={30}
            windowSize={7}
            removeClippedSubviews={Platform.OS === "android"}
          />
        )}
      </View>

      {/* Floating Send Bar */}
      {selectedAssetIds.size > 0 && (
        <View
          style={{ bottom: 58 + Math.max(insets?.bottom ?? 0, 10) }}
          className="absolute left-4 right-4 bg-[#111922] border border-[#0d8274]/40 rounded-2xl p-3.5 flex-row items-center justify-between shadow-2xl z-20"
        >
          <View className="flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-full bg-[#0d8274] items-center justify-center">
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
            </View>
            <Text className="text-white text-base font-bold">
              {selectedAssetIds.size} Photo
              {selectedAssetIds.size !== 1 ? "s" : ""} Selected
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isProcessingSend}
            onPress={handleSendSelectedPhotos}
            className="bg-[#0d8274] px-6 py-2.5 rounded-xl flex-row items-center gap-2 shadow-md active:bg-[#0a665b]"
          >
            {isProcessingSend ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white text-sm font-bold">Preparing...</Text>
              </>
            ) : (
              <>
                <Text className="text-white text-sm font-bold">Send</Text>
                <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation currentTab="photos" />
    </SafeAreaView>
  );
}