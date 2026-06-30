import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "@/lib/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "@/lib/colors";

export default function ClearData() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const executeHardReset = async () => {
    setIsResetting(true);
    try {
      // 1. Wipe out TanStack Query cached server states
      queryClient.clear();

      // 2. Clear out the in-memory user token/session via your Auth Context
      if (logout) {
        await logout();
      }
    } catch (error) {
      console.error("Failed during dev reset execution:", error);
      Alert.alert(
        "Reset Error",
        "Something went wrong while clearing application data.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleHardResetPress = () => {
    // Alert configuration blocking accidental trigger events
    Alert.alert(
      "Clear All Progress?",
      "Warning: You are about to wipe your registration progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reset Everything",
          style: "destructive",
          onPress: executeHardReset,
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.resetButton, isResetting && styles.disabledButton]}
        onPress={handleHardResetPress}
        disabled={isResetting}
        activeOpacity={0.7}
      >
        {isResetting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Delete progress</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// Sleek, scannable interface style matching professional UI templates
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resetButton: {
    backgroundColor: colors.primary, // Tailwinds red-500 destructive color flag
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Shadow for Android devices
  },
  disabledButton: {
    backgroundColor: "#fca5a5", // Muted tint state during processing
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
