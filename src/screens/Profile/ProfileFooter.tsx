import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "@/lib/colors";

interface ProfileFooterProps {
  onDeansListPress: () => void;
  onSignOutPress: () => void;
}

export default function ProfileFooter({ onDeansListPress, onSignOutPress }: ProfileFooterProps) {
  return (
    <View style={styles.footerContainer}>
      
      {/* Resized & Re-engineered Compact Premium Card */}
      <TouchableOpacity 
        style={styles.premiumBannerCard} 
        onPress={onDeansListPress}
        activeOpacity={0.7}
      >
        <View style={styles.premiumLeftContent}>
          <View style={styles.badgeIconWrapper}>
            <Ionicons name="ribbon-sharp" size={16} color="#F59E0B" />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.premiumHeading}>Join the Dean's List</Text>
            <Text style={styles.premiumSubtitle}>Boost visibility & unlock perks</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color="#F59E0B" style={styles.arrowSpacing} />
      </TouchableOpacity>

      {/* Clean, Minimalist Sign Out Action Bar */}
      {/* <TouchableOpacity 
        style={styles.logoutActionRow} 
        onPress={onSignOutPress}
        activeOpacity={0.7}
      >
        <View style={styles.logoutLeftContent}>
          <Ionicons name="log-out-outline" size={18} color="#FF4B4B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="rgba(255, 75, 75, 0.4)" />
      </TouchableOpacity> */}

    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    gap: spacing.sm || 12,
    marginTop: spacing.md || 16,
    paddingBottom: spacing.xl || 24,
  },
  premiumBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(245, 158, 11, 0.04)",
    borderRadius: borderRadius.md || 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    paddingVertical: spacing.md || 14,
    paddingHorizontal: spacing.lg || 16,
  },
  premiumLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  badgeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.1)",
  },
  textGroup: {
    flex: 1,
  },
  premiumHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
    letterSpacing: -0.1,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: "#8E8E9F",
    fontWeight: "500",
    marginTop: 1,
  },
  arrowSpacing: {
    opacity: 0.8,
  },
  logoutActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 75, 75, 0.02)",
    borderRadius: borderRadius.md || 12,
    borderWidth: 2,
    borderColor: "rgba(255, 75, 75, 0.1)",
    paddingHorizontal: spacing.lg || 16,
    height: 48,
  },
  logoutLeftContent: {
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
});