import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, spacing } from "../../../lib/colors";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "@/lib/context/theme-context";

interface ChatHeaderProps {
  user: any;
  onBack: () => void;
  onViewAvatar: (url: string) => void;
  onViewProfile: (userId: string) => void;
  onOpenMenu: () => void;
  onVoiceCall: () => void; // Added call action handler property definition
  onVideoCall: () => void; // Added call action handler property definition
}

export default function ChatHeader({
  user,
  onBack,
  onViewAvatar,
  onViewProfile,
  onOpenMenu,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const avatarUrl =
    user?.profile?.photo ||
    user?.profile?.photos?.[0] ||
    "https://via.placeholder.com/100";

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconPad}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onViewAvatar(avatarUrl)}
          activeOpacity={0.9}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            {user?.isOnline && <View style={styles.onlineDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onViewProfile(user?.id)}
          style={styles.metaPress}
          activeOpacity={0.7}
        >
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.profile?.name || "User"}
          </Text>
          {user?.isTyping ? (
            <Text style={styles.typingFeedbackText}>typing...</Text>
          ) : (
            <Text style={styles.statusText}>
              {user?.isOnline ? "Online" : "Offline"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={onVideoCall}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="video" size={20} color={theme.text} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={onVoiceCall}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="phone" size={19} color={theme.text} />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={onOpenMenu}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="more-vertical" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 20,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    leftRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconPad: {
      paddingRight: spacing.sm,
    },
    avatarWrapper: {
      position: "relative",
      marginRight: spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#131520",
    },
    onlineDot: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#22c55e",
      borderWidth: 1.5,
      borderColor: theme.background || "#0a0b0e",
    },
    metaPress: {
      flex: 1,
      justifyContent: "center",
    },
    profileName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    statusText: {
      fontSize: 15,
      color: theme.textMuted,
      marginTop: 1,
    },
    typingFeedbackText: {
      fontSize: 14,
      color: theme.pink || "#ff70a2",
      fontStyle: "italic",
      fontWeight: "500",
    },
    rightRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    actionButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
    },
  });
