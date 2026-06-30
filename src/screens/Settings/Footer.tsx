import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "@/lib/colors";
import { useAuth } from "@/lib/context/auth-context";
import { useTheme } from "@/lib/context/theme-context";

export default function Footer() {
  const { theme } = useTheme();
  const { logout, deleteAccount } = useAuth(); // Direct hook usage for zero-props execution
  const styles = getStyles(theme);

  // Self-contained processing states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOutSequence = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (error) {
            console.error("Footer Sign Out Error:", error);
            Alert.alert(
              "Error",
              "Failed to sign out securely. Please try again."
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccountSequence = () => {
    Alert.alert(
      "Delete Account",
      "This action is completely permanent. All your photos, chats, matching history, and profile data will be permanently wiped from our systems.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              // Safely executing the context/API destruction layer
              if (deleteAccount) {
                await deleteAccount();
              } else {
                // Fallback catch-all if named differently in your auth integration layer
                console.warn("deleteAccount function not found on useAuth context");
              }
            } catch (error) {
              console.error("Footer Delete Account Error:", error);
              Alert.alert(
                "Deletion Failed",
                "Could not delete your profile at this time. Please check your network connection."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const isProcessing = isLoggingOut || isDeleting;

  return (
    <View style={styles.footerContainer}>
      
      {/* Sign Out Action Bar */}
      <TouchableOpacity
        style={styles.logoutActionRow}
        onPress={handleSignOutSequence}
        disabled={isProcessing}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeftContent}>
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#FF4B4B" />
          ) : (
            <Ionicons name="log-out-outline" size={18} color="#FF4B4B" />
          )}
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </Text>
        </View>
        {!isLoggingOut && (
          <Ionicons name="chevron-forward" size={14} color="rgba(255, 75, 75, 0.4)" />
        )}
      </TouchableOpacity>

      {/* High-Risk Account Deletion Row */}
      <TouchableOpacity
        style={styles.deleteActionRow}
        onPress={handleDeleteAccountSequence}
        disabled={isProcessing}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeftContent}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="rgba(255, 75, 75, 0.6)" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="rgba(255, 75, 75, 0.6)" />
          )}
          <Text style={styles.deleteText}>
            {isDeleting ? "Wiping account data..." : "Delete Account"}
          </Text>
        </View>
        {!isDeleting && (
          <Ionicons name="chevron-forward" size={14} color="rgba(255, 75, 75, 0.2)" />
        )}
      </TouchableOpacity>

    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    footerContainer: {
      gap: spacing.sm || 12,
      marginTop: spacing.md || 16,
      paddingBottom: spacing.xl || 24,
    },
    logoutActionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(255, 75, 75, 0.02)",
      borderRadius: borderRadius.md || 12,
      borderWidth: 1,
      borderColor: "rgba(255, 75, 75, 0.15)",
      paddingHorizontal: spacing.lg || 16,
      height: 50,
    },
    deleteActionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
      borderRadius: borderRadius.md || 12,
      borderWidth: 1,
      borderColor: "rgba(255, 75, 75, 0.06)",
      paddingHorizontal: spacing.lg || 16,
      height: 50,
    },
    actionLeftContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoutText: {
      color: "#FF4B4B",
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: -0.1,
    },
    deleteText: {
      color: "rgba(255, 75, 75, 0.7)",
      fontSize: 14,
      fontWeight: "500",
      letterSpacing: -0.1,
    },
  });