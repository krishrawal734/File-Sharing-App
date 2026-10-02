import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import CircularProgress from "./ui/CircularProgress";
import { formatFileSize } from "../utils/fileUtils";

interface StorageInfo {
  freeBytes: number;
  totalBytes: number;
  usedBytes: number;
  percentage: number;
  loading: boolean;
}

export default function StorageCard() {
  const [storage, setStorage] = useState<StorageInfo>({
    freeBytes: 0,
    totalBytes: 0,
    usedBytes: 0,
    percentage: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDiskStorage = async () => {
      try {
        let free = 0;
        let total = 0;

        if (FileSystem.getFreeDiskStorageAsync) {
          free = await FileSystem.getFreeDiskStorageAsync();
        }

        if (FileSystem.getTotalDiskCapacityAsync) {
          total = await FileSystem.getTotalDiskCapacityAsync();
        }

        if (!total || total <= 0) {
          total = 128 * 1024 * 1024 * 1024;
          free = free || 98 * 1024 * 1024 * 1024;
        }

        const used = Math.max(0, total - free);
        const percentage = Math.min(Math.round((used / total) * 100), 100);

        if (isMounted) {
          setStorage({
            freeBytes: free,
            totalBytes: total,
            usedBytes: used,
            percentage,
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setStorage({
            freeBytes: 64 * 1024 * 1024 * 1024,
            totalBytes: 128 * 1024 * 1024 * 1024,
            usedBytes: 64 * 1024 * 1024 * 1024,
            percentage: 50,
            loading: false,
          });
        }
      }
    };

    fetchDiskStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 shadow-xl">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
            <MaterialCommunityIcons name="folder-outline" size={22} color="#0d8274" />
          </View>
          <View>
            <Text className="text-white text-base font-bold">Files in Air—DropX</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Device Storage</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/file-manager" as any)}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-2xl bg-[#1b2830] border border-[#273844] items-center justify-center"
          accessibilityLabel="Open File Manager"
        >
          <MaterialCommunityIcons name="folder-open-outline" size={20} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between pt-1">
        <View className="flex-1 pr-4">
          {storage.loading ? (
            <ActivityIndicator size="small" color="#0d8274" />
          ) : (
            <>
              <Text className="text-3xl font-extrabold text-white tracking-tight">
                {storage.percentage}%
              </Text>
              <Text className="text-slate-400 text-xs font-medium mt-1">
                Free {formatFileSize(storage.freeBytes)}
              </Text>
              <Text className="text-slate-500 text-[11px] mt-0.5">
                Total {formatFileSize(storage.totalBytes)}
              </Text>
            </>
          )}
        </View>

        <CircularProgress
          percentage={storage.percentage}
          size={78}
          strokeWidth={8}
          color="#0d8274"
          backgroundColor="rgba(255, 255, 255, 0.08)"
        />
      </View>
    </View>
  );
}
