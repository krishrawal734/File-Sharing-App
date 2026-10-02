import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";

import AppHeader from "../../components/AppHeader";
import { clearSharedFiles, copyFileToServer } from "../../server/localServer";

export default function SendScreen() {
  const [showTextModal, setShowTextModal] = useState(false);
  const [textContent, setTextContent] = useState("");

  const handleSendText = async () => {
    if (!textContent.trim()) {
      Alert.alert("Empty Text", "Please enter text or a URL to send.");
      return;
    }

    try {
      // Save text file to local server for sharing
      const fileName = `shared_text_${Date.now()}.txt`;
      await clearSharedFiles();
      
      const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(tempUri, textContent);
      await copyFileToServer(tempUri, fileName);

      setShowTextModal(false);
      setTextContent("");
      router.push("/send/devices");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to prepare text for sharing.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Screen Header */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <AppHeader title="Send Files" subtitle="Select category to share" />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Categories Grid */}
        <Text className="text-white text-base font-bold mb-3">Categories</Text>
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {/* Photos */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/photos")}
            className="w-[48%] rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-teal-500/20 items-center justify-center">
              <MaterialCommunityIcons name="image-multiple" size={22} color="#0d8274" />
            </View>
            <View>
              <Text className="text-white text-sm font-bold">Photos</Text>
              <Text className="text-slate-400 text-[11px]">Media Gallery</Text>
            </View>
          </TouchableOpacity>

          {/* Videos */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/videos")}
            className="w-[48%] rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-sky-500/20 items-center justify-center">
              <MaterialCommunityIcons name="video" size={22} color="#38bdf8" />
            </View>
            <View>
              <Text className="text-white text-sm font-bold">Videos</Text>
              <Text className="text-slate-400 text-[11px]">Video Library</Text>
            </View>
          </TouchableOpacity>

          {/* Music */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/music")}
            className="w-[48%] rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
              <MaterialCommunityIcons name="music" size={22} color="#c084fc" />
            </View>
            <View>
              <Text className="text-white text-sm font-bold">Music</Text>
              <Text className="text-slate-400 text-[11px]">Audio Tracks</Text>
            </View>
          </TouchableOpacity>

          {/* Documents & Files */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/send/files")}
            className="w-[48%] rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-xl bg-emerald-500/20 items-center justify-center">
              <MaterialCommunityIcons name="file-document" size={22} color="#34d399" />
            </View>
            <View>
              <Text className="text-white text-sm font-bold">Documents</Text>
              <Text className="text-slate-400 text-xs">PDFs & Files</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Specialized Tools & Quick Sharing */}
        <Text className="text-white text-base font-bold mb-3">Quick Share Tools</Text>
        <View className="gap-3">
          {/* Send Text / Link */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowTextModal(true)}
            className="rounded-2xl bg-[#141e24] border border-[#1f2d36] p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-amber-500/20 items-center justify-center">
                <MaterialCommunityIcons name="text-box-plus-outline" size={22} color="#fbbf24" />
              </View>
              <View>
                <Text className="text-white text-sm font-bold">Send Text or Link</Text>
                <Text className="text-slate-400 text-xs">Share notes, text snippets & URLs</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

        </View>

        {/* Primary Select Files Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/send/files")}
          className="mt-6 bg-[#0d8274] py-4 rounded-2xl items-center flex-row justify-center gap-2 shadow-xl active:bg-[#096358]"
        >
          <MaterialCommunityIcons name="plus-circle" size={22} color="#FFFFFF" />
          <Text className="text-white text-base font-bold">Browse All Files</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Send Text Modal */}
      <Modal visible={showTextModal} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-[#141e24] border border-[#1f2d36] rounded-3xl p-5 shadow-2xl">
            <Text className="text-white text-lg font-bold mb-1">Send Text or URL</Text>
            <Text className="text-slate-400 text-xs mb-3">
              Enter text or a link to share instantly with connected devices.
            </Text>

            <TextInput
              value={textContent}
              onChangeText={setTextContent}
              placeholder="Type or paste text/link here..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              className="bg-[#0c1318] border border-[#1f2d36] rounded-2xl p-4 text-white text-sm mb-4 min-h-[100px]"
              textAlignVertical="top"
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowTextModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800"
              >
                <Text className="text-slate-300 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendText}
                className="px-5 py-2.5 rounded-xl bg-[#0d8274]"
              >
                <Text className="text-white font-bold text-sm">Share Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
