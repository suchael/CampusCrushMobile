import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { colors } from "@/lib/colors";
import { notificationMatchApi, NotificationUser, NotificationsResponse } from "@/lib/api/notificationMatch.api";
import UserProfileModal from "./UserProfileModal";
import { getStyles } from "./NotificationMatchScreen.styles";
import { formatRelativeTime } from "@/utils/formatDate";
import { useTheme } from "@/lib/context/theme-context";

export default function NotificationMatchScreen() {
  const { theme } = useTheme();
    const styles = getStyles(theme);

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  // Modal State Management
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. FETCH NOTIFICATIONS DATA
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationMatchApi.getNotifications,
    refetchOnMount: "always", // 🚀 Forces a network refetch every single time this screen mounts newly
    staleTime: 0,             // Marks cached data as immediately stale to prevent lazy loads
  });

  // 2. MUTATION HANDLERS
  const acceptMutation = useMutation({
    mutationFn: notificationMatchApi.acceptRequest,
    onSuccess: (responseData, targetUserId) => {
      // Instantly evict user card from local incoming cache state
      queryClient.setQueryData<NotificationsResponse>(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          incoming: oldData.incoming.filter((user) => user.id !== targetUserId),
        };
      });

      Alert.alert("Success!", "You can now chat with each other.");
      
      // Removed notifications invalidation to kill duplicate GET requests
      queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.message || "Failed to accept friend request.");
    }
  });

  const declineMutation = useMutation({
    mutationFn: notificationMatchApi.declineRequest,
    onSuccess: (responseData, targetUserId) => {
      // Instantly evict user card from local incoming cache state
      queryClient.setQueryData<NotificationsResponse>(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          incoming: oldData.incoming.filter((user) => user.id !== targetUserId),
        };
      });

      Alert.alert("Request Declined", "The invitation has been removed.");
      // Removed notifications invalidation to protect network overhead
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.message || "Failed to decline request.");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: notificationMatchApi.cancelRequest,
    onSuccess: (responseData, targetUserId) => {
      // Instantly evict user card from local outgoing cache state
      queryClient.setQueryData<NotificationsResponse>(["notifications"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          outgoing: oldData.outgoing.filter((user) => user.id !== targetUserId),
        };
      });

      Alert.alert("Request Cancelled", "Your friend request was withdrawn.");
      
      // Kept clean external cross-query dependencies only
      queryClient.invalidateQueries({ queryKey: ["searchUsers"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.message || "Failed to cancel request.");
    }
  });

  // 3. ACTION TRIGGERS
  const handleCardPress = (user: NotificationUser) => {
    const profilePayload = {
      id: user.id,
      userId: user.id,
      name: user.name,
      age: user.age,
      photo: user.photos?.[0] || "",
      photos: user.photos || [],
      college: user.college,
      genderIdentity: user.genderIdentity,
      major: user.major || "Student",
      year: user.year || "",
      bio: user.bio || "",
      relationshipGoal: user.relationshipGoal || "",
      interests: user.interests || [],
      studyPreferences: user.studyPreferences || "",
    };
    setSelectedUser(profilePayload);
    setModalVisible(true);
  };

  const activeData = activeTab === "received" ? data?.incoming || [] : data?.outgoing || [];

  const renderItem = ({ item }: { item: NotificationUser }) => {
    const isProcessing =
      (acceptMutation.isPending && acceptMutation.variables === item.id) ||
      (declineMutation.isPending && declineMutation.variables === item.id) ||
      (cancelMutation.isPending && cancelMutation.variables === item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => handleCardPress(item)}
      >
        {/* AVATAR */}
        <Image
          source={{ uri: item.photos?.[0] || "https://via.placeholder.com/150" }}
          style={styles.avatar}
        />

        {/* INFO */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.name}>{item.name}, {item.age}y</Text>
            <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="school-outline" size={14} color={colors.textMuted} />
            <Text style={styles.school} numberOfLines={1}>{item.college}</Text>
          </View>

          {activeTab === "received" ? (
            <View style={styles.tag}>
              <Ionicons name="person-add" size={12} color={colors.primary} />
              <Text style={styles.tagText}>Sent you a friend request</Text>
            </View>
          ) : (
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.tagText, { color: colors.textMuted }]}>
                Waiting for response
              </Text>
            </View>
          )}

          {/* ACTIONS */}
          <View style={styles.actions}>
            {activeTab === "received" ? (
              <>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => declineMutation.mutate(item.id)}
                  disabled={isProcessing}
                >
                  <Ionicons name="close" size={16} color={colors.error} />
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => acceptMutation.mutate(item.id)}
                  disabled={isProcessing}
                >
                  {acceptMutation.isPending && acceptMutation.variables === item.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text style={styles.acceptText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelMutation.mutate(item.id)}
                disabled={isProcessing}
              >
                {cancelMutation.isPending && cancelMutation.variables === item.id ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.cancelText}>Cancel Request</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Manage your campus connections</Text>

      {/* TABS SEGMENT */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "received" && styles.activeTabButton]}
          onPress={() => setActiveTab("received")}
        >
          <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>
            Received ({data?.incoming?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "sent" && styles.activeTabButton]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>
            Sent ({data?.outgoing?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOADING INDICATOR */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        /* LIST */
        <FlatList
          data={activeData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={60}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === "received" ? "No requests yet" : "No sent requests"}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === "received"
                  ? "When people send you friend requests, they will appear here."
                  : "Pending outgoing friend requests will follow your delivery logs here."}
              </Text>
            </View>
          }
        />
      )}

      {/* DETAILED PROFILE MODAL CONTAINER */}
      <UserProfileModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </View>
  );
}