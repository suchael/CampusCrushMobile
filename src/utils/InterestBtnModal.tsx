import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../lib/colors";
import { INTERESTS } from "./constant";
import { useTheme } from "@/lib/context/theme-context";

type Props = {
  title?: string;
  interest: string;
  setInterest: (interest: string) => void;
};

export default function InterestBtnModal({
  title = "What are you interested in?",
  interest,
  setInterest,
}: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Local state to track multi-selection within the modal session
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Extract and sort category keys alphabetically
  const categories = useMemo(() => {
    return Object.keys(INTERESTS).sort((a, b) => a.localeCompare(b));
  }, []);

  // Helper to parse the comma-separated string into a clean array
  const parseInterests = (interestString: string): string[] => {
    if (!interestString) return [];
    return interestString
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleOpenModal = () => {
    setSelectedItems(parseInterests(interest));
    setModalVisible(true);
  };

  const handleToggleInterest = (item: string) => {
    setSelectedItems(
      (prev) =>
        prev.includes(item)
          ? prev.filter((i) => i !== item) // Deselect
          : [...prev, item], // Select
    );
  };

  const handleSaveSelections = () => {
    const serializedInterests = selectedItems.join(", ");
    setInterest(serializedInterests);
    setModalVisible(false);
    setExpandedCategory(null);
  };

  const handleClose = () => {
    setModalVisible(false);
    setExpandedCategory(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Component Title Label */}
      <Text style={styles.outerTitle}>{title}</Text>

      {/* Premium Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerButton,
          interest ? styles.triggerButtonActive : null,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <View style={styles.triggerButtonContent}>
          <Ionicons
            name={interest ? "bookmark" : "bookmark-outline"}
            size={20}
            color={interest ? theme.primary : theme.textMuted}
          />
          <Text
            style={[
              styles.triggerText,
              interest ? styles.triggerTextSelected : null,
            ]}
            numberOfLines={1}
          >
            {interest || "Choose interests..."}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      {/* Collapsible Accordion Modal Container */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.circleButton}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Choose Interests</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Collapsible Accordion Category List */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: category, index }) => {
                const isExpanded = expandedCategory === category;

                // Track if this category contains any currently selected items
                const hasSelectedChild = INTERESTS[category]?.some((child) =>
                  selectedItems.includes(child),
                );

                // Fetch and sort child interests for this specific parent group
                const subInterests = [...(INTERESTS[category] || [])].sort(
                  (a, b) => a.localeCompare(b),
                );

                return (
                  <View style={styles.accordionGroup}>
                    {/* Parent Dropdown Toggle Button */}
                    <TouchableOpacity
                      style={[
                        styles.parentCard,
                        isExpanded && styles.parentCardExpanded,
                      ]}
                      onPress={() => toggleCategory(category)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.parentText}>
                        {index + 1}. {category}
                      </Text>

                      <View style={styles.parentRightAction}>
                        {/* Interactive Selection Tracker Dot Indicator */}
                        {hasSelectedChild && (
                          <View style={styles.categorySelectedDot} />
                        )}

                        <Ionicons
                          name={isExpanded ? "chevron-down" : "chevron-forward"}
                          size={18}
                          color={isExpanded ? theme.primary : theme.textMuted}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Children Items Container (Renders inline only when expanded) */}
                    {isExpanded && (
                      <View style={styles.childrenContainer}>
                        {subInterests.map((subItem, subIndex) => {
                          const isFinalItemSelected =
                            selectedItems.includes(subItem);

                          return (
                            <TouchableOpacity
                              key={subItem}
                              style={[
                                styles.childItemRow,
                                isFinalItemSelected &&
                                  styles.childItemRowSelected,
                              ]}
                              onPress={() => handleToggleInterest(subItem)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.childText,
                                  isFinalItemSelected &&
                                    styles.childTextSelected,
                                ]}
                              >
                                {subIndex + 1}. {subItem}
                              </Text>

                              {isFinalItemSelected ? (
                                <View style={styles.checkmarkBadge}>
                                  <Ionicons
                                    name="checkmark"
                                    size={12}
                                    color="#FFFFFF"
                                  />
                                </View>
                              ) : (
                                <Ionicons
                                  name="add"
                                  size={16}
                                  color={theme.border}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              }}
            />

            {/* Sticky Action Footer containing the Done Button */}
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleSaveSelections}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>
                  Done ({selectedItems.length} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    outerContainer: {
      width: "100%",
      marginBottom: spacing.sm - 10,
    },
    outerTitle: {
      fontSize: 15,
      color: theme.text,
      marginBottom: spacing.sm,
      paddingLeft: spacing.xs,
    },
    triggerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.md,
      height: 54,
    },
    triggerButtonActive: {
      borderColor: "rgba(124, 58, 237, 0.4)",
      backgroundColor: "rgba(124, 58, 237, 0.02)",
    },
    triggerButtonContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginRight: spacing.sm,
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      color: theme.textMuted,
      fontWeight: "500",
    },
    triggerTextSelected: {
      color: theme.textMuted,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    headerSpacer: {
      width: 40,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    accordionGroup: {
      marginBottom: spacing.sm,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    parentCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.surface,
    },
    parentCardExpanded: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    parentText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "600",
    },
    parentRightAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    categorySelectedDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    childrenContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.01)",
      paddingLeft: spacing.md,
    },
    childItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      paddingRight: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.03)",
    },
    childItemRowSelected: {
      backgroundColor: "rgba(124, 58, 237, 0.05)",
    },
    childText: {
      fontSize: 15,
      color: theme.textMuted,
      fontWeight: "500",
    },
    childTextSelected: {
      color: theme.primary,
      fontWeight: "600",
    },
    checkmarkBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    footerContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    doneButton: {
      backgroundColor: theme.primary,
      borderRadius: borderRadius.md,
      height: 52,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    doneButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
  });
