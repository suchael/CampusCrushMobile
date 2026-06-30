import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "@/lib/colors";
import { useTheme } from "@/lib/context/theme-context";

interface ProfileHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  onToggleEdit: () => void;
  onCancelEdit: () => void; // Added callback to cleanly exit edit mode without saving
  onSettingsPress: () => void;
}

export default function ProfileHeader({
  isEditing,
  isSaving,
  onToggleEdit,
  onCancelEdit,
  onSettingsPress,
}: ProfileHeaderProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.headerContainer}>
      {/* Context-Aware Title */}
      <Text style={styles.headerTitle}>
        {isEditing ? "Edit Profile" : "Profile"}
      </Text>

      {/* Interactive Button Section */}
      <View style={styles.actionButtonGroup}>
        {isEditing && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancelEdit}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Ionicons name="close-outline" size={16} color="#A3A3C2" />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.toggleEditBtn,
            isEditing ? styles.saveActiveBtn : styles.editInactiveBtn,
          ]}
          onPress={onToggleEdit}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <View style={styles.btnContentFlex}>
              <Ionicons
                name={isEditing ? "checkmark-sharp" : "pencil-sharp"}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.toggleBtnText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Hide settings when editing to give the layout room to breathe */}
        {!isEditing && (
          <TouchableOpacity
            onPress={onSettingsPress}
            style={styles.settingsCircleBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={18} color={theme.text} />
          </TouchableOpacity>
        )}
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
      paddingHorizontal: spacing.lg || 16,
      paddingTop: spacing.md || 12,
      paddingBottom: spacing.sm,
      backgroundColor: theme.background,
      borderBottomWidth: 0.6,
      borderColor: theme.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    actionButtonGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    toggleEditBtn: {
      height: 36,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md || 10,
      justifyContent: "center",
      alignItems: "center",
    },
    editInactiveBtn: {
      backgroundColor: theme.primary || "#7C3AED",
    },
    saveActiveBtn: {
      backgroundColor: "#10B981", // Solid modern emerald green for saves
    },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      height: 36,
      paddingHorizontal: 14,
      borderRadius: borderRadius.md || 10,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
    },
    cancelBtnText: {
      color: "#A3A3C2",
      fontWeight: "600",
      fontSize: 13,
    },
    btnContentFlex: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    toggleBtnText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 13,
    },
    settingsCircleBtn: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md || 10,
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
  });
