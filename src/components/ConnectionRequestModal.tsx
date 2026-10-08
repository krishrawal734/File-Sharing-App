import React from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ConnectionSession } from "../types/device";

interface ConnectionRequestModalProps {
  session: ConnectionSession | null;
  onAccept: () => void;
  onReject: () => void;
  onDisconnect: () => void;
  onTryAgain: () => void;
}

export default function ConnectionRequestModal({
  session,
  onAccept,
  onReject,
  onDisconnect,
  onTryAgain,
}: ConnectionRequestModalProps) {
  if (!session) return null;

  const { targetDevice, status } = session;

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 bg-black/75 items-center justify-center p-5">
        <View className="w-full max-w-sm rounded-3xl bg-[#141e24] border border-[#1f2d36] p-6 items-center shadow-2xl">
          {/* CONNECTED STATE */}
          {status === "connected" ? (
            <>
              {/* Animated Connection Icon */}
              <View className="flex-row items-center justify-center gap-4 mb-4">
                <View className="w-14 h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
                  <MaterialCommunityIcons name="cellphone" size={28} color="#0d8274" />
                </View>
                <View className="items-center">
                  <MaterialCommunityIcons name="swap-horizontal" size={24} color="#10b981" />
                  <Text className="text-[10px] text-[#10b981] font-bold">Air—DropX</Text>
                </View>
                <View className="w-14 h-14 rounded-2xl bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center">
                  <MaterialCommunityIcons name="laptop" size={28} color="#0d8274" />
                </View>
              </View>

              <View className="flex-row items-center gap-1.5 bg-[#10b981]/15 border border-[#10b981]/30 px-3 py-1 rounded-full mb-2">
                <MaterialCommunityIcons name="check-circle" size={14} color="#10b981" />
                <Text className="text-[#10b981] text-xs font-bold">Device reachable</Text>
              </View>

              <Text className="text-white text-lg font-bold text-center mb-1">
                {targetDevice.name}
              </Text>
              <Text className="text-slate-400 text-xs text-center mb-6">
                Device is reachable on local Wi-Fi; transfers use HTTP.
              </Text>

              {/* ACTION BUTTONS */}
              <View className="w-full gap-2.5">
                <TouchableOpacity
                  onPress={() => {
                    onDisconnect();
                    router.push("/send" as any);
                  }}
                  activeOpacity={0.85}
                  className="bg-[#0d8274] py-3.5 rounded-2xl items-center flex-row justify-center gap-2 shadow-lg"
                >
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                  <Text className="text-white text-sm font-bold">Send Files</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    onDisconnect();
                    router.push("/receive" as any);
                  }}
                  activeOpacity={0.85}
                  className="bg-[#1b2830] border border-[#273844] py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                >
                  <MaterialCommunityIcons name="download" size={18} color="#0d8274" />
                  <Text className="text-[#0d8274] text-sm font-bold">Receive Files</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onDisconnect}
                  activeOpacity={0.85}
                  className="py-3 items-center"
                >
                  <Text className="text-red-400 text-xs font-bold">Disconnect</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : status === "requesting" ? (
            /* OUTGOING REQUEST STATE */
            <>
              <View className="w-16 h-16 rounded-full bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center mb-4">
                <ActivityIndicator size="large" color="#0d8274" />
              </View>
              <Text className="text-white text-lg font-bold text-center mb-1">
                {targetDevice.name}
              </Text>
              <Text className="text-slate-400 text-xs text-center mb-4">
                {targetDevice.platform} • Ready
              </Text>
              <Text className="text-emerald-400 text-xs font-bold mb-6">
                Waiting for approval...
              </Text>

              <TouchableOpacity
                onPress={onDisconnect}
                className="w-full bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center"
              >
                <Text className="text-slate-300 text-xs font-bold">Cancel Request</Text>
              </TouchableOpacity>
            </>
          ) : status === "pending_approval" ? (
            /* INCOMING REQUEST STATE */
            <>
              <View className="w-16 h-16 rounded-full bg-[#0d8274]/20 border border-[#0d8274]/40 items-center justify-center mb-4">
                <MaterialCommunityIcons name="cellphone-wireless" size={32} color="#0d8274" />
              </View>

              <Text className="text-white text-lg font-bold text-center">
                {targetDevice.name}
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-0.5">
                {targetDevice.platform} • Ready
              </Text>
              <Text className="text-white text-sm font-semibold text-center mt-3 mb-6">
                wants to connect with you
              </Text>

              <View className="flex-row items-center gap-3 w-full">
                <TouchableOpacity
                  onPress={onReject}
                  activeOpacity={0.8}
                  className="flex-1 bg-red-500/10 border border-red-500/30 py-3 rounded-xl items-center"
                >
                  <Text className="text-red-400 text-xs font-bold">Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onAccept}
                  activeOpacity={0.8}
                  className="flex-1 bg-[#0d8274] py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-xs font-bold">Accept</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : status === "expired" ? (
            /* EXPIRED STATE */
            <>
              <MaterialCommunityIcons name="clock-alert-outline" size={44} color="#fbbf24" />
              <Text className="text-white text-base font-bold text-center mt-3">
                Connection request expired
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-1 mb-6">
                The other device did not respond in time.
              </Text>

              <View className="flex-row items-center gap-3 w-full">
                <TouchableOpacity
                  onPress={onDisconnect}
                  className="flex-1 bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center"
                >
                  <Text className="text-slate-300 text-xs font-bold">Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onTryAgain}
                  className="flex-1 bg-[#0d8274] py-3 rounded-xl items-center"
                >
                  <Text className="text-white text-xs font-bold">Try Again</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : status === "rejected" ? (
            /* REJECTED STATE */
            <>
              <MaterialCommunityIcons name="close-circle-outline" size={44} color="#f87171" />
              <Text className="text-white text-base font-bold text-center mt-3">
                Connection request declined
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-1 mb-6">
                The target device declined the connection request.
              </Text>

              <TouchableOpacity
                onPress={onDisconnect}
                className="w-full bg-[#1b2830] border border-[#273844] py-3 rounded-xl items-center"
              >
                <Text className="text-slate-300 text-xs font-bold">Close</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
