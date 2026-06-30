import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

import { colors, spacing, borderRadius } from "@/lib/colors";
import { profileApi } from "@/lib/api/profile.api";
import { useTheme } from "@/lib/context/theme-context";

const { width, height } = Dimensions.get("window");

interface UserCard {
  id: string;
  userId: string;
  name: string;
  age: number;
  photo: string;
  photos?: string[];
  college: string;
  major: string;
  year: string;
  bio: string;
  genderIdentity: string;
  relationshipGoal: string;
  interests: string[];
  studyPreferences: string;
}

interface UserProfileModalProps {
  visible: boolean;
  user: UserCard | null;
  onClose: () => void;
}

export default function UserProfileModal({
  visible,
  user,
  onClose,
}: UserProfileModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [fullProfile, setFullProfile] = useState<UserCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchDetailedProfile = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await profileApi.getById(id);
      setFullProfile(data);
    } catch (error) {
      console.error("Error retrieving unified user profile snapshot:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && user) {
      const targetId = user.userId || user.id;
      if (targetId) {
        fetchDetailedProfile(targetId);
      }
    } else {
      setFullProfile(null);
      setActivePhotoIndex(0);
      setHasError(false);
    }
  }, [visible, user?.userId, user?.id, fetchDetailedProfile]);

  if (!user) return null;

  const handleRetry = () => {
    const targetId = user.userId || user.id;
    if (targetId) {
      fetchDetailedProfile(targetId);
    }
  };

  const displayUser = fullProfile || user;
  const profilePhotos =
    displayUser.photos && displayUser.photos.length > 0
      ? displayUser.photos
      : [displayUser.photo || "https://via.placeholder.com/600"];

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActivePhotoIndex(index);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* TOP ACCENTS / BACK BUTTON */}
        <TouchableOpacity
          style={styles.fixedBackButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* STATE HANDLING LOGIC BLOCK */}
        {isLoading && !fullProfile ? (
          <View style={styles.centerStatusOverlay}>
            <ActivityIndicator
              size="large"
              color={theme.primary || "#7C3AED"}
            />
            <Text style={styles.statusPrimaryText}>
              Loading user profile...
            </Text>
          </View>
        ) : hasError ? (
          <View style={styles.centerStatusOverlay}>
            <View style={styles.errorIconCircle}>
              <Feather name="alert-circle" size={32} color="#EF4444" />
            </View>
            <Text style={styles.statusPrimaryText}>Failed to Load Profile</Text>
            <Text style={styles.statusSecondaryText}>
              Check your network connection parameters.
            </Text>
            <TouchableOpacity
              style={styles.retryActionButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* IMMERSIVE MEDIA PROFILE PORT */}
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
              >
                {profilePhotos.map((photoUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: photoUrl }}
                    style={styles.carouselImage}
                  />
                ))}
              </ScrollView>

              {/* CAROUSEL TRACKER DOTS */}
              {profilePhotos.length > 1 && (
                <View style={styles.paginationContainer}>
                  {profilePhotos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dotIndicator,
                        activePhotoIndex === index
                          ? styles.activeDot
                          : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* TRANSITIONAL SHADOW GRADIENT LAYER */}
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(9, 10, 15, 0.5)",
                  "rgba(9, 10, 15, 1)",
                ]}
                style={styles.imageGradient}
                pointerEvents="none"
              />
            </View>

            {/* MASTER PROFILE DETAILS SHEET */}
            <View style={styles.contentContainer}>
              <View style={styles.identityContainer}>
                <View style={styles.nameHeaderRow}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {displayUser.name}
                  </Text>
                </View>

                {/* RELATIONSHIP TARGET INTENT BADGE */}
                <View style={styles.intentWrapper}>
                  <View style={styles.intentBadge}>
                    <Ionicons name="heart" size={13} color="#F43F5E" />
                    <Text style={styles.intentValueText}>
                      {displayUser.relationshipGoal || "Connections"}
                    </Text>
                  </View>
                </View>

                {/* CORE PROFILE TRAIT SEGMENTS */}
                <View style={styles.statsHorizontalRow}>
                  <View style={styles.statMiniCard}>
                    <Text style={styles.statMetaLabel}>GENDER</Text>
                    <Text style={styles.statMetaValue} numberOfLines={1}>
                      {displayUser.genderIdentity || "Unspecified"}
                    </Text>
                  </View>
                  <View style={styles.statMiniCard}>
                    <Text style={styles.statMetaLabel}>AGE</Text>
                    <Text style={styles.statMetaValue} numberOfLines={1}>
                      {`${displayUser.age} yrs` || ""}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.structuralLineDivider} />

              {/* BIOGRAPHY FIELD BLOCK */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>
                  About Me
                </Text>
                <Text style={styles.bioText}>
                  {displayUser.bio
                    ? `"${displayUser.bio.trim()}"`
                    : "No description provided yet."}
                </Text>
              </View>

              <View style={styles.structuralLineDivider} />

              {/* UNIFIED COMPACT ACADEMICS DATA SECTION */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>College / University</Text>
                <View style={styles.unifiedAcademicCard}>
                  <View style={styles.academicRowHeader}>
                    <View style={styles.iconCircleAccent}>
                      <Ionicons name="school" size={14} color={theme.pink} />
                    </View>
                    <Text style={styles.institutionText} numberOfLines={1}>
                      {displayUser.college || ""}
                    </Text>
                  </View>

                  <View style={styles.academicInnerSplitter} />

                  <View style={styles.academicSubGrid}>
                    <View style={styles.subGridColumn}>
                      <Text style={styles.subLabel}>
                        FIELD OF STUDY (MAJOR)
                      </Text>
                      <Text style={styles.subValue} numberOfLines={1}>
                        {displayUser.major || ""}
                      </Text>
                    </View>
                    <View style={styles.subGridColumnDivider} />
                    <View style={styles.subGridColumn}>
                      <Text style={styles.subLabel}>ACADEMIC YEAR</Text>
                      <Text style={styles.subValue} numberOfLines={1}>
                        {displayUser.year || ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* OPTIONAL HOBBIES TAG CLOUD */}
              {displayUser.interests && displayUser.interests.length > 0 && (
                <View style={[styles.sectionContainer, { marginTop: 16 }]}>
                  <Text style={styles.sectionTitle}>Interests & Passions</Text>
                  <View style={styles.interestsWrapper}>
                    {displayUser.interests.map((interest, idx) => (
                      <View key={idx} style={styles.interestTag}>
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* STUDY PREFERENCE METRIC BADGES */}
              {displayUser.studyPreferences && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Study Environment</Text>
                  <View style={styles.studyPreferencesCard}>
                    <Feather name="book-open" size={14} color="#3B82F6" />
                    <Text style={styles.studyPreferencesText}>
                      {displayUser.studyPreferences}
                    </Text>
                  </View>
                </View>
              )}

              {/* CONTAINER BUFFER HEIGHT BLOCK */}
              <View style={styles.bottomScrollSpacer} />
            </View>
          </ScrollView>
        )}
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

    scrollContent: {
      paddingBottom: 0,
    },
    fixedBackButton: {
      position: "absolute",
      top: 50,
      left: spacing.md || 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(9, 10, 15, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      zIndex: 999,
    },
    centerStatusOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      backgroundColor: theme.background,
    },
    statusPrimaryText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginTop: 16,
      textAlign: "center",
    },
    statusSecondaryText: {
      fontSize: 13,
      color: theme.text,
      marginTop: 6,
      textAlign: "center",
      lineHeight: 18,
    },
    errorIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "rgba(239, 68, 68, 0.08)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.error,
    },
    retryActionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: borderRadius.md || 10,
    },
    retryButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    carouselContainer: {
      width: width,
      height: height * 0.52,
      position: "relative",
      backgroundColor: theme.background,
    },
    carouselImage: {
      width: width,
      height: height * 0.52,
      resizeMode: "cover",
    },
    paginationContainer: {
      position: "absolute",
      bottom: 28,
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      zIndex: 10,
    },
    dotIndicator: {
      height: 4,
      borderRadius: 2,
    },
    activeDot: {
      width: 18,
      backgroundColor: "#FFFFFF",
    },
    inactiveDot: {
      width: 5,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    imageGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      zIndex: 2,
    },
    contentContainer: {
      marginTop: -20,
      borderTopLeftRadius: borderRadius.lg || 16,
      borderTopRightRadius: borderRadius.lg || 16,
      backgroundColor: theme.background,
      paddingHorizontal: spacing.md || 16,
      paddingTop: 20,
      zIndex: 5,
    },
    identityContainer: {
      marginBottom: 4,
    },
    nameHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    nameText: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: -0.5,
    },
    intentWrapper: {
      flexDirection: "row",
      marginBottom: 16,
    },
    intentBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(244, 63, 94, 0.06)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(244, 63, 94, 0.12)",
    },
    intentValueText: {
      color: "#F43F5E",
      fontSize: 12,
      fontWeight: "700",
    },
    statsHorizontalRow: {
      flexDirection: "row",
      gap: 12,
    },
    statMiniCard: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: borderRadius.md || 10,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 2,
    },
    statMetaLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    statMetaValue: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    structuralLineDivider: {
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      marginVertical: 20,
    },
    sectionContainer: {
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.text,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    bioText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      fontWeight: "500",
    },
    unifiedAcademicCard: {
      backgroundColor: theme.background,
      borderRadius: borderRadius.md || 10,
      padding: 12,
      borderWidth: 0.8,
      borderColor: theme.border,
      elevation: 2,
    },
    academicRowHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconCircleAccent: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(59, 130, 246, 0.08)",
      justifyContent: "center",
      alignItems: "center",
    },
    institutionText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    academicInnerSplitter: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 10,
    },
    academicSubGrid: {
      flexDirection: "row",
      alignItems: "center",
    },
    subGridColumn: {
      flex: 1,
    },
    subLabel: {
      fontSize: 8,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    subValue: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    subGridColumnDivider: {
      width: 1.5,
      height: 22,
      backgroundColor: theme.border,
      marginHorizontal: spacing.sm || 12,
    },
    interestsWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    interestTag: {
      backgroundColor: theme.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.sm || 6,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 2,
    },
    interestTagText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "600",
    },
    studyPreferencesCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs || 8,
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      padding: spacing.sm || 12,
      borderRadius: borderRadius.md || 10,
      borderWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.12)",
    },
    studyPreferencesText: {
      color: "#60a5fa",
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
      fontWeight: "600",
    },
    bottomScrollSpacer: {
      height: 100,
    },
  });
