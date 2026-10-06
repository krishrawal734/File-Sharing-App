import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import CircularProgress from "../../components/ui/CircularProgress";

interface QueueItem {
  id: string;
  name: string;
  size: string;
  status: "completed" | "transferring" | "queued";
  progress: number;
}

export default function TransferScreen() {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0.45);
  const [speed, setSpeed] = useState("18.4 MB/s");
  const [eta, setEta] = useState(12);

  const [queue, setQueue] = useState<QueueItem[]>([
    { id: "1", name: "vacation_photo.jpg", size: "4.2 MB", status: "completed", progress: 100 },
    { id: "2", name: "presentation_video.mp4", size: "412.0 MB", status: "transferring", progress: 45 },
    { id: "3", name: "project_proposal.pdf", size: "12.5 MB", status: "queued", progress: 0 },
  ]);

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1.0) {
          // Current item finished, advance queue
          setQueue((prevQueue) =>
            prevQueue.map((item) => {
              if (item.status === "transferring") {
                return { ...item, status: "completed", progress: 100 };
              }
              if (item.status === "queued") {
                return { ...item, status: "transferring", progress: 10 };
              }
              return item;
            })
          );
          setEta(0);
          return 1.0;
        }

        const next = Math.min(prev + 0.05, 1.0);
        const remainingPercentage = (1 - next) * 100;
        setEta(Math.max(1, Math.round(remainingPercentage / 5)));
        
        // Random slight speed fluctuation for realistic UI
        const currentSpeedVal = (16.5 + Math.random() * 4).toFixed(1);
        setSpeed(`${currentSpeedVal} MB/s`);

        setQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.status === "transferring"
              ? { ...item, progress: Math.round(next * 100) }
              : item
          )
        );

        return next;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [paused]);

  const activeItem = queue.find((q) => q.status === "transferring") || queue[1];
  const allCompleted = queue.every((q) => q.status === "completed");

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader
          title={allCompleted ? "Transfer Finished" : "Sending Files"}
          subtitle={allCompleted ? "All files sent successfully" : "Transferring to connected device"}
        />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Main Active Item Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 shadow-xl mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-12 h-12 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
                <MaterialCommunityIcons
                  name={allCompleted ? "check-circle" : "export"}
                  size={24}
                  color={allCompleted ? "#10b981" : "#0d8274"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>
                  {activeItem?.name || "Files Transfer"}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {allCompleted ? "Batch Complete" : `${activeItem?.size || "412 MB"}`}
                </Text>
              </View>
            </View>

            <CircularProgress
              percentage={Math.round(progress * 100)}
              size={64}
              strokeWidth={6}
              color={allCompleted ? "#10b981" : "#0d8274"}
            />
          </View>

          {/* Transfer Details */}
          <View className="flex-row items-center justify-between bg-[#0c1318] border border-[#1f2d36] p-3 rounded-2xl mb-4">
            <View>
              <Text className="text-slate-400 text-[11px]">Speed</Text>
              <Text className="text-[#10b981] text-sm font-bold mt-0.5">
                {allCompleted ? "0 MB/s" : speed}
              </Text>
            </View>

            <View className="h-6 w-[1px] bg-[#1f2d36]" />

            <View>
              <Text className="text-slate-400 text-[11px]">ETA</Text>
              <Text className="text-white text-sm font-bold mt-0.5">
                {allCompleted ? "Done" : `${eta} sec`}
              </Text>
            </View>

            <View className="h-6 w-[1px] bg-[#1f2d36]" />

            <View>
              <Text className="text-slate-400 text-[11px]">Status</Text>
              <Text
                className={`text-sm font-bold mt-0.5 ${
                  allCompleted
                    ? "text-[#10b981]"
                    : paused
                    ? "text-amber-400"
                    : "text-sky-400"
                }`}
              >
                {allCompleted ? "Complete" : paused ? "Paused" : "Sending..."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            {!allCompleted && (
              <TouchableOpacity
                onPress={() => setPaused(!paused)}
                activeOpacity={0.8}
                className="flex-1 bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center flex-row justify-center gap-1.5"
              >
                <MaterialCommunityIcons name={paused ? "play" : "pause"} size={18} color="#f8fafc" />
                <Text className="text-white text-xs font-bold">{paused ? "Resume" : "Pause"}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-1.5 ${
                allCompleted
                  ? "bg-[#0d8274] border border-[#10b981]"
                  : "bg-red-500/20 border border-red-500/40"
              }`}
            >
              <MaterialCommunityIcons
                name={allCompleted ? "check" : "close"}
                size={18}
                color={allCompleted ? "#ffffff" : "#ef4444"}
              />
              <Text className={`text-xs font-bold ${allCompleted ? "text-white" : "text-red-400"}`}>
                {allCompleted ? "Done" : "Cancel"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer Queue Section */}
        <Text className="text-white text-base font-bold mb-3">
          Transfer Queue ({queue.length} items)
        </Text>

        <View className="gap-2.5">
          {queue.map((item) => (
            <View
              key={item.id}
              className={`rounded-2xl bg-[#141e24] p-3.5 flex-row items-center justify-between border ${
                item.status === "transferring"
                  ? "border-[#0d8274]/50"
                  : item.status === "completed"
                  ? "border-[#10b981]/30"
                  : "border-[#1f2d36]"
              }`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <MaterialCommunityIcons
                  name={
                    item.status === "completed"
                      ? "check-circle"
                      : item.status === "transferring"
                      ? "loading"
                      : "clock-outline"
                  }
                  size={22}
                  color={
                    item.status === "completed"
                      ? "#10b981"
                      : item.status === "transferring"
                      ? "#0d8274"
                      : "#64748b"
                  }
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {item.size} • {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text
                className={`text-xs font-bold ${
                  item.status === "completed"
                    ? "text-[#10b981]"
                    : item.status === "transferring"
                    ? "text-[#0d8274]"
                    : "text-slate-500"
                }`}
              >
                {item.status === "completed" ? "Done" : `${item.progress}%`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
