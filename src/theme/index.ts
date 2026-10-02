export const theme = {
  colors: {
    // Primary accent - Modern Air—DropX Green
    primary: "#0d8274",
    primaryLight: "#14b8a6",
    primaryDark: "#064e43",
    primaryMuted: "rgba(13, 130, 116, 0.15)",
    
    // Secondary accents
    secondary: "#0ea5e9",
    secondaryDark: "#0284c7",
    accentYellow: "#f59e0b",
    accentPurple: "#8b5cf6",
    
    // Dark Theme Backgrounds (Default)
    background: "#090d10",
    backgroundSecondary: "#0f171c",
    cardBg: "#141e24",
    cardBgHover: "#1b2830",
    modalBg: "#111920",
    
    // Borders
    border: "#1f2d36",
    borderLight: "rgba(255, 255, 255, 0.08)",
    
    // Text colors
    text: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textInverse: "#090d10",
    
    // Status
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    
    // Overlay
    overlay: "rgba(0, 0, 0, 0.65)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  typography: {
    size: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 36,
    },
    weight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      
      
    },
  },
};

export type Theme = typeof theme;
