import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from "./SettingsScreens.styles";
import { useTheme } from "@/lib/context/theme-context";
import { settingsApi } from "@/lib/api/settings.api";
import FilterBotton_Modal, { FilterState } from "@/utils/FilterModal";
import { USER_PREFERENCE_KEY } from "@/lib/api.index";
import Footer from "./Footer";

type Tier = "freshman" | "varsity" | "deans_list";

export default function SettingsScreen() {
  const queryClient = useQueryClient();

  // 1. Appearance Tokens & Theme Config
  const { isDarkMode, theme: globalTheme, toggleTheme } = useTheme();

  const theme = {
    bg: globalTheme.background,
    cardBg: globalTheme.surface,
    textPrimary: globalTheme.text,
    textSecondary: globalTheme.textMuted,
    border: globalTheme.border,
    accent: globalTheme.primary,
    varsityAccent: globalTheme.secondary,
    deansAccent: globalTheme.warning,
  };

  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 50], // Initialized to 18 min, 50 max
    gender: [],
    year: [],
    goals: [],
    interests: [],
  });

  const handleApplyFilters = async (newFilters: FilterState) => {
    setFilters(newFilters);
    try {
      await AsyncStorage.setItem(
        USER_PREFERENCE_KEY,
        JSON.stringify(newFilters),
      );
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

  // 2. Fetch Server Settings Engine via TanStack Query
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });

  // 3. Mutate Database Updates with Instant Optimistic UI Feedback
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.update,
    onMutate: async (newSettingsPayload) => {
      // Cancel outbound refetches so they don't overwrite our optimistic state
      await queryClient.cancelQueries({ queryKey: ["settings"] });

      // Snapshot the previous state context
      const previousSettings = queryClient.getQueryData(["settings"]);

      // Optimistically overwrite the query cache directly
      queryClient.setQueryData(["settings"], (old: any) => ({
        ...old,
        ...newSettingsPayload,
      }));

      return { previousSettings };
    },
    onError: (err, newSettingsPayload, context) => {
      // Roll back cache to old snapshot state if server operation rejects
      if (context?.previousSettings) {
        queryClient.setQueryData(["settings"], context.previousSettings);
      }
      alert("Failed to save synchronization updates. Check your network.");
    },
    onSettled: () => {
      // Force database refetch after operation resolves to guarantee absolute truth
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Master short-circuit layout for structural hydration
  if (isLoading) {
    return (
      <View
        style={[
          styles.safeArea,
          {
            backgroundColor: theme.bg,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
        <Text
          style={{ color: theme.textSecondary, marginTop: 12, fontSize: 14 }}
        >
          Loading application preferences...
        </Text>
      </View>
    );
  }

  // Safe fallback default evaluations mapping
  const activeTier = (settingsData?.activeTier as Tier) || "freshman";
  const travelMode = !!settingsData?.travelMode;
  const breakMode = !!settingsData?.breakMode;
  const ghostMode = !!settingsData?.ghostMode;
  const hideLastName = !!settingsData?.hideLastName;
  const allowNotifications = settingsData?.allowNotifications !== false; // Defaults to true

  // Mutation dispatcher pipeline abstraction
  const handleUpdateSetting = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  // Reusable Row Component for Option Toggles
  const SettingRow = ({
    icon,
    title,
    description,
    value,
    onValueChange,
    disabled = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <View
      style={[
        styles.rowContainer,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
      ]}
    >
      <View style={styles.rowIconContainer}>
        <Ionicons
          name={icon}
          size={22}
          color={disabled ? theme.textSecondary : theme.accent}
        />
      </View>
      <View style={styles.rowTextSection}>
        <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.rowDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: globalTheme.surfaceLight,
          true: theme.accent,
        }}
        thumbColor={
          Platform.OS === "ios" ? "#FFFFFF" : value ? "#FFFFFF" : "#F4F3F4"
        }
      />
    </View>
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      {/* ================= HEADER TITLE & SYNC INDICATOR ================= */}
      <View
        style={[
          styles.screenHeader,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: 2,
          },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text
            style={[styles.screenHeaderTitle, { color: theme.textPrimary }]}
          >
            Settings
          </Text>
          <Text
            style={[styles.screenHeaderSub, { color: theme.textSecondary }]}
          >
            Manage your campus match identity
          </Text>
        </View>
        {updateSettingsMutation.isPending && (
          <View style={{ paddingTop: 8 }}>
            <ActivityIndicator size="small" color={theme.accent} />
          </View>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* ================= 1. MEMBERSHIP TIERS ================= */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          MEMBERSHIP TIER
        </Text>
        <View style={styles.tierContainer}>
          {/* Freshman Tier Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleUpdateSetting("activeTier", "freshman")}
            style={[
              styles.tierCard,
              {
                backgroundColor: theme.cardBg,
                borderColor:
                  activeTier === "freshman" ? theme.accent : theme.border,
                shadowColor:
                  activeTier === "freshman" ? theme.accent : "transparent",
              },
            ]}
          >
            <View style={styles.tierMainRow}>
              <View style={styles.tierMetaSection}>
                <View style={styles.tierTitleBadgeRow}>
                  <Text
                    style={[styles.tierTitle, { color: theme.textPrimary }]}
                  >
                    Freshman
                  </Text>
                  {activeTier === "freshman" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.accent}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tierFeatureText,
                    { color: theme.textSecondary },
                  ]}
                >
                  • Standard matchmaking{"\n"}• 15 likes per day
                </Text>
              </View>

              <View
                style={[
                  styles.priceContainer,
                  {
                    backgroundColor: globalTheme.surfaceLight,
                  },
                ]}
              >
                <Text style={[styles.tierPriceTag, { color: theme.accent }]}>
                  Current • Free
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Varsity Tier Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleUpdateSetting("activeTier", "varsity")}
            style={[
              styles.tierCard,
              {
                backgroundColor: theme.cardBg,
                borderColor:
                  activeTier === "varsity" ? theme.varsityAccent : theme.border,
                shadowColor:
                  activeTier === "varsity"
                    ? theme.varsityAccent
                    : "transparent",
              },
            ]}
          >
            <View style={styles.tierMainRow}>
              <View style={styles.tierMetaSection}>
                <View style={styles.tierTitleBadgeRow}>
                  <Text
                    style={[styles.tierTitle, { color: theme.varsityAccent }]}
                  >
                    Varsity
                  </Text>
                  {activeTier === "varsity" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.varsityAccent}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tierFeatureText,
                    { color: theme.textSecondary },
                  ]}
                >
                  • 30 likes per day{"\n"}• See who likes you{"\n"}• 1 Super
                  Crush / week
                </Text>
              </View>

              <View
                style={[
                  styles.priceContainer,
                  {
                    backgroundColor: globalTheme.surfaceLight,
                  },
                ]}
              >
                <Text
                  style={[styles.tierPriceTag, { color: theme.varsityAccent }]}
                >
                  $4.99 / mo
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Dean's List Tier Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleUpdateSetting("activeTier", "deans_list")}
            style={[
              styles.tierCard,
              {
                backgroundColor: theme.cardBg,
                borderColor:
                  activeTier === "deans_list"
                    ? theme.deansAccent
                    : theme.border,
                shadowColor:
                  activeTier === "deans_list"
                    ? theme.deansAccent
                    : "transparent",
              },
            ]}
          >
            <View style={styles.tierMainRow}>
              <View style={styles.tierMetaSection}>
                <View style={styles.tierTitleBadgeRow}>
                  <Text
                    style={[styles.tierTitle, { color: theme.deansAccent }]}
                  >
                    Dean's List
                  </Text>
                  {activeTier === "deans_list" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.deansAccent}
                      style={styles.checkIcon}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tierFeatureText,
                    { color: theme.textSecondary },
                  ]}
                >
                  • Unlimited likes & Priority{"\n"}• Travel Mode access{"\n"}•
                  Multi-gender filter{"\n"}• 1 Super Crush / week
                </Text>
              </View>

              <View
                style={[
                  styles.priceContainer,
                  {
                    backgroundColor: globalTheme.surfaceLight,
                  },
                ]}
              >
                <Text
                  style={[styles.tierPriceTag, { color: theme.deansAccent }]}
                >
                  $9.99 / mo
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 2. APPEARANCE CONFIGURATION ================= */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          APPEARANCE
        </Text>
        <SettingRow
          icon={isDarkMode ? "moon" : "sunny"}
          title="Dark Mode Layout"
          description="Toggle between clean light styles and pro high-contrast dark visual tones"
          value={isDarkMode}
          onValueChange={toggleTheme}
        />

        {/* ================= 3. PRIVACY & DISCOVERY ================= */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          PRIVACY & DISCOVERY
        </Text>

        <SettingRow
          icon="planet-outline"
          title="Travel Mode"
          description="Match with students while away from campus. (Upgrade Required)"
          value={travelMode}
          onValueChange={(val) => {
            if (activeTier !== "deans_list") {
              alert(
                "Dean's List Upgrade Required to access Travel Mode tracking.",
              );
              return;
            }
            handleUpdateSetting("travelMode", val);
          }}
          disabled={activeTier !== "deans_list"}
        />

        <SettingRow
          icon="pause-circle-outline"
          title="Break Mode"
          description="Hide profile while on break. You won't be seen by others in the discovery feed"
          value={breakMode}
          onValueChange={(val) => handleUpdateSetting("breakMode", val)}
        />

        <SettingRow
          icon="eye-off-outline"
          title="Ghost Mode"
          description="Completely drop out of active deck shuffling and ongoing matchmaking engines"
          value={ghostMode}
          onValueChange={(val) => handleUpdateSetting("ghostMode", val)}
        />

        <SettingRow
          icon="text-outline"
          title="Hide Last Name"
          description="Secure your identity layout. Shows 'Jane D' instead of 'Jane Doe' on your card asset"
          value={hideLastName}
          onValueChange={(val) => handleUpdateSetting("hideLastName", val)}
        />

        {/* ================= 4. STREAMLINED PUSH NOTIFICATIONS ================= */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          PUSH NOTIFICATIONS
        </Text>

        <SettingRow
          icon="notifications-outline"
          title="Allow Push Notifications"
          description="Get live updates for mutual match alignments, status pings, and inbound chat messages"
          value={allowNotifications}
          onValueChange={(val) =>
            handleUpdateSetting("allowNotifications", val)
          }
        />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          SHOW ME
        </Text>

        <FilterBotton_Modal
          filters={filters}
          setFilters={handleApplyFilters}
          fixedPosition={false}
        />
        <View style={{marginTop: 20}}/>
        <Footer/>
      </ScrollView>
    </View>
  );
}
