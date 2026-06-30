import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../lib/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: string[];
  selectedValue: string;
  onSelect: (item: string) => void;
  placeholder?: string;
  isCollege?: boolean;
};

export default function SearchSelectionModal({
  visible,
  onClose,
  title,
  data = [],
  selectedValue,
  onSelect,
  placeholder = "Search...",
  isCollege = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => a.localeCompare(b));
    const cleanQuery = searchQuery.trim().toLowerCase();

    if (isCollege && !cleanQuery) {
      return [];
    }

    if (!cleanQuery) return sorted;

    return sorted.filter((item) => {
      if (!item) return false;
      return item.toLowerCase().includes(cleanQuery);
    });
  }, [data, searchQuery, isCollege]);

  const handleSelect = (item: string) => {
    onSelect(item);
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const renderEmptyComponent = () => {
    const isQueryEmpty = searchQuery.trim().length === 0;

    if (isCollege && isQueryEmpty) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="school-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Find Your College</Text>
          <Text style={styles.emptySubtitle}>
            Type your institution's name above to find and select your match.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="search-outline" size={34} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any institutional matches for "{searchQuery}"
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View 
        style={[
          styles.modalMainContainer, 
          { paddingTop: insets.top + 25, paddingBottom: insets.bottom + 30 }
        ]}
      >
        {/* HEADER */}
        <View style={styles.headerLayout}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.headerCloseAction}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* INPUT BOX */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search"
            size={18}
            color={colors.textMuted}
            style={styles.inputSearchIcon}
          />
          <TextInput
            style={styles.textInputField}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor={colors.primary}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.inputClearAction}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* RESULTS COUNTER */}
        {searchQuery.trim().length > 0 && (
          <Text style={styles.feedbackCounter}>
            {filteredData.length} {filteredData.length === 1 ? "match" : "matches"} available
          </Text>
        )}

        {/* LIST VIEW */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollListLayout}
          ListEmptyComponent={renderEmptyComponent}
          keyboardShouldPersistTaps="always"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={5}
          renderItem={({ item }) => {
            const isSelected = item === selectedValue;
            return (
              <TouchableOpacity
                style={[
                  styles.selectionCard,
                  isSelected && styles.selectionCardActive,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.65}
              >
                <Text
                  style={[
                    styles.selectionText,
                    isSelected && styles.selectionTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {item}
                </Text>
                
                {isSelected ? (
                  <View style={styles.checkedIndicator}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textMuted}
                    style={styles.chevronIcon}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalMainContainer: { 
    flex: 1, 
    backgroundColor: "#0A0A1A" 
  },
  headerLayout: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md, 
    paddingBottom: spacing.sm 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: colors.text, 
    letterSpacing: -0.4,
    flex: 1,
    marginRight: spacing.md
  },
  headerCloseAction: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: colors.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.md, 
    borderWidth: 1, 
    borderColor: colors.border, 
    marginHorizontal: spacing.lg, 
    marginTop: spacing.md, 
    paddingHorizontal: spacing.md, 
    height: 52 
  },
  inputSearchIcon: { 
    marginRight: spacing.sm 
  },
  textInputField: { 
    flex: 1, 
    color: colors.text, 
    fontSize: 16, 
    height: "100%",
    fontWeight: "400"
  },
  inputClearAction: { 
    padding: spacing.xs 
  },
  feedbackCounter: { 
    fontSize: 13, 
    fontWeight: "500", 
    color: colors.textMuted, 
    marginHorizontal: spacing.lg, 
    marginTop: spacing.sm, 
    letterSpacing: 0.1 
  },
  scrollListLayout: { 
    paddingHorizontal: spacing.lg, 
    paddingTop: spacing.md, 
    paddingBottom: spacing.xl, 
    flexGrow: 1 
  },
  selectionCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.sm, 
    paddingVertical: spacing.md, 
    paddingHorizontal: spacing.md, 
    marginBottom: spacing.sm, 
    borderWidth: 1, 
    borderColor: colors.border
  },
  selectionCardActive: { 
    backgroundColor: "rgba(124, 58, 237, 0.05)", 
    borderColor: colors.primary 
  },
  selectionText: { 
    fontSize: 15, 
    color: colors.text, 
    fontWeight: "500", 
    lineHeight: 22,
    flex: 1,
    marginRight: spacing.md
  },
  selectionTextActive: { 
    color: colors.primary, 
    fontWeight: "600" 
  },
  checkedIndicator: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: colors.primary, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  chevronIcon: {
    opacity: 0.4
  },
  emptyContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1, 
    paddingVertical: 80, 
    paddingHorizontal: spacing.xl 
  },
  emptyIconCircle: { 
    width: 76, 
    height: 76, 
    borderRadius: 38, 
    backgroundColor: colors.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: spacing.md, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  emptyTitle: { 
    color: colors.text, 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: spacing.xs,
    letterSpacing: -0.2
  },
  emptySubtitle: { 
    color: colors.textMuted, 
    fontSize: 14, 
    textAlign: "center", 
    lineHeight: 20,
    paddingHorizontal: spacing.sm
  },
});