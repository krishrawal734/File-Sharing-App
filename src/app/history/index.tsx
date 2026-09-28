import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import {
  clearTransferHistory,
  getTransferHistory,
  TransferHistory,
} from "../../database/database";

export default function HistoryScreen() {
  const [history, setHistory] = useState<
    TransferHistory[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  // --------------------------------
  // LOAD HISTORY
  // --------------------------------

  const loadHistory = async () => {
    try {
      setLoading(true);

      const records =
        await getTransferHistory();

      setHistory(records);
    } catch (error) {
      console.log(
        "Failed to load history:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // LOAD WHEN SCREEN OPENS
  // --------------------------------

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // --------------------------------
  // FORMAT FILE SIZE
  // --------------------------------

  const formatBytes = (
    bytes: number
  ) => {
    if (
      !bytes ||
      bytes <= 0
    ) {
      return "0 B";
    }

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    const value =
      bytes /
      Math.pow(
        1024,
        index
      );

    return `${value.toFixed(2)} ${
      units[index] || "GB"
    }`;
  };

  // --------------------------------
  // FORMAT DATE
  // --------------------------------

  const formatDate = (
    date: string
  ) => {
    const parsedDate =
      new Date(date);

    return parsedDate.toLocaleString();
  };

  // --------------------------------
  // STATUS COLOR
  // --------------------------------

  const getStatusColor = (
    status: TransferHistory["status"]
  ) => {
    switch (status) {
      case "completed":
        return "text-green-600";

      case "failed":
        return "text-red-600";

      case "cancelled":
        return "text-orange-600";

      default:
        return "text-slate-600";
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
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearTransferHistory();

              setHistory([]);

              Alert.alert(
                "History Cleared",
                "All transfer history has been deleted."
              );
            } catch (error) {
              console.log(
                "Clear history error:",
                error
              );

              Alert.alert(
                "Error",
                "Could not clear history."
              );
            }
          },
        },
      ]
    );
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-5 pt-8">

        {/* HEADER */}

        <View className="mb-5 flex-row items-center justify-between">

          <View>
            <Text className="text-2xl font-bold text-slate-900">
              Transfer History
            </Text>

            <Text className="mt-1 text-slate-500">
              Your previous file transfers
            </Text>
          </View>

          {history.length > 0 && (
            <Pressable
              onPress={
                handleClearHistory
              }
              className="rounded-xl bg-red-50 px-4 py-2"
            >
              <Text className="font-semibold text-red-600">
                Clear
              </Text>
            </Pressable>
          )}

        </View>

        {/* LOADING */}

        {loading ? (

          <View className="flex-1 items-center justify-center">

            <Text className="text-slate-500">
              Loading history...
            </Text>

          </View>

        ) : history.length === 0 ? (

          /* EMPTY STATE */

          <View className="flex-1 items-center justify-center">

            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <Text className="text-3xl">
                📂
              </Text>
            </View>

            <Text className="text-lg font-semibold text-slate-800">
              No Transfer History
            </Text>

            <Text className="mt-2 text-center text-slate-500">
              Files you receive or send will
              appear here.
            </Text>

          </View>

        ) : (

          /* HISTORY LIST */

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom: 30,
            }}
          >

            {history.map((item) => (

              <View
                key={item.id}
                className="mb-3 rounded-2xl bg-white p-4"
              >

                {/* TOP ROW */}

                <View className="flex-row items-center">

                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Text className="text-xl">
                      📄
                    </Text>
                  </View>

                  <View className="flex-1">

                    <Text
                      className="font-semibold text-slate-900"
                      numberOfLines={1}
                    >
                      {item.fileName}
                    </Text>

                    <Text className="mt-1 text-sm text-slate-500">
                      {formatBytes(
                        item.fileSize
                      )}
                    </Text>

                  </View>

                </View>

                {/* DETAILS */}

                <View className="mt-4 flex-row items-center justify-between">

                  <View>

                    <Text
                      className={`font-semibold capitalize ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </Text>

                    <Text className="mt-1 text-xs text-slate-400">
                      {item.direction ===
                      "received"
                        ? "Received"
                        : "Sent"}
                    </Text>

                  </View>

                  <Text className="text-xs text-slate-400">
                    {formatDate(
                      item.date
                    )}
                  </Text>

                </View>

              </View>

            ))}

          </ScrollView>

        )}

      </View>
    </SafeAreaView>
  );
}