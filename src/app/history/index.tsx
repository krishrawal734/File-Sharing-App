import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppHeader from "../../components/AppHeader";
import {
  clearTransferHistory,
  getTransferHistory,
  TransferHistory,
} from "../../database/database";

export default function HistoryScreen() {
  const [history, setHistory] = useState<TransferHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------
  // LOAD HISTORY
  // --------------------------------
  const loadHistory = async () => {
    try {
      setLoading(true);
      const records = await getTransferHistory();
      setHistory(records);
    } catch (error) {
      console.log("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // --------------------------------
  // FORMAT FILE SIZE
  // --------------------------------
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(2)} ${units[index] || "GB"}`;
  };

  // --------------------------------
  // FORMAT DATE
  // --------------------------------
  const formatDate = (dateStr: string) => {
    try {
      const parsedDate = new Date(dateStr);
      return parsedDate.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // --------------------------------
  // STATUS BADGE CONFIG
  // --------------------------------
  const getStatusBadge = (status: TransferHistory["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-[#0d8274]/20",
          border: "border-[#0d8274]/40",
          text: "text-[#10b981]",
          label: "Completed",
          icon: "check-circle-outline" as const,
        };
      case "failed":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          label: "Failed",
          icon: "alert-circle-outline" as const,
        };
      case "cancelled":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          label: "Cancelled",
          icon: "close-circle-outline" as const,
        };
      default:
        return {
          bg: "bg-slate-800",
          border: "border-slate-700",
          text: "text-slate-400",
          label: status,
          icon: "clock-outline" as const,
        };
    }
  };

  // --------------------------------
  // CLEAR HISTORY
  // --------------------------------
  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all transfer history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearTransferHistory();
              setHistory([]);
              Alert.alert("Success", "All transfer records deleted.");
            } catch (error) {
              console.log("Clear history error:", error);
              Alert.alert("Error", "Could not clear history.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-4 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader
          title="Transfer History"
          subtitle="Log of sent and received transfers"
          rightElement={
            history.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearHistory}
                activeOpacity={0.7}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex-row items-center gap-1"
              >
                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#f87171" />
                <Text className="text-red-400 text-xs font-semibold">Clear</Text>
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      <View className="flex-1 p-4">
        {/* LOADING STATE */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <MaterialCommunityIcons name="loading" size={32} color="#0d8274" />
            <Text className="text-slate-400 text-sm mt-3">Loading history...</Text>
          </View>
        ) : history.length === 0 ? (
          /* EMPTY STATE */
          <View className="flex-1 items-center justify-center p-6">
            <View className="w-20 h-20 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center mb-4">
              <MaterialCommunityIcons name="history" size={38} color="#0d8274" />
            </View>
            <Text className="text-white text-lg font-bold text-center">No Transfer History</Text>
            <Text className="text-slate-400 text-sm text-center mt-1 leading-5">
              Files you send or receive across devices will appear here automatically.
            </Text>
          </View>
        ) : (
          /* HISTORY LIST */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {history.map((item) => {
              const badge = getStatusBadge(item.status);
              const isReceived = item.direction === "received";

              return (
                <View
                  key={item.id}
                  className="mb-3 rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4"
                >
                  {/* TOP ROW */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`w-8 h-8 rounded-lg items-center justify-center ${
                          isReceived ? "bg-[#0d8274]/20" : "bg-blue-500/20"
                        }`}
                      >
                        <MaterialCommunityIcons
                          name={isReceived ? "arrow-bottom-left" : "arrow-top-right"}
                          size={18}
                          color={isReceived ? "#10b981" : "#60a5fa"}
                        />
                      </View>
                      <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                        {isReceived ? "Received" : "Sent"}
                      </Text>
                    </View>

                    {/* STATUS BADGE */}
                    <View
                      className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1 ${badge.bg} ${badge.border}`}
                    >
                      <MaterialCommunityIcons
                        name={badge.icon}
                        size={12}
                        color={
                          badge.text.includes("emerald") || badge.text.includes("10b981")
                            ? "#10b981"
                            : badge.text.includes("red")
                            ? "#f87171"
                            : "#fbbf24"
                        }
                      />
                      <Text className={`text-[11px] font-semibold ${badge.text}`}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* FILE INFO */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-[#090d10] border border-[#1f2d36] items-center justify-center">
                      <MaterialCommunityIcons name="file-document-outline" size={22} color="#0d8274" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                        {item.fileName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-slate-400 text-xs">{formatBytes(item.fileSize)}</Text>
                        <Text className="text-slate-600 text-xs">•</Text>
                        <Text className="text-slate-400 text-xs">{formatDate(item.date)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}