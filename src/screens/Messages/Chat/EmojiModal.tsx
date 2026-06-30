import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { colors, spacing, borderRadius } from "../../../lib/colors";
import { useTheme } from "@/lib/context/theme-context";

interface EmojiModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const FREQUENT_EMOJIS = [
  "😂",
  "❤️",
  "🤣",
  "👍",
  "🙏",
  "😘",
  "🥰",
  "😍",
  "😊",
  "🔥",
  "😭",
  "💖",
  "😢",
  "🤔",
  "👏",
];

export default function EmojiModal({
  visible,
  onClose,
  onSelectEmoji,
}: EmojiModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Frequently Used</Text>
          <FlatList
            data={FREQUENT_EMOJIS}
            numColumns={5}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.emojiCell}
                onPress={() => {
                  onSelectEmoji(item);
                  onClose();
                }}
              >
                <Text style={styles.emojiText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: theme.background,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      padding: spacing.md,
      maxHeight: 300,
      paddingBottom: 80,
    },
    title: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    emojiCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
    },
    emojiText: {
      fontSize: 28,
    },
  });
