import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { spacing, borderRadius } from "@/lib/colors";
import {
  GENDER_OPTIONS,
  INTERESTS,
  RELATIONSHIP_GOALS,
  YEAR_OPTIONS,
} from "./constant";
import { useTheme } from "@/lib/context/theme-context";

const { height } = Dimensions.get("window");

// --- LIMITED FILTER DATA ---
const FILTER_OPTIONS = {
  gender: GENDER_OPTIONS,
  year: YEAR_OPTIONS,
  goals: RELATIONSHIP_GOALS,
  interests: Object.values(INTERESTS).flat(),
};

// --- REUSABLE CHIP COMPONENT (Now accepts styles as a prop) ---
const FilterChip = ({
  label,
  isSelected,
  onPress,
  styles, // <-- Added styles here
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  styles: any; // <-- Typed styles here
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={[
      styles.chip,
      isSelected ? styles.chipSelected : styles.chipUnselected,
    ]}
  >
    <Text
      style={[
        styles.chipText,
        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

// --- TYPES ---
export type FilterState = {
  ageRange: [number, number]; // [18, maxAge]
  gender: string[];
  year: string[];
  goals: string[];
  interests: string[];
};

interface FilterBottonModalProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  fixedPosition?: boolean;
}

export default function FilterBotton_Modal({
  filters,
  setFilters,
  fixedPosition = true,
}: FilterBottonModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [isVisible, setIsVisible] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate the dynamic summary text for the trigger button
  const getSummaryText = () => {
    const parts = [];

    // Always show the dynamic age range
    parts.push(`18-${filters.ageRange[1]}yrs`);

    if (filters.gender.length > 0) parts.push(filters.gender.join("/"));
    if (filters.goals.length > 0) parts.push(filters.goals.join(", "));
    if (filters.interests.length > 0) parts.push(filters.interests.join(", "));
    if (filters.year.length > 0) parts.push(filters.year.join(", "));

    if (parts.length === 1 && filters.ageRange[1] === 50) {
      return "Set your match preferences...";
    }

    return `Looking for: ${parts.join(", ")}`;
  };

  const openModal = () => {
    setLocalFilters(filters);
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setLocalFilters((prev) => {
      const currentCategory = prev[category] as string[];
      if (currentCategory.includes(value)) {
        return {
          ...prev,
          [category]: currentCategory.filter((item) => item !== value),
        };
      } else {
        return { ...prev, [category]: [...currentCategory, value] };
      }
    });
  };

  const handleReset = () => {
    setLocalFilters({
      ageRange: [18, 50],
      gender: [],
      year: [],
      goals: [],
      interests: [],
    });
  };

  const handleApply = () => {
    setFilters(localFilters);
    closeModal();
  };

  return (
    <>
      {/* TRIGGER ROW */}
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.triggerRow,
          fixedPosition
            ? {
                paddingVertical: 4,
                position: "absolute",
                top: 54,
                left: 0,
                right: 0,
                zIndex: 100,
                marginHorizontal: 20,
              }
            : {
                paddingVertical: 12,
              },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="options" size={20} color={theme.text} />
        <Text style={styles.summaryText} numberOfLines={1} ellipsizeMode="tail">
          {getSummaryText()}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </TouchableOpacity>

      {/* THE MODAL */}
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeModal}
          >
            <View style={{ flex: 1 }} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                padding: 2,
                paddingHorizontal: 6,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: theme.text,
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons
                name="close-circle-outline"
                size={28}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.showMe}>Who you see in your match screen</Text>
            <View style={styles.section} />

            {/* FUNCTIONAL AGE SLIDER */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Maximum Age</Text>
                <Text style={styles.ageValueText}>
                  18 - {localFilters.ageRange[1]} YRS
                </Text>
              </View>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={18}
                  maximumValue={50}
                  step={1}
                  value={localFilters.ageRange[1]}
                  onValueChange={(val) =>
                    setLocalFilters({ ...localFilters, ageRange: [18, val] })
                  }
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor={theme.border}
                  thumbTintColor={theme.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>18</Text>
                  <Text style={styles.sliderLabelText}>50</Text>
                </View>
              </View>
            </View>

            {/* DYNAMIC CHIPS */}
            {Object.entries(FILTER_OPTIONS).map(([key, options]) => {
              const filterKey = key as keyof FilterState;
              return (
                <View key={filterKey} style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {key === "goals"
                      ? "Relationship Goals"
                      : key === "year"
                        ? "Academic Year"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={styles.chipContainer}>
                    {options.map((option) => (
                      <FilterChip
                        key={option}
                        label={option}
                        isSelected={(
                          localFilters[filterKey] as string[]
                        ).includes(option)}
                        onPress={() => toggleFilter(filterKey, option)}
                        styles={styles} // <-- Passed computed styles down here
                      />
                    ))}
                  </View>
                </View>
              );
            })}
            <View style={{ height: 60 }} />
          </ScrollView>

          {/* FIXED FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.8}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

// --- STYLES ---
const getStyles = (theme: any) =>
  StyleSheet.create({
    triggerRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    sheetContainer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      height: height * 0.85,
      backgroundColor: theme.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    dragHandleContainer: {
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: spacing.sm,
    },
    dragHandle: {
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.border,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    resetText: {
      fontSize: 16,
      color: theme.textMuted,
      fontWeight: "500",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    showMe: {
      fontSize: 12,
      color: theme.textMuted,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    ageValueText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.primary,
    },
    sliderContainer: {
      justifyContent: "center",
      marginTop: 5,
    },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginTop: -5,
    },
    sliderLabelText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      marginBottom: spacing.sm,
      marginRight: spacing.sm,
    },
    chipUnselected: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },
    chipSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "500",
    },
    chipTextUnselected: {
      color: theme.textMuted,
    },
    chipTextSelected: {
      color: "white", // Keeps text readable on selected color
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: spacing.md,
      paddingBottom: 30,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.surface,
      marginBottom: 50,
    },
    applyButton: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    applyButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },
  });
