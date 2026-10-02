import React from "react";
import { View, ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "", style, ...props }: GlassCardProps) {
  return (
    <View
      style={style}
      className={`rounded-3xl bg-[#141e24] border border-[#1f2d36] p-4 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
