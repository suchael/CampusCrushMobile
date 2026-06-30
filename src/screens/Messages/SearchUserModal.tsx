import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { spacing, borderRadius } from "../../lib/colors";
import { Ionicons } from "@expo/vector-icons";
import MatchCard from "./MatchCard";
import { useTheme } from "@/lib/context/theme-context";

interface SearchUserModalProps {
  visible: boolean;
  onClose: () => void;
  matches: any[];
  onOpenImage: (url: string) => void;
  onNavigateToChat: (matchId: string, name: string, photo: string) => void;
}

export default function SearchUserModal({
  visible,
  onClose,
  matches,
  onOpenImage,
  onNavigateToChat,
}: SearchUserModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Focus the input and pull up the keyboard smoothly when the modal opens
  useEffect(() => {
    if (visible) {
      const focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // 100ms delay ensures the modal animation completes so focus sticks on both OS platforms

      return () => clearTimeout(focusTimeout);
    } else {
      setSearchQuery(""); // Reset query buffer state when modal dismisses
    }
  }, [visible]);

  // If nothing is typed, return an empty array; otherwise, perform the match filter
  const filteredMatches =
    searchQuery.trim() === ""
      ? []
      : matches.filter((item) =>
          item.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* TOP SEARCH BAR ENGINE HEADER */}
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="search"
              size={18}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Search your friend list"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* RESULTS FEED PORT */}
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => `search-${item.id}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MatchCard
              item={item}
              onOpenImage={onOpenImage}
              onPressCard={(id, name, photo) => {
                onClose(); // Clear view frame state
                onNavigateToChat(id, name, photo);
              }}
            />
          )}
          ListEmptyComponent={
            // Show nothing or a subtle instructional tip when query field is completely empty
            searchQuery.trim() === "" ? null : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={44}
                  color={theme.textMuted}
                />
                <Text style={styles.emptyTitle}>No conversations found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching for someone else
                </Text>
              </View>
            )
          }
        />
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: spacing.sm,
    },
    backButton: {
      padding: spacing.xs,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      height: 44,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: spacing.xs,
    },
    textInput: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
      fontWeight: "500",
    },
    resultsList: {
      paddingHorizontal: spacing.sm,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "600",
      marginTop: spacing.md,
    },
    emptySubtitle: {
      color: theme.textMuted,
      fontSize: 14,
      marginTop: spacing.xs,
    },
  });
