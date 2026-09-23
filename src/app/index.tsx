import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#055248]">
      <StatusBar style="light" />

      {/* Top Banner Header Card */}
      <View className="overflow-hidden rounded-b-[38px] shadow-lg">
        <LinearGradient
          colors={["#0a7a6c", "#055248"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Top Bar Actions: Sidebar Menu Button (Left) */}
          <View className="w-full flex-row items-center justify-between  mt-4 px-0">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSidebarOpen(true)}
              className="w-14 h-14 rounded-full bg-white/15 items-center justify-center"
            >
              <MaterialCommunityIcons name="menu" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* White Circular Badge */}
          <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-3 shadow-md">
            <MaterialCommunityIcons
              name="shuffle-variant"
              size={38}
              color="#0d8274"
            />
          </View>

          {/* App Title & Subtitle */}
          <Text className="text-white text-3xl font-bold tracking-wide text-center">
            Air—DropX
          </Text>
          <Text className="text-teal-100 text-sm font-normal text-center mt-1">
            File Share
          </Text>
        </LinearGradient>
      </View>

      {/* Main Content Body */}
      <View className="flex-1 bg-[#f3f6f5]">
        <ScrollView
          contentContainerClassName="pt-6 pb-12 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Headline */}
          <Text className="text-center text-slate-800 text-xl font-bold mb-6">
            Share files instantly
          </Text>

          {/* Action Cards (Send & Receive) */}
          <View className="flex-row gap-4 mb-7">
            {/* Send Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/send")}
              className="flex-1 rounded-[26px] overflow-hidden shadow-md"
            >
              <LinearGradient
                colors={["#0d8274", "#055248"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Send Icon Circle */}
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center self-center overflow-hidden">
                  <MaterialCommunityIcons
                    name="send"
                    size={30}
                    color="#FFFFFF"
                    style={{ transform: [{ rotate: "-45deg" }] }}
                  />
                </View>

                {/* Send Text */}
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold text-center">
                    Send
                  </Text>
                  <Text className="text-white/80 text-xs font-normal text-center mt-1.5 leading-4">
                    Share files to another{"\n"}device
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Receive Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/receive")}
              className="flex-1 rounded-[26px] overflow-hidden shadow-md"
            >
              <LinearGradient
                colors={["#00aee0", "#007aa3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Receive Icon Circle */}
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center self-center overflow-hidden">
                  <MaterialCommunityIcons
                    name="tray-arrow-down"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>

                {/* Receive Text */}
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold text-center">
                    Receive
                  </Text>
                  <Text className="text-white/80 text-xs font-normal text-center mt-1.5 leading-4">
                    Get files from another{"\n"}device
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Action Tiles (Scan QR & History) */}
          <View className="flex-row justify-center gap-8 mb-8">
            {/* Scan QR */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/receive/scan")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-[20px] bg-[#dcfce7] items-center justify-center mb-2 shadow-xs border border-emerald-100 ">
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={28}
                  color="#0d8274"
                />
              </View>
              <Text className="text-slate-600 text-xs font-medium text-center">
                Scan QR
              </Text>
            </TouchableOpacity>

            {/* History */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/history")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-[20px] bg-[#e0f2fe] items-center justify-center mb-2 shadow-xs border border-sky-100">
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={28}
                  color="#0ea5e9"
                />
              </View>
              <Text className="text-slate-600 text-xs font-medium text-center">
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transfers Section */}
          <View className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
            {/* Header Row */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 text-lg font-bold">
                Recent Transfers
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/history")}
                activeOpacity={0.7}
              >
                <Text className="text-[#0d8274] text-sm font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Empty State Body */}
            <View className="items-center justify-center py-8">
              <MaterialCommunityIcons
                name="file-document-outline"
                size={52}
                color="#94a3b8"
              />
              <Text className="text-slate-700 font-semibold text-base mt-3">
                No recent transfers
              </Text>
              <Text className="text-slate-400 text-xs mt-1 text-center">
                Your transfer history will appear here
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Mobile Sidebar Navigation Drawer Modal */}
      <Modal
        visible={isSidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View className="flex-1 flex-row">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Drawer Container */}
          <View className="w-4/5 max-w-xs bg-white h-full z-10 elevation-10 shadow-2xl justify-between">
            <View>
              {/* Drawer Top Header */}
              <LinearGradient
                colors={["#0a7a6c", "#055248"]}
                className="pt-12 pb-6 px-"
              >
                <View className="flex-row items-center justify-between mb-4 px-4 py-4 m">
                  <View className="w-14 h-14 rounded-full bg-white items-center justify-center mt-5 mb shadow-sm">
                    <MaterialCommunityIcons
                      name="shuffle-variant"
                      size={30}
                      color="#0d8274"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => setIsSidebarOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/20 items-center justify-center "
                  >
                    <MaterialCommunityIcons
                  
                      name="close"
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-white text-xl font-bold px-4 ">
                  Air—DropX
                </Text>
                <Text className="text-teal-100 text-xs mb-2 mt-1 px-4">
                  File Share App
                </Text>
              </LinearGradient>

              {/* Sidebar Menu Items */}
              <View className="p-3 gap-1">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/settings");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl active:bg-slate-100"
                >
                  <MaterialCommunityIcons
                    name="cog-outline"
                    size={22}
                    color="#0d8274"
                  />
                  <Text className="text-slate-800 text-base font-semibold">
                    Settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/send");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl active:bg-slate-100"
                >
                  <MaterialCommunityIcons
                    name="send-outline"
                    size={22}
                    color="#0d8274"
                  />
                  <Text className="text-slate-800 text-base font-semibold">
                    Send Files
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/receive");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl active:bg-slate-100"
                >
                  <MaterialCommunityIcons
                    name="tray-arrow-down"
                    size={22}
                    color="#0d8274"
                  />
                  <Text className="text-slate-800 text-base font-semibold">
                    Receive Files
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/receive/scan");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl active:bg-slate-100"
                >
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={22}
                    color="#0d8274"
                  />
                  <Text className="text-slate-800 text-base font-semibold">
                    Scan QR Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsSidebarOpen(false);
                    router.push("/history");
                  }}
                  className="flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl active:bg-slate-100"
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={22}
                    color="#0d8274"
                  />
                  <Text className="text-slate-800 text-base font-semibold">
                    Transfer History
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sidebar Bottom Footer */}
            <View className="p-4 border-t border-slate-100 bg-slate-50">
              <Text className="text-slate-500 text-xs text-center">
                File Share App v1.0.0
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardGradient: {
    padding: 20,
    height: 215,
    justifyContent: "space-between",
  },
});
