import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../lib/colors";
import { messagesApi } from "@/lib/api/messages.api";
import MatchCard from "./MatchCard";
import ImageViewerModal from "./ImageViewerModal";
import SearchUserModal from "./SearchUserModal";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { globalNavigationRef } from "@/navigation/rootNavigation";
import { useSocket } from "@/lib/context/socket-context";
import { useAuth } from "@/lib/context/auth-context";
import { getStyles } from "./MessagesScreen.styles";
import { useTheme } from "@/lib/context/theme-context";

export default function MessagesScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient(); // Access the global query cache
  const { socket } = useSocket();
  const { user } = useAuth();
  const currentUserId = user?.id?.toString();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  // 📡 TanStack Query Layer - Configured with staleTime to stop hyperactive reloads
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["conversationsList"],
    queryFn: messagesApi.getConversations,
    staleTime: 20000, // Keep data fresh for 20 seconds; prevents automatic HTTP reloads when moving between screens
  });

  const activeConversations = data?.conversations || [];

  // ⚡ REAL-TIME CACHE PIPELINE (Handles incoming updates dynamically without reloads)
  useEffect(() => {
    if (!socket) return;

    // Updates text snippet, handles unread indicators, and floats active conversations to the top
    const handleRealTimeMessage = (msg: any) => {
      const targetRoomId = msg.matchId || msg.conversationId;
      if (!targetRoomId) return;

      // Check if the user is currently actively viewing THIS specific room right now
      let isViewingThisChat = false;
      if (globalNavigationRef.isReady()) {
        const currentRoute = globalNavigationRef.getCurrentRoute();
        if (
          currentRoute?.name === "Chat" &&
          (currentRoute?.params as any)?.matchId?.toString() ===
            targetRoomId.toString()
        ) {
          isViewingThisChat = true;
        }
      }

      // 1. UPDATE THE OVERVIEW CONVERSATIONS LIST CACHE
      queryClient.setQueryData(["conversationsList"], (oldData: any) => {
        if (!oldData) return oldData;
        const list = oldData.conversations || [];

        const roomExists = list.some(
          (c: any) => c.id?.toString() === targetRoomId.toString(),
        );

        let shortText = msg.content;
        if (msg.type === "image") shortText = "📷 Photo";
        if (msg.type === "video") shortText = "🎥 Video";
        if (msg.type === "voice" || msg.type === "voice_note")
          shortText = "🎤 Voice note";

        let updatedList = list.map((c: any) => {
          if (c.id?.toString() === targetRoomId.toString()) {
            const isSentByMe = msg.senderId?.toString() === currentUserId;

            // FIX: If sent by me OR if I am actively staring at this room, keep unread at 0
            const finalUnreadCount =
              isSentByMe || isViewingThisChat ? 0 : c.unreadCount + 1;

            return {
              ...c,
              lastMessage: shortText,
              lastMessageTime: msg.createdAt || new Date().toISOString(),
              unreadCount: finalUnreadCount,
            };
          }
          return c;
        });

        if (roomExists) {
          updatedList.sort(
            (a: any, b: any) =>
              new Date(b.lastMessageTime).getTime() -
              new Date(a.lastMessageTime).getTime(),
          );
        }

        return { ...oldData, conversations: updatedList };
      });

      // 2. PRE-POPULATE TARGET ROOM HISTORICAL CACHE LAYER
      queryClient.setQueryData(
        ["messagesRoom", targetRoomId.toString()],
        (oldMessages: any) => {
          if (!oldMessages) return undefined;
          if (
            oldMessages.some(
              (m: any) => m.id?.toString() === msg.id?.toString(),
            )
          ) {
            return oldMessages;
          }
          return [msg, ...oldMessages];
        },
      );
    };

    // Tracks peer typing fluctuations inside the active conversation card structure
    const handleTypingStatus = (data: {
      conversationId: string;
      isTyping: boolean;
    }) => {
      queryClient.setQueryData(["conversationsList"], (oldData: any) => {
        if (!oldData) return oldData;
        const list = oldData.conversations || [];

        const updatedList = list.map((c: any) => {
          if (c.id?.toString() === data.conversationId?.toString()) {
            return { ...c, isTyping: data.isTyping };
          }
          return c;
        });

        return { ...oldData, conversations: updatedList };
      });
    };

    socket.on("receive_message", handleRealTimeMessage);
    socket.on("message_sent_confirm", handleRealTimeMessage);
    socket.on("typing_status", handleTypingStatus);

    return () => {
      socket.off("receive_message", handleRealTimeMessage);
      socket.off("message_sent_confirm", handleRealTimeMessage);
      socket.off("typing_status", handleTypingStatus);
    };
  }, [socket, currentUserId, queryClient]);

  const handleOpenImage = (url: string) => {
    if (!url) return;
    setSelectedImage(url);
  };

  const handleNavigateToChat = (
    conversationId: string,
    name: string,
    photo: string,
  ) => {
    // OPTIMISTIC CACHE UPDATE: Zero out unread status locally for instant visual feedback
    queryClient.setQueryData(["conversationsList"], (oldData: any) => {
      if (!oldData) return oldData;
      const list = oldData.conversations || [];

      const updatedList = list.map((c: any) =>
        c.id?.toString() === conversationId.toString()
          ? { ...c, unreadCount: 0 } // Wipe indicator clean
          : c,
      );

      return { ...oldData, conversations: updatedList };
    });

    // FIX: Explicitly invalidate the target query room to guarantee background validation matches database state
    queryClient.invalidateQueries({
      queryKey: ["messagesRoom", conversationId.toString()],
    });

    navigation.navigate("Chat", { matchId: conversationId, name, photo });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.pink} />
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconHalo}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={theme.error}
          />
        </View>
        <Text style={styles.errorTitle}>Failed to sync messages</Text>
        <Text style={styles.errorDescription}>
          Check your network status or tap retry to re-establish connection.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          disabled={isRefetching}
          activeOpacity={0.8}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.retryButtonText}>Try Again</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitleSubtext}>
            {activeConversations.length} connection
            {activeConversations.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.searchIconButton}
          onPress={() => setSearchVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* FEED LIST REGION */}
      <View style={styles.messagesSection}>
        <FlatList
          data={activeConversations}
          keyExtractor={(item) => `chat-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <MatchCard
              item={item}
              onOpenImage={handleOpenImage}
              onPressCard={(id, name, photo) =>
                handleNavigateToChat(id, name, photo)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={40}
                  color={theme.pink || "#ff70a2"}
                />
              </View>
              <Text style={styles.emptyTitle}>Your feed is ready</Text>
              <Text style={styles.emptySubtitle}>
                When mutual connections choose you back from the match board,
                conversations will ignite automatically here.
              </Text>
            </View>
          }
        />
      </View>

      {/* GLOBAL MODALS ACCESSIBILITY ENVELOPE */}
      <SearchUserModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        matches={activeConversations}
        onOpenImage={handleOpenImage}
        onNavigateToChat={handleNavigateToChat}
      />

      <ImageViewerModal
        visible={!!selectedImage}
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
}
