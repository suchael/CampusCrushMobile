import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { getStyles } from "./ExploreScreen.styles";
import {
  explore_Events_Api,
  CampusEvent,
  ExternalEventDate,
} from "@/lib/api/explore.event.api";
import { useTheme } from "@/lib/context/theme-context";

export default function ExploreScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch live external events via the API
  const {
    data: exploreResponse,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["externalEvents"],
    queryFn: () => explore_Events_Api.getExternalEvents(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const events: CampusEvent[] = exploreResponse?.events || [];

  const handleOpenLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  const handleOpenMap = async (item: CampusEvent) => {
    const query = encodeURIComponent(item.location);
    const nativeMapUrl = Platform.select({
      ios: `http://maps.apple.com/?q=${query}`, 
      android: `https://maps.google.com/?q=${query}`, 
      default: `https://maps.google.com/?q=${query}`,
    });

    try {
      if (item.mapLink) {
        console.log("opening MAPLINK: ", item.mapLink);
        await Linking.openURL(item.mapLink);
      } else {
        console.log("opening nativeMapUrl: ", nativeMapUrl);
        await Linking.openURL(nativeMapUrl);
      }
    } catch (error) {
      console.log("Native map failed, falling back to SerpApi mapLink...");
      Alert.alert("Error", "Failed to open map");
    }
  };
  

  const renderEventCard = ({ item }: { item: CampusEvent }) => {
    const eventDate = item.date as ExternalEventDate;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => handleOpenLink(item.link)}
        disabled={true}
      >
        {/* Bento Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
            }}
            style={styles.cardImage}
          />

          {/* Floating Top Badges */}
          <View style={styles.floatingTopRow}>
            {eventDate?.time && (
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{eventDate.time}</Text>
              </View>
            )}

            {item.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingBadgeText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bento Content Section */}
        <View style={styles.cardContent}>
          <Text style={styles.cardCategory}>
            {item.category || "External Event"}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <View style={styles.iconBox}>
                <Ionicons name="time" size={16} color={theme.pink} />
              </View>
              <Text style={styles.metaText} numberOfLines={1}>
                {eventDate?.when || "Time TBA"}, {eventDate.time}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={16} color={theme.pink} />
              </View>
              <Text style={styles.metaText} numberOfLines={2}>
                {item.location}
              </Text>
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => {
                handleOpenMap(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryActionText}>View Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            {/* BYPASS FIX: Type casting the root response directly to any to safely extract the string wrapper */}
            List of events - {(exploreResponse as any)?.schoolQueried || ""}
          </Text>
        </View>
      </View>

      {/* Main Content View */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.pink} />
          <Text style={styles.loadingText}>Scouting external events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons
                name={isError ? "alert-circle-outline" : "planet-outline"}
                size={64}
                color={theme.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {isError ? "Connection Error" : "No Events Found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isError 
                  ? "We couldn't secure a baseline downstream server connection. Please try running the query again."
                  : "We couldn't find any external events right now. Check back later!"}
              </Text>
              
              {/* Added Interactive UI Retry Action matching your layout style parameters */}
              <TouchableOpacity
                style={[styles.primaryAction, { marginTop: 20, paddingHorizontal: 24, alignSelf: 'center' }]}
                activeOpacity={0.7}
                onPress={() => refetch()}
              >
                <Text style={styles.primaryActionText}>Retry Search</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </Animated.View>
  );
}