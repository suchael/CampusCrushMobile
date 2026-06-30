import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { spacing, borderRadius } from "../../../lib/colors";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/lib/context/theme-context";

interface ChatMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onBlockUser: () => void;
  onClearChat: () => void;
}

export default function ChatMenuModal({
  visible,
  onClose,
  onBlockUser,
  onClearChat,
}: ChatMenuModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => {
              onClearChat();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color={theme.text} />
            <Text style={styles.optionText}>Clear Conversation</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={[styles.menuOption, styles.dangerOption]}
            onPress={() => {
              onBlockUser();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Feather name="slash" size={18} color="#f43f5e" />
            <Text style={[styles.optionText, styles.dangerText]}>
              Block User
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
    },
    menuCard: {
      marginTop: 100,
      marginRight: spacing.md,
      backgroundColor: theme.background,
      borderRadius: borderRadius.md,
      width: 200,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
      paddingVertical: spacing.xs,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    menuOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
    },
    dangerOption: {
      backgroundColor: "rgba(244, 63, 94, 0.03)",
    },
    optionText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "500",
    },
    dangerText: {
      color: "#f43f5e",
    },
    menuDivider: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
  });
