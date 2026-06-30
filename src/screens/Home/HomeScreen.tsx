import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-deck-swiper";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors } from "../../lib/colors";
import { discoveryApi } from "@/lib/api/discovery.api";
import { matchApi } from "@/lib/api/match.api";
import { profileApi } from "@/lib/api/profile.api";
import UserProfileModal from "./UserProfileModal";
import HomeHeader from "./Home.header";
import FilterModal, { FilterState } from "@/utils/FilterModal";
import { USER_PREFERENCE_KEY } from "@/lib/api.index";
import { useTheme } from "@/lib/context/theme-context";
import { getStyles } from "./HomeScreen.styles";

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

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const navigation = useNavigation<any>();
  const swiperRef = useRef<any>(null);

  // ✅ FIX: Track state explicitly via stack exhaustion instead of array indexing
  const [isStackEmpty, setIsStackEmpty] = useState(false);

  // 🌟 Modal State Management
  const [selectedUser, setSelectedUser] = useState<UserCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // 1. Updated master state to match the limited options + interests
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 50], // Initialized to 18 min, 50 max
    gender: [],
    year: [],
    goals: [],
    interests: [],
  });


  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const saved = await AsyncStorage.getItem(USER_PREFERENCE_KEY);
        if (saved) {
          setFilters(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setIsHydrating(false);
      }
    };

    loadPreferences();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.get,
  });

  // 2. Prevent React Query from fetching until hydration is complete
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["discover", filters],
    queryFn: () => discoveryApi.getUsers(filters),
    enabled: !isHydrating, //  Waits for AsyncStorage
  });

  const likeMutation = useMutation({
    mutationFn: matchApi.like,
    onSuccess: (data) => {
      if (data.match) {
        console.log("Match!", data.match);
      }
    },
  });

  const handleSwipeRight = (index: number) => {
    const user = users[index];
    if (user) {
      likeMutation.mutate(user.userId);
    }
  };

  const handleSwipeLeft = (index: number) => {
    console.log("Passed on user");
    // ✅ FIX: Removed manual state index counters to stop mid-animation re-renders
  };

  const handleCardTap = (index: number) => {
    const user = users[index];
    if (user) {
      setSelectedUser(user);
      setModalVisible(true);
    }
  };

  const handleReload = () => {
    // ✅ FIX: Reset the empty boolean tracking state flag back to false
    setIsStackEmpty(false);
    refetch();
  };

  const handleApplyFilters = async (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsStackEmpty(false);
    try {
      await AsyncStorage.setItem(
        USER_PREFERENCE_KEY,
        JSON.stringify(newFilters),
      );
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

  const renderCard = (user: UserCard) => {
    if (!user) return null;

    const displayInterests = user.interests?.slice(0, 4) || [];
    const studyHabits =
      user.studyPreferences
        ?.split(",")
        .slice(0, 2)
        .map((s) => s.trim()) || [];

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: user.photo || user.photos?.[0] }}
          style={styles.cardImage}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>
                {user.name}, {user.age}
              </Text>
              {/* <Ionicons name="checkmark-circle" size={24} color="#60a5fa" /> */}
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="school-outline"
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={styles.infoText}>
                  {user.major} • {user.year}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={styles.infoText} numberOfLines={1}>
                  {user.college}
                </Text>
              </View>
            </View>

            {user.relationshipGoal && (
              <View style={styles.goalBadge}>
                <Ionicons name="heart" size={12} color={colors.text} />
                <Text style={styles.goalText}>{user.relationshipGoal}</Text>
              </View>
            )}

            {displayInterests.length > 0 && (
              <View style={styles.tagsSection}>
                <View style={styles.tagHeader}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.tagLabel}>Interests</Text>
                </View>
                <View style={styles.tagsRow}>
                  {displayInterests.map((interest, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {studyHabits.length > 0 && (
              <View style={styles.tagsSection}>
                <View style={styles.tagHeader}>
                  <Ionicons
                    name="book-outline"
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.tagLabel}>Study Style</Text>
                </View>
                <View style={styles.tagsRow}>
                  {studyHabits.map((habit, i) => (
                    <View key={i} style={[styles.tag, styles.studyTag]}>
                      <Text style={styles.tagText}>{habit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.pink} />
        <Text style={styles.loadingText}>Finding people in your school...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        campus={profile?.college}
        unreadNotifications={3}
        onSearch={() => navigation.navigate("SearchScreen")}
        onNotifications={() => navigation.navigate("NotificationMatchScreen")}
      />

      {/* BODY AREA (conditional) */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.pink} />
          <Text style={styles.loadingText}>
            Finding people in your school...
          </Text>
        </View>
      ) : isError || users.length === 0 || isStackEmpty ? ( // ✅ FIX: Use simple boolean condition
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color={colors.textMuted} />

          <Text style={styles.emptyTitle}>
            {isError ? "Connection Issue" : "No More Students Nearby"}
          </Text>

          <Text style={styles.emptySubtitle}>
            {isError
              ? "Failed to fetch new campus discoveries. Check your connection network."
              : "Check back later or expand your discovery parameters."}
          </Text>

          <TouchableOpacity
            style={styles.reloadButton}
            onPress={handleReload}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.reloadButtonText}>Refresh Students</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* SWIPER */}
          <View style={styles.swiperContainer}>
            <Swiper
              ref={swiperRef}
              cards={users}
              renderCard={renderCard}
              onSwipedRight={handleSwipeRight}
              onSwipedLeft={handleSwipeLeft}
              onTapCard={handleCardTap}
              onSwipedAll={() => setIsStackEmpty(true)} // ✅ FIX: Added exact trigger for stack finish
              backgroundColor="transparent"
              stackSize={2}
              stackSeparation={10}
              verticalSwipe={false}
              // ✅ FIX: Removed cardIndex prop completely to prevent library conflict crashes
            />
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.dislikeButton}
              onPress={() => swiperRef.current?.swipeLeft()}
              disabled={likeMutation.isPending}
            >
              <Ionicons name="close" size={32} color={colors.error} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => swiperRef.current?.swipeRight()}
              disabled={likeMutation.isPending}
            >
              <LinearGradient
                colors={[colors.pink, colors.rose]}
                style={styles.likeButtonGradient}
              >
                <Ionicons name="heart" size={36} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* MODAL ALWAYS AVAILABLE */}
      <UserProfileModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
      />

      {/* FILTER PREFERENCE MODAL */}
      <FilterModal filters={filters} setFilters={handleApplyFilters} />
    </View>
  );
}
