import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "@/navigation/AppNavigator";
import { messagesApi } from "@/lib/api/messages.api";
import ChatHeader from "./ChatHeader";
import ChatBottom from "./ChatBottom";
import ChatMenuModal from "./ChatMenuModal";
import ImageViewerModal from "../ImageViewerModal";
import EmojiModal from "./EmojiModal";
import VoiceRecordModal from "./VoiceRecordModal";
import VoiceRecordPlayer from "./VoiceRecordPlayer";
import VideoPlayerModal from "./VideoPlayerModal";
import { useSocket } from "@/lib/context/socket-context";
import { useAuth } from "@/lib/context/auth-context";
import { getStyles } from "./ChatScreen.styles";
import { useTheme } from "@/lib/context/theme-context";

const getRelativeDateLabel = (isoString: string): string => {
  try {
    const targetDate = new Date(isoString);
    const today = new Date();
    const targetZero = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );
    const todayZero = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const diffDays = Math.round(
      (todayZero.getTime() - targetZero.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return targetDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "Chat">>();
  const { matchId, name, photo } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { socket } = useSocket();
  const { user } = useAuth();
  const currentUserId = user?.id?.toString();

  const flatListRef = useRef<FlatList>(null);

  // --- LOCAL CHAT INSTANCE STATES ---
  const [messages, setMessages] = useState<any[]>([]);
  const [isPeerOnline, setIsPeerOnline] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [appendEmojiCallback, setAppendEmojiCallback] = useState<
    ((char: string) => void) | null
  >(null);

  // Safely infer target profile userId coordinates
  const derivedReceiverId =
    messages
      .find((m) => m.senderId?.toString() !== currentUserId)
      ?.senderId?.toString() || matchId;

  // --- TANSTACK HISTORICAL LOGS FETCH ENGINE ---
  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: ["messagesRoom", matchId.toString()],
    queryFn: () => messagesApi.getMessages(matchId),
    staleTime: 0, // FIX: Force room records to evaluate stale values instantly on focus
    refetchOnMount: "always", // FIX: Force immediate query network checks when mounting across screens
  });

  // Keep state synchronized and sorted descending when fetched logs shift
  useEffect(() => {
    if (fetchedMessages) {
      const sorted = [...fetchedMessages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setMessages(sorted);
    }
  }, [fetchedMessages]);

  // INITIAL PRESENCE BACKUP SYNC: Extract base user status from conversations list cache
  useEffect(() => {
    const cachedConversations: any = queryClient.getQueryData([
      "conversationsList",
    ]);
    const list =
      cachedConversations?.data?.conversations ||
      cachedConversations?.conversations;
    if (Array.isArray(list)) {
      const currentRoom = list.find(
        (c: any) => c.id?.toString() === matchId?.toString(),
      );
      if (currentRoom) {
        setIsPeerOnline(!!currentRoom.isOnline);
      }
    }
  }, [matchId, fetchedMessages, queryClient]);

  // --- REAL-TIME WEBSOCKET SUBSYSTEM LISTENER LAYER ---
  // --- REAL-TIME WEBSOCKET SUBSYSTEM LISTENER LAYER ---
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (newMsg: any) => {
      if (newMsg.matchId?.toString() === matchId?.toString()) {
        // 1. Update component UI array instantly
        setMessages((prev) => {
          if (prev.some((m) => m.id?.toString() === newMsg.id?.toString()))
            return prev;
          return [newMsg, ...prev];
        });

        // 2. Write to TanStack Room query data immediately to block background refetch overrides
        queryClient.setQueryData(
          ["messagesRoom", matchId.toString()],
          (old: any) => {
            if (!old) return [newMsg];
            if (
              old.some((m: any) => m.id?.toString() === newMsg.id?.toString())
            )
              return old;
            return [newMsg, ...old];
          },
        );

        // 3. FIX: Optimistically update the conversation list snippet and force unread to 0
        queryClient.setQueryData(["conversationsList"], (oldData: any) => {
          if (!oldData) return oldData;
          const list = oldData.conversations || [];

          let shortText = newMsg.content;
          if (newMsg.type === "image") shortText = "📷 Photo";
          if (newMsg.type === "video") shortText = "🎥 Video";
          if (newMsg.type === "voice" || newMsg.type === "voice_note")
            shortText = "🎤 Voice note";

          const updatedList = list.map((c: any) => {
            if (c.id?.toString() === matchId.toString()) {
              return {
                ...c,
                lastMessage: shortText,
                lastMessageTime: newMsg.createdAt || new Date().toISOString(),
                unreadCount: 0, // Keep at 0 since user is actively inside this ChatScreen
              };
            }
            return c;
          });

          // Float the active conversation thread directly to index [0]
          updatedList.sort(
            (a: any, b: any) =>
              new Date(b.lastMessageTime).getTime() -
              new Date(a.lastMessageTime).getTime(),
          );

          return { ...oldData, conversations: updatedList };
        });

        // 4. FIX: Send a real-time read receipt to the server so the DB updates permanently
        socket.emit("mark_as_read", {
          conversationId: matchId,
          userId: currentUserId,
        });

        // Note: If your backend handles read receipts via HTTP instead of web sockets,
        // you can swap the socket line above for your API handler:
        // messagesApi.markAsRead(matchId).catch((err) => console.error(err));
      }
    };

    const handleSentConfirmation = (confirmedMsg: any) => {
      if (confirmedMsg.matchId?.toString() === matchId?.toString()) {
        // 1. Swap temporary optimistic bubbles inside state instance layout
        setMessages((prev) => {
          if (
            prev.some((m) => m.id?.toString() === confirmedMsg.id?.toString())
          )
            return prev;
          return [
            confirmedMsg,
            ...prev.filter(
              (m) => m.isOptimistic !== true && m.id !== confirmedMsg.id,
            ),
          ];
        });

        // 2. Sync transaction status into TanStack Cache directly
        queryClient.setQueryData(
          ["messagesRoom", matchId.toString()],
          (old: any) => {
            const list = old || [];
            if (
              list.some(
                (m: any) => m.id?.toString() === confirmedMsg.id?.toString(),
              )
            )
              return list;
            return [
              confirmedMsg,
              ...list.filter(
                (m: any) => m.isOptimistic !== true && m.id !== confirmedMsg.id,
              ),
            ];
          },
        );

        // Optimistically update the conversation list for your own sent confirmations to maintain performance
        queryClient.setQueryData(["conversationsList"], (oldData: any) => {
          if (!oldData) return oldData;
          const list = oldData.conversations || [];

          let shortText = confirmedMsg.content;
          if (confirmedMsg.type === "image") shortText = "📷 Photo";
          if (confirmedMsg.type === "video") shortText = "🎥 Video";
          if (
            confirmedMsg.type === "voice" ||
            confirmedMsg.type === "voice_note"
          )
            shortText = "🎤 Voice note";

          const updatedList = list.map((c: any) => {
            if (c.id?.toString() === matchId.toString()) {
              return {
                ...c,
                lastMessage: shortText,
                lastMessageTime:
                  confirmedMsg.createdAt || new Date().toISOString(),
              };
            }
            return c;
          });

          updatedList.sort(
            (a: any, b: any) =>
              new Date(b.lastMessageTime).getTime() -
              new Date(a.lastMessageTime).getTime(),
          );

          return { ...oldData, conversations: updatedList };
        });
      }
    };

    const handleTypingStatus = (data: {
      conversationId: string;
      isTyping: boolean;
    }) => {
      if (data.conversationId?.toString() === matchId?.toString()) {
        setIsPeerTyping(data.isTyping);
      }
    };

    const handleUserStatusChange = (data: {
      userId: string;
      isOnline: boolean;
    }) => {
      if (data.userId?.toString() === derivedReceiverId?.toString()) {
        setIsPeerOnline(data.isOnline);
      }
    };

    const handleCallResponseReceived = (data: {
      conversationId: string;
      accepted: boolean;
      responderId: string;
    }) => {
      if (data.conversationId?.toString() === matchId?.toString()) {
        if (!data.accepted) {
          alert("Call declined or user busy.");
        }
      }
    };

    socket.on("receive_message", handleIncomingMessage);
    socket.on("message_sent_confirm", handleSentConfirmation);
    socket.on("typing_status", handleTypingStatus);
    socket.on("user_status_change", handleUserStatusChange);
    socket.on("call_response_received", handleCallResponseReceived);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
      socket.off("message_sent_confirm", handleSentConfirmation);
      socket.off("typing_status", handleTypingStatus);
      socket.off("user_status_change", handleUserStatusChange);
      socket.off("call_response_received", handleCallResponseReceived);
    };
  }, [socket, matchId, queryClient, derivedReceiverId, currentUserId]);

  // Emits 'typing_start' and 'typing_stop' structures matching backend configuration exactly
  const handleLocalTypingStatusEmit = (typingState: boolean) => {
    if (!socket) return;

    const eventName = typingState ? "typing_start" : "typing_stop";
    socket.emit(eventName, {
      conversationId: matchId,
      receiverId: derivedReceiverId,
    });
  };

  // --- INTERACTIVE MESSAGE SUBMISSION HANDLERS ---
  const handleSendTextMessage = (text: string) => {
    if (!text.trim() || !socket) return;

    const formatTime = new Date().toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const optimisticId = `opt-${Date.now()}`;

    const localBubblePayload = {
      id: optimisticId,
      matchId,
      senderId: currentUserId,
      content: text,
      type: "text",
      time: formatTime,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [localBubblePayload, ...prev]);

    socket.emit("send_message", {
      conversationId: matchId,
      senderId: currentUserId,
      receiverId: derivedReceiverId,
      type: "text",
      content: text.trim(),
    });
  };

  const handleSendMediaMessage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const { uri, type } = result.assets[0];
      const mediaType = type === "video" ? "video" : "image";
      const optimisticId = `opt-${mediaType}-${Date.now()}`;

      const pendingMessage = {
        id: optimisticId,
        matchId,
        senderId: currentUserId,
        type: mediaType,
        content: uri,
        isUploading: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [pendingMessage, ...prev]);

      try {
        const secureCdnUrl = await messagesApi.uploadMedia(uri, mediaType);

        socket?.emit("send_message", {
          conversationId: matchId,
          senderId: currentUserId,
          receiverId: derivedReceiverId,
          type: mediaType,
          content: secureCdnUrl,
        });
      } catch (err) {
        console.error("Media upload failed", err);
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    }
  };

  const handleSendVoiceMessage = async (
    localAudioUri: string,
    durationStr: string,
  ) => {
    const optimisticId = `opt-voice-${Date.now()}`;

    const pendingMessage = {
      id: optimisticId,
      matchId,
      senderId: currentUserId,
      type: "voice_note",
      content: localAudioUri,
      mediaDuration: durationStr,
      isUploading: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [pendingMessage, ...prev]);

    try {
      const secureCdnUrl = await messagesApi.uploadMedia(localAudioUri, "raw");

      socket?.emit("send_message", {
        conversationId: matchId,
        senderId: currentUserId,
        receiverId: derivedReceiverId,
        type: "voice_note",
        content: secureCdnUrl,
        mediaDuration: parseFloat(durationStr) || 0,
      });

      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleApproveCallRoute = (type: "video" | "voice") => {
    if (!socket || !user) return;

    socket.emit("call_user", {
      conversationId: matchId,
      senderId: user.id,
      receiverId: derivedReceiverId,
      senderName: user.name || "A Peer",
      senderPhoto: user.photo || "",
    });

    navigation.navigate("VideoCall", {
      matchId: matchId,
      name: name,
    });
  };

  const renderMessageBubble = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const isMe = item.senderId?.toString() === currentUserId;
    const msgType = item.type || "text";

    let showDateHeader =
      index === messages.length - 1 ||
      getRelativeDateLabel(item.createdAt) !==
        getRelativeDateLabel(messages[index + 1]?.createdAt);

    const formattedTimestamp = new Date(item.createdAt).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      },
    );

    return (
      <View style={styles.bubbleContainerRow}>
        {showDateHeader && (
          <View style={styles.dateStickyHeaderView}>
            <Text style={styles.dateStickyHeaderText}>
              {getRelativeDateLabel(item.createdAt)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.bubbleWrapper,
            isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
          ]}
        >
          <View
            style={[
              styles.baseBubble,
              isMe ? styles.myBubbleBg : styles.theirBubbleBg,
            ]}
          >
            {msgType === "text" && (
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color: isMe
                      ? "white"
                      : theme.isLightTheme
                        ? "black"
                        : "white",
                  },
                ]}
              >
                {item.content || item.text}
              </Text>
            )}

            {msgType === "image" && (
              <TouchableOpacity
                onPress={() => setSelectedImage(item.content || item.mediaUrl)}
                activeOpacity={0.9}
              >
                <View style={styles.imageMediaContainer}>
                  <View style={styles.imageMediaFallback} />
                  <Text style={styles.mediaOverlayLabel}>View Photo</Text>
                </View>
              </TouchableOpacity>
            )}

            {msgType === "video" && (
              <TouchableOpacity
                onPress={() => setSelectedVideo(item.content || item.mediaUrl)}
                activeOpacity={0.8}
              >
                <View style={styles.videoMediaPreview}>
                  <Feather name="play-circle" size={32} color="#ffffff" />
                  <Text style={styles.videoDurationLabel}>Play Recording</Text>
                </View>
              </TouchableOpacity>
            )}

            {(msgType === "voice" || msgType === "voice_note") && (
              <VoiceRecordPlayer
                uri={item.content || item.mediaUrl}
                isMe={isMe}
                staticDuration={item.mediaDuration?.toString() || item.duration}
                isUploading={item.isUploading}
              />
            )}

            <Text
              style={[
                styles.bubbleTimestamp,
                isMe ? styles.myTimeColor : styles.theirTimeColor,
              ]}
            >
              {formattedTimestamp}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const activeUserContext = {
    id: matchId,
    isOnline: isPeerOnline,
    isTyping: isPeerTyping,
    profile: {
      name,
      photo: photo,
    },
  };

  if (isLoading) {
    return (
      <View style={styles.centerSyncContainer}>
        <ActivityIndicator size="large" color={theme.primary || "#ec4899"} />
        <Text style={styles.syncFeedbackLabel}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.chatViewportContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 20}
      >
        <ChatHeader
          user={activeUserContext}
          onBack={() => navigation.goBack()}
          onViewAvatar={(url) => setSelectedImage(url)}
          onViewProfile={(uid) => console.log(`[Nav] Profile View: ${uid}`)}
          onOpenMenu={() => setMenuVisible(true)}
          onVoiceCall={() => handleApproveCallRoute("voice")}
          onVideoCall={() => handleApproveCallRoute("video")}
        />

        <FlatList
          ref={flatListRef}
          inverted
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.messageListFeed}
          showsVerticalScrollIndicator={false}
        />

        <ChatBottom
          onSendMessage={handleSendTextMessage}
          onPickMedia={handleSendMediaMessage}
          onTriggerEmoji={(appendEmojiFn) => {
            setAppendEmojiCallback(() => appendEmojiFn);
            setEmojiVisible(true);
          }}
          onRecordVoice={() => setVoiceVisible(true)}
          onTypingStatusChange={handleLocalTypingStatusEmit}
        />

        <ChatMenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onClearChat={() => setMessages([])}
          onBlockUser={() => console.log("Block execution handled")}
        />
        <ImageViewerModal
          visible={!!selectedImage}
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
        <VideoPlayerModal
          visible={!!selectedVideo}
          videoUrl={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
        <EmojiModal
          visible={emojiVisible}
          onClose={() => setEmojiVisible(false)}
          onSelectEmoji={(emoji) => appendEmojiCallback?.(emoji)}
        />
        <VoiceRecordModal
          visible={voiceVisible}
          onClose={() => setVoiceVisible(false)}
          onSendVoice={handleSendVoiceMessage}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
