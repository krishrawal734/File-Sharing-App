import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[AirDropX] Uncaught production error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-[#090d10] items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 items-center justify-center mb-4">
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ef4444" />
          </View>
          <Text className="text-white text-xl font-bold mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-6 max-w-sm">
            Air-DropX encountered an unexpected error. Please restart or try again.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-[#0d8274] px-6 py-3 rounded-full flex-row items-center gap-2 shadow-lg"
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#ffffff" />
            <Text className="text-white font-bold text-sm">Reload App UI</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
