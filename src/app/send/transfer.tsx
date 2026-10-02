import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import AppHeader from "../../components/AppHeader";
import CircularProgress from "../../components/ui/CircularProgress";

export default function TransferScreen() {
  const [paused, setPaused] = useState(false);
  const [progress] = useState(0.45);
  const [speed] = useState("18.4 MB/s");
  const [eta] = useState("12 sec");

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Sending Files" subtitle="Transferring to connected device" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Main Active Item Card */}
        <View className="rounded-3xl bg-[#141e24] border border-[#1f2d36] p-5 shadow-xl mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-12 h-12 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
                <MaterialCommunityIcons name="export" size={24} color="#0d8274" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>
                  presentation_video.mp4
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">185.4 MB / 412.0 MB</Text>
              </View>
            </View>

            <CircularProgress
              percentage={Math.round(progress * 100)}
              size={64}
              strokeWidth={6}
              color="#0d8274"
            />
          </View>

          {/* Transfer Details */}
          <View className="flex-row items-center justify-between bg-[#0c1318] border border-[#1f2d36] p-3 rounded-2xl mb-4">
            <View>
              <Text className="text-slate-400 text-[11px]">Speed</Text>
              <Text className="text-[#10b981] text-sm font-bold mt-0.5">{speed}</Text>
            </View>

            <View className="h-6 w-[1px] bg-[#1f2d36]" />

            <View>
              <Text className="text-slate-400 text-[11px]">ETA</Text>
              <Text className="text-white text-sm font-bold mt-0.5">{eta}</Text>
            </View>

            <View className="h-6 w-[1px] bg-[#1f2d36]" />

            <View>
              <Text className="text-slate-400 text-[11px]">Status</Text>
              <Text className="text-sky-400 text-sm font-bold mt-0.5">
                {paused ? "Paused" : "Sending..."}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setPaused(!paused)}
              activeOpacity={0.8}
              className="flex-1 bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center flex-row justify-center gap-1.5"
            >
              <MaterialCommunityIcons name={paused ? "play" : "pause"} size={18} color="#f8fafc" />
              <Text className="text-white text-xs font-bold">{paused ? "Resume" : "Pause"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="flex-1 bg-red-500/20 border border-red-500/40 py-3 rounded-xl items-center flex-row justify-center gap-1.5"
            >
              <MaterialCommunityIcons name="close" size={18} color="#ef4444" />
              <Text className="text-red-400 text-xs font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transfer Queue Section */}
        <Text className="text-white text-base font-bold mb-3">Transfer Queue (3 items)</Text>

        <View className="gap-2.5">
          {/* Completed Item */}
          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <MaterialCommunityIcons name="check-circle" size={22} color="#10b981" />
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                  vacation_photo.jpg
                </Text>
                <Text className="text-slate-400 text-xs">4.2 MB • Completed</Text>
              </View>
            </View>
            <Text className="text-[#10b981] text-xs font-bold">Done</Text>
          </View>

          {/* Sending Item */}
          <View className="rounded-2xl bg-[#141e24] border border-[#0d8274]/50 p-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <MaterialCommunityIcons name="loading" size={22} color="#0d8274" />
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                  presentation_video.mp4
                </Text>
                <Text className="text-slate-400 text-xs">412.0 MB • Sending</Text>
              </View>
            </View>
            <Text className="text-[#0d8274] text-xs font-bold">45%</Text>
          </View>

          {/* Waiting Item */}
          <View className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-3.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <MaterialCommunityIcons name="clock-outline" size={22} color="#64748b" />
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                  project_proposal.pdf
                </Text>
                <Text className="text-slate-400 text-xs">12.5 MB • Waiting</Text>
              </View>
            </View>
            <Text className="text-slate-500 text-xs font-semibold">Queued</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
