import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../../lib/colors";
import { CreateEventDTO } from "@/lib/api/explore.event.api";
import CustomDateTimePicker from "@/utils/CustomDateTimePicker";
import { useTheme } from "@/lib/context/theme-context";

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (event: CreateEventDTO) => void;
}

const CATEGORIES = ["Sports", "Concert", "Academic", "Social"] as const;

export default function EventModal({
  visible,
  onClose,
  onSubmit,
}: EventModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Social");
  const [location, setLocation] = useState("");

  // Consolidated date picker state to completely eliminate the ghost string variable mismatch
  const [date, setDate] = useState<string | null>(null);

  // Validation tracking states for seamless UX response feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Clear form errors on view cycle switches
  useEffect(() => {
    if (visible) {
      setValidationError(null);
      setAttemptedSubmit(false);
    }
  }, [visible]);

  const handlePublish = () => {
    setAttemptedSubmit(true);

    const cleanTitle = title.trim();
    const cleanLocation = location.trim();
    const cleanDate = date ? date.trim() : "";

    if (!cleanTitle || !cleanDate || !cleanLocation) {
      setValidationError("Please fill out all required fields marked with *");
      return;
    }

    onSubmit({
      title: cleanTitle,
      category,
      date: cleanDate,
      location: cleanLocation,
    });

    // Reset Form Input Matrices Cleanly
    setTitle("");
    setCategory("Social");
    setDate(null);
    setLocation("");
    setValidationError(null);
    setAttemptedSubmit(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Absolute backdrop layout to dismiss keyboard / tap outside to close */}
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.absoluteBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          {/* Custom Bottom Sheet Notch indicator */}
          <View style={styles.dragHandle} />

          {/* Fixed Header: Stays pinned while scrolling */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={20} color={theme.pink} />
              <Text style={styles.modalTitle}>Create Campus Event</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body Container */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollMethodContainer}
          >
            {/* Event Title input layout */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Event Name <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  attemptedSubmit &&
                    !title.trim() &&
                    styles.inputWrapperInvalid,
                ]}
              >
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={
                    attemptedSubmit && !title.trim()
                      ? theme.pink
                      : theme.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Faculty Match Finals"
                  placeholderTextColor="lightgray"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (validationError) setValidationError(null);
                  }}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Category Selector Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.categoryTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Grid Row Inputs */}
            <View style={styles.rowFields}>
              <CustomDateTimePicker date={date} setDate={setDate} />
            </View>

            {/* Venue Context */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Campus Venue <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  attemptedSubmit &&
                    !location.trim() &&
                    styles.inputWrapperInvalid,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={
                    attemptedSubmit && !location.trim()
                      ? theme.pink
                      : theme.textMuted
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Main Campus Sports Complex"
                  placeholderTextColor="lightgray"
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    if (validationError) setValidationError(null);
                  }}
                />
              </View>
            </View>

            {/* Inline Error Messenger Segment */}
            {validationError && (
              <View style={styles.errorAlertRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={theme.pink}
                />
                <Text style={styles.errorAlertText}>{validationError}</Text>
              </View>
            )}

            {/* Upgraded Submit Button (Inside Scroll Layout to prevent cutoff UI layout crashes) */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.submitButton}
              onPress={handlePublish}
            >
              <Text style={styles.submitButtonText}>Publish Event</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "flex-end",
    },
    absoluteBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    modalContainer: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: borderRadius.xl * 1.5,
      borderTopRightRadius: borderRadius.xl * 1.5,
      maxHeight: "86%",
      width: "100%",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      paddingBottom: 10,
    },
    dragHandle: {
      width: 38,
      height: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: borderRadius.full,
      alignSelf: "center",
      marginTop: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: 14,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.06)",
    },
    headerTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: theme.text,
      letterSpacing: -0.3,
    },
    closeButton: {
      backgroundColor: "rgba(255,255,255,0.06)",
      padding: 6,
      borderRadius: borderRadius.full,
    },
    scrollMethodContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: 450, // Perfectly sized bottom cushion for modern devices to handle keyboard offsets cleanly
      gap: 18,
      flexGrow: 1,
    },
    inputGroup: {
      gap: 6,
    },
    rowFields: {
      flexDirection: "row",
      gap: spacing.md,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginLeft: 2,
    },
    requiredAsterisk: {
      color: theme.pink,
      fontWeight: "bold",
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputWrapperInvalid: {
      borderColor: "rgba(236, 72, 153, 0.5)",
      backgroundColor: "rgba(236, 72, 153, 0.02)",
    },
    inputIcon: {
      paddingLeft: 14,
    },
    input: {
      flex: 1,
      color: theme.text,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 15,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 2,
    },
    categoryPill: {
      backgroundColor: theme.background,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.04)",
    },
    categoryPillActive: {
      backgroundColor: "rgba(236, 72, 153, 0.12)",
      borderColor: theme.pink,
    },
    categoryText: {
      color: theme.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    categoryTextActive: {
      color: theme.pink,
      fontWeight: "700",
    },
    errorAlertRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(236, 72, 153, 0.08)",
      padding: 12,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: "rgba(236, 72, 153, 0.15)",
    },
    errorAlertText: {
      color: theme.pink,
      fontSize: 13,
      fontWeight: "600",
    },
    submitButton: {
      backgroundColor: theme.pink,
      borderRadius: borderRadius.lg,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: spacing.sm,
      shadowColor: theme.pink,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.1,
    },
  });
