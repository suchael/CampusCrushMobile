import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useAuth } from "@/lib/context/auth-context";
import { profileApi } from "@/lib/api/profile.api";
import { colors, spacing } from "@/lib/colors";

// Sleek, fully refactored UI sub-modules
import ProfileHeader from "./ProfileHeader";
import MediaGallery from "./MediaGallery";
import ProfileDetailsCard from "./ProfileDetailsCard";
import ProfileFooter from "./ProfileFooter";
import { useTheme } from "@/lib/context/theme-context";

interface ProfileData {
  id?: string;
  userId?: string;
  name: string;
  age: number | string;
  bio: string;
  college: string;
  major: string;
  year: string;
  genderIdentity: string;
  relationshipGoal: string;
  photos: string[];
  interests: string[];
}

export default function ProfileScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { logout } = useAuth();

  // Clean, responsive application states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    age: "",
    bio: "",
    college: "",
    major: "",
    year: "",
    genderIdentity: "",
    relationshipGoal: "",
    photos: [],
    interests: [],
  });

  useEffect(() => {
    fetchUserProfileData();
  }, []);

  const fetchUserProfileData = async () => {
    try {
      setLoadingProfile(true);
      const data = await profileApi.get();
      if (data) {
        setProfile({
          ...data,
          age:
            data.age !== null && data.age !== undefined ? String(data.age) : "",
          photos: data.photos || [],
          interests: data.interests || [],
        });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert(
        "Error",
        "Couldn't load your profile details. Please try again.",
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateField = (fieldName: string, value: any) => {
    setProfile((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleToggleEditModeAction = async () => {
    if (isEditing) {
      try {
        setIsSaving(true);
        const structuredPayload = {
          ...profile,
          age: profile.age ? parseInt(String(profile.age), 10) : null,
        };
        await profileApi.update(structuredPayload);
        setIsEditing(false);
        Alert.alert("Success", "Your profile has been updated!");
      } catch (err) {
        console.error("Profile save error:", err);
        Alert.alert(
          "Save Failed",
          "Could not save your changes. Please check your connection.",
        );
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleAsyncLogOutSequence = async () => {
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
            console.error("Logout error:", error);
            Alert.alert(
              "Error",
              "Failed to sign out safely. Please try again.",
            );
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleDeansListTrigger = () => {
    Alert.alert(
      "Dean's List",
      "Dean's List application features are coming soon!",
    );
  };


  // Ultra-clean modern loading state that respects the dark design system
  if (loadingProfile || isLoggingOut) {
    return (
      <View style={styles.loaderFallbackContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={styles.loaderTextStatus}>
          {isLoggingOut ? "Signing out..." : "Loading profile..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.viewLayoutCanvas}>
      {/* 1. Profile Header Module */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onToggleEdit={handleToggleEditModeAction}
        onCancelEdit={() => setIsEditing(false)}
        onSettingsPress={() => navigation.navigate("SettingsScreen")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentLayout}
      >
        {/* 2. Media Gallery Module */}
        <MediaGallery
          photos={profile.photos}
          userName={profile.name}
          isEditing={isEditing}
          onUpdatePhotos={(updatedPhotos) =>
            handleUpdateField("photos", updatedPhotos)
          }
        />

        {/* 3. Profile Form Details Card */}
        <ProfileDetailsCard
          profile={profile}
          isEditing={isEditing}
          onUpdateField={handleUpdateField}
        />

        {/* 4. Footer/Session Action Rows */}
        {/* <ProfileFooter
          onDeansListPress={handleDeansListTrigger}
          onSignOutPress={handleAsyncLogOutSequence}
        /> */}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    viewLayoutCanvas: {
      flex: 1,
      backgroundColor: theme.background, // Matches app canvas seamlessly
    },
    loaderFallbackContainer: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loaderColor: {
      color: theme.text,
    },
    loaderTextStatus: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
      letterSpacing: -0.1,
    },
    scrollContentLayout: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: 40,
    },
  });
