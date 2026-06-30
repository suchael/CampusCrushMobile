import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, spacing } from "../../lib/colors";
import { ConversationItem } from "@/lib/api/messages.api";
import { formatConversationTime } from "@/utils/formatDate";
import { useTheme } from "@/lib/context/theme-context";

interface MatchCardProps {
  item: ConversationItem;
  onOpenImage: (url: string) => void;
  onPressCard: (id: string, name: string, photo: string) => void;
}

/**
 * Parses and formats the raw lastMessage content.
 * Prevents raw CDN/Media links from leaking onto the UI after a query cache refresh.
 */
const getSnippetDisplayText = (lastMessage: string | undefined): string => {
  if (!lastMessage) return "New friend! Say hi 👋";

  // Check if the message payload is a raw CDN media endpoint URL
  if (lastMessage.startsWith("http://") || lastMessage.startsWith("https://")) {
    const lowerCaseUrl = lastMessage.toLowerCase();

    // Image file extensions or Cloudinary resource targets
    if (
      lowerCaseUrl.match(/\.(jpeg|jpg|gif|png|webp|heic)/) ||
      lowerCaseUrl.includes("/image/upload/")
    ) {
      return "📷 Photo";
    }

    // Video resource signatures
    if (
      lowerCaseUrl.match(/\.(mp4|mov|m4v|webm)/) ||
      lowerCaseUrl.includes("/video/upload/")
    ) {
      return "🎥 Video";
    }

    // Audio / Voice note signatures
    if (
      lowerCaseUrl.match(/\.(mp3|wav|m4a|aac|amr|ogg)/) ||
      lowerCaseUrl.includes("/raw/upload/")
    ) {
      return "🎤 Voice note";
    }
  }

  return lastMessage;
};

export default function MatchCard({
  item,
  onOpenImage,
  onPressCard,
}: MatchCardProps) {
  const { theme } = useTheme();
    const styles = getStyles(theme);

  const avatarUrl = item.profile?.photo || "https://via.placeholder.com/120";
  const hasUnread = item.unreadCount > 0;
  const rawTimeStr = item.lastMessageTime;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, hasUnread && styles.unreadBackground]}
      onPress={() =>
        onPressCard(item.id, item.profile?.name, item.profile?.photo)
      }
      activeOpacity={0.65}
    >
      {/* LEFT AVATAR ORB WITH LIVE OVERLAY */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity
          onPress={() => onOpenImage(avatarUrl)}
          activeOpacity={0.85}
          style={styles.avatarTouchTarget}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        </TouchableOpacity>
        {item.isOnline && <View style={styles.onlineIndicatorBadge} />}
      </View>

      {/* MID SECTION TEXT BLOCK CONTENT */}
      <View style={styles.detailsBlock}>
        <View style={styles.rowTopHeader}>
          <Text style={styles.profileNameText} numberOfLines={1}>
            {item.profile?.name || "Campus Connection"}
          </Text>
          <Text
            style={[styles.timestampText, hasUnread && styles.unreadTimeText]}
          >
            {formatConversationTime(rawTimeStr)}
          </Text>
        </View>

        <View style={styles.rowSubContent}>
          {item.isTyping ? (
            <Text style={styles.typingFeedbackText}>typing...</Text>
          ) : (
            <Text
              style={[
                styles.messageSnippetText,
                hasUnread && styles.unreadSnippetText,
              ]}
              numberOfLines={1}
            >
              {getSnippetDisplayText(item.lastMessage)}
            </Text>
          )}

          {hasUnread && (
            <View style={styles.unreadCounterBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount > 99 ? "99+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  unreadBackground: {
    backgroundColor: "rgba(255, 112, 162, 0.04)", // Light premium highlight ring matching branding
  },
  avatarContainer: {
    position: "relative",
  },
  avatarTouchTarget: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  avatarImage: {
    width: 56,
    height: 56,
    backgroundColor: "#1c1e2e",
  },
  onlineIndicatorBadge: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#10b981", // High visibility emerald green
    borderWidth: 2.5,
    borderColor: theme.background || "#0a0b0e",
  },
  detailsBlock: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  rowTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  profileNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    maxWidth: "75%",
  },
  timestampText: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: "400",
  },
  unreadTimeText: {
    color: theme.pink || "#ff70a2",
    fontWeight: "500",
  },
  rowSubContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageSnippetText: {
    fontSize: 14,
    color: theme.textMuted || "#94a3b8",
    flex: 1,
    paddingRight: spacing.md,
  },
  unreadSnippetText: {
    color: theme.text || "#ffffff",
    fontWeight: "500",
  },
  typingFeedbackText: {
    fontSize: 14,
    color: theme.pink || "#ff70a2",
    fontStyle: "italic",
    fontWeight: "500",
  },
  unreadCounterBadge: {
    backgroundColor: theme.pink || "#ff70a2",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});
