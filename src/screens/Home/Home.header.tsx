import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. Remove 'colors' from this import, add 'useTheme'
import { spacing, borderRadius } from "../../lib/colors";
import { useTheme } from "@/lib/context/theme-context";

interface HomeHeaderProps {
  title?: string;
  campus?: string;
  unreadNotifications?: number;
  onSearch?: () => void;
  onNotifications?: () => void;
}

export default function HomeHeader({
  title = "Campus Crush",
  campus,
  unreadNotifications = 0,
  onSearch,
  onNotifications,
}: HomeHeaderProps) {
  // 2. Extract the active theme and compute the styles
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      {/* Left: App Name */}
      <Text style={styles.logo}>{title}</Text>

      {/* Right: Actions */}
      <View style={styles.actions}>
        {/* Search Button */}
        <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
          {/* 3. Pass the dynamic theme text color directly to the icon */}
          <Ionicons name="search" size={22} color={theme.text} />
        </TouchableOpacity>

        {/* Notification Button */}
        <TouchableOpacity onPress={onNotifications} style={styles.iconBtn}>
          {/* 3. Pass the dynamic theme text color directly to the icon */}
          <Ionicons name="notifications-outline" size={22} color={theme.text} />

          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. Convert to a dynamic function accepting the active theme
const getStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: spacing.md,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: theme.background, // Safely locks header background to theme
  },

  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.text, // Dynamic color
    letterSpacing: -0.5,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: theme.border, // Dynamic color
    backgroundColor: theme.surface, // Gives the button a clean themed backing
  },

  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: theme.pink || "red", // Dynamic notification dot color
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});