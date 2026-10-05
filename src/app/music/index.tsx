import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library/legacy";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import SearchBar from "../../components/ui/SearchBar";

interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

export default function MusicScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | "playlists">("all");
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Playlist state
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: "fav", name: "Favorites", songIds: [] },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Music Player State
  const [currentSong, setCurrentSong] = useState<MediaLibrary.Asset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Load local music
  const loadDeviceMusic = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MediaLibrary.getPermissionsAsync();
      if (res.granted) {
        const result = await MediaLibrary.getAssetsAsync({
          first: 300,
          mediaType: MediaLibrary.MediaType.audio,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        });
        setSongs(result.assets || []);
      } else {
        const req = await MediaLibrary.requestPermissionsAsync();
        if (req.granted) {
          const result = await MediaLibrary.getAssetsAsync({
            first: 300,
            mediaType: MediaLibrary.MediaType.audio,
          });
          setSongs(result.assets || []);
        }
      }
    } catch (e) {
      console.log("Error loading audio:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) loadDeviceMusic();
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [loadDeviceMusic]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter((s) => s.filename?.toLowerCase().includes(q));
  }, [songs, searchQuery]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Create Playlist
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: newPlaylistName.trim(),
      songIds: [],
    };
    setPlaylists((prev) => [...prev, newPl]);
    setNewPlaylistName("");
    setShowCreateModal(false);
  };

  // Play Song
  const playSong = (song: MediaLibrary.Asset) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const renderSongItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isFav = favorites.has(item.id || item.uri);
    const isCurrent = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => playSong(item)}
        className={`flex-row items-center justify-between p-3.5 mb-2 rounded-2xl bg-[#141e24] border ${
          isCurrent ? "border-[#0d8274] bg-[#0d8274]/15" : "border-[#1f2d36]"
        }`}
      >
        <View className="flex-row items-center gap-3.5 flex-1 pr-2">
          <View className="w-12 h-12 rounded-xl bg-[#0d8274]/20 items-center justify-center border border-[#0d8274]/30">
            <MaterialCommunityIcons
              name={isCurrent && isPlaying ? "pause-circle" : "music-note"}
              size={24}
              color="#0d8274"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold" numberOfLines={1}>
              {item.filename || "Audio Track"}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">Audio Track</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => toggleFavorite(item.id || item.uri)} className="p-2">
          <MaterialCommunityIcons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#ef4444" : "#64748b"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#090d10]" edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View className="px-4 pt-3 pb-3 border-b border-[#1f2d36] bg-[#0c1318]">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full bg-[#141e24] border border-[#1f2d36] items-center justify-center"
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold tracking-wide">Music</Text>
              <Text className="text-slate-400 text-xs mt-0.5">{songs.length} tracks available</Text>
            </View>
          </View>
        </View>

        {/* Top Tabs */}
        <View className="flex-row bg-[#141e24] p-1 rounded-2xl border border-[#1f2d36] justify-between">
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            className={`flex-1 py-1.5 rounded-xl items-center ${activeTab === "all" ? "bg-[#0d8274]" : ""}`}
          >
            <Text className={`text-xs font-bold ${activeTab === "all" ? "text-white" : "text-slate-400"}`}>
              All Music
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("playlists")}
            className={`flex-1 py-1.5 rounded-xl items-center ${
              activeTab === "playlists" ? "bg-[#0d8274]" : ""
            }`}
          >
            <Text className={`text-xs font-bold ${activeTab === "playlists" ? "text-white" : "text-slate-400"}`}>
              Playlists
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Body */}
      {activeTab === "playlists" ? (
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 140 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base font-bold">My Playlists</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="bg-[#0d8274] px-3.5 py-1.5 rounded-xl flex-row items-center gap-1"
            >
              <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold">New Playlist</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2.5">
            {playlists.map((pl) => (
              <View
                key={pl.id}
                className="flex-row items-center justify-between p-4 rounded-2xl bg-[#141e24] border border-[#1f2d36]"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 items-center justify-center">
                    <MaterialCommunityIcons
                      name={pl.id === "fav" ? "heart" : "playlist-music"}
                      size={24}
                      color={pl.id === "fav" ? "#ef4444" : "#c084fc"}
                    />
                  </View>
                  <View>
                    <Text className="text-white text-base font-bold">{pl.name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {pl.id === "fav" ? favorites.size : pl.songIds.length} tracks
                    </Text>
                  </View>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={20} color="#64748b" />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* All Music List */
        <View className="flex-1 px-4 pt-3">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs..."
            className="mb-3"
          />

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#0d8274" />
            </View>
          ) : filteredSongs.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <MaterialCommunityIcons name="music-off" size={44} color="#475569" />
              <Text className="text-white text-base font-bold mt-3">No Audio Tracks Found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => item.id || item.uri}
              renderItem={renderSongItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 140 }}
            />
          )}
        </View>
      )}

      {/* Built-in Music Player Bar */}
      {currentSong && (
        <View
          style={{ bottom: 58 + Math.max(insets?.bottom ?? 0, 10) }}
          className="absolute left-3 right-3 bg-[#141e24] border border-[#0d8274]/50 rounded-2xl p-3 flex-row items-center justify-between shadow-2xl z-30"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <View className="w-10 h-10 rounded-xl bg-[#0d8274] items-center justify-center">
              <MaterialCommunityIcons name="music-note" size={22} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-bold" numberOfLines={1}>
                {currentSong.filename || "Audio Track"}
              </Text>
              <Text className="text-slate-400 text-[11px]">Air—DropX Audio Player</Text>
            </View>
          </View>

          {/* Player Controls */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)} className="p-1.5">
              <MaterialCommunityIcons
                name="shuffle-variant"
                size={20}
                color={isShuffle ? "#0d8274" : "#64748b"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#0d8274] items-center justify-center"
            >
              <MaterialCommunityIcons
                name={isPlaying ? "pause" : "play"}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)} className="p-1.5">
              <MaterialCommunityIcons
                name="repeat"
                size={20}
                color={isRepeat ? "#0d8274" : "#64748b"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* New Playlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-[#141e24] border border-[#1f2d36] rounded-3xl p-5 shadow-2xl">
            <Text className="text-white text-lg font-bold mb-3">Create New Playlist</Text>
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Playlist Name"
              placeholderTextColor="#64748b"
              className="bg-[#0c1318] border border-[#1f2d36] rounded-xl px-4 py-3 text-white text-sm mb-4"
              autoFocus
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800"
              >
                <Text className="text-slate-300 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePlaylist}
                className="px-5 py-2.5 rounded-xl bg-[#0d8274]"
              >
                <Text className="text-white font-bold text-sm">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation currentTab="music" />
    </SafeAreaView>
  );
}
