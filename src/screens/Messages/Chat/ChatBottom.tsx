import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, borderRadius } from "../../../lib/colors";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/lib/context/theme-context";

interface ChatBottomProps {
  onSendMessage: (text: string) => void;
  onPickMedia: () => void;
  onTriggerEmoji: (appendEmojiFn: (char: string) => void) => void;
  onRecordVoice: () => void;
  onTypingStatusChange?: (isTyping: boolean) => void; // ✅ Added typing callback
}

export default function ChatBottom({
  onSendMessage,
  onPickMedia,
  onTriggerEmoji,
  onRecordVoice,
  onTypingStatusChange,
}: ChatBottomProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [message, setMessage] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // Track typing lifecycle states locally
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () =>
      setIsKeyboardOpen(true),
    );
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardOpen(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // ✅ Process live keyboard inputs and fire status handlers
  const handleTextChange = (text: string) => {
    setMessage(text);

    if (!onTypingStatusChange) return;

    if (text.trim().length > 0) {
      // If we weren't typing previously, notify backend instantly
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStatusChange(true);
      }

      // Clear the previous fallback stop timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Set a countdown timer to clear typing state after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStatusChange(false);
      }, 2000);
    } else {
      // If the field is completely cleared out, stop typing indicator immediately
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        onTypingStatusChange(false);
      }
    }
  };

  const handleSend = () => {
    if (message.trim() === "") return;
    onSendMessage(message);
    setMessage("");

    // Force clear typing state instantly upon message submission
    if (onTypingStatusChange && isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTypingStatusChange(false);
    }
  };

  const appendEmoji = (emoji: string) => {
    const newText = message + emoji;
    handleTextChange(newText);
  };

  const calculatedPaddingBottom = isKeyboardOpen
    ? spacing.sm
    : insets.bottom > 0
      ? insets.bottom
      : spacing.md;

  return (
    <View
      style={[
        styles.inputBarContainer,
        { paddingBottom: calculatedPaddingBottom },
      ]}
    >
      <View style={styles.mainInputCard}>
        <TouchableOpacity
          onPress={() => onTriggerEmoji(appendEmoji)}
          style={styles.utilButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="emoticon-happy-outline"
            size={22}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          value={message}
          onChangeText={handleTextChange} // ✅ Synced text changes here
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          onPress={onPickMedia}
          style={styles.utilButton}
          activeOpacity={0.7}
        >
          <Feather name="paperclip" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={message.trim() === "" ? onRecordVoice : handleSend}
        style={[
          styles.actionRoundButton,
          message.trim() !== "" && styles.sendActiveBackground,
        ]}
        activeOpacity={0.8}
      >
        {message.trim() === "" ? (
          <Feather name="mic" size={20} color="#ffffff" />
        ) : (
          <Ionicons
            name="send"
            size={18}
            color="#ffffff"
            style={styles.sendIconCorrection}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    inputBarContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      backgroundColor: theme.background,
      gap: spacing.sm,
    },
    mainInputCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.xs,
      minHeight: 44,
      maxHeight: 120,
    },
    utilButton: {
      width: 40,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    textInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      paddingVertical: 11,
      paddingHorizontal: 4,
    },
    actionRoundButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.03)",
    },
    sendActiveBackground: {
      backgroundColor: theme.primary || "#ec4899",
      borderColor: "transparent",
    },
    sendIconCorrection: { marginLeft: 2 },
  });
