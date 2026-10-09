import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type TabName = "home" | "photos" | "videos" | "music" | "files";

interface TabItem {
  id: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
}

const TABS: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
    route: "/",
  },
  {
    id: "photos",
    label: "Photos",
    icon: "image-outline",
    activeIcon: "image",
    route: "/photos",
  },
  {
    id: "videos",
    label: "Videos",
    icon: "video-outline",
    activeIcon: "video",
    route: "/videos",
  },
  {
    id: "music",
    label: "Music",
    icon: "music-note-outline",
    activeIcon: "music-note",
    route: "/music",
  },
  {
    id: "files",
    label: "Files",
    icon: "folder-outline",
    activeIcon: "folder",
    route: "/send/files",
  },
];

interface BottomNavigationProps {
  currentTab: TabName;
}

function BottomNavigationComponent({ currentTab }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets?.bottom ?? 0, 10);

  return (
    <View
      style={{ paddingBottom }}
      className="flex-row bg-[#0c1318] border-t border-[#18242c] pt-2 px-2 justify-around items-center z-30"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === currentTab;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route as any);
              }
            }}
            className="items-center justify-center flex-1 py-1"
          >
            <View
              className={`items-center justify-center px-3 py-1 rounded-full ${
                isActive ? "bg-[#0d8274]/20 border border-[#0d8274]/40" : ""
              }`}
            >
              <MaterialCommunityIcons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? "#0d8274" : "#64748b"}
              />
            </View>
            <Text
              className={`text-[11px] mt-0.5 font-medium ${
                isActive ? "text-[#0d8274] font-bold" : "text-slate-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default memo(BottomNavigationComponent);
