import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSocket } from "@/lib/context/socket-context";
import { useAuth } from "@/lib/context/auth-context";
import { useAudioPlayer } from "expo-audio";

export default function NotificationCallScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { socket } = useSocket();
  const { user } = useAuth();

  const ringtonePlayer = useAudioPlayer(
    require("../../../assets/audio/telephone-ring.mp3"),
  );

  const { conversationId, senderId, senderName, senderPhoto } =
    route.params || {};

  // Block Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => backHandler.remove();
  }, []);

  // Start ringtone
  useEffect(() => {
    if (!ringtonePlayer) return;

    try {
      ringtonePlayer.loop = true;
      ringtonePlayer.play();
    } catch (error) {
      console.log("[NotificationCall] Failed to play ringtone:", error);
    }

    return () => {
      try {
        ringtonePlayer.pause();
        ringtonePlayer.seekTo(0);
      } catch {}
    };
  }, [ringtonePlayer]);

  const stopRingtone = () => {
    try {
      ringtonePlayer.pause();
      ringtonePlayer.seekTo(0);
    } catch {}
  };

  const handleAccept = () => {
    console.log("[NotificationCall] Call Accepted");

    stopRingtone();

    if (socket && user) {
      socket.emit("call_response", {
        conversationId,
        senderId,
        receiverId: user.id,
        accepted: true,
      });
    }

    navigation.replace("VideoCall", {
      matchId: conversationId,
      name: senderName || "Video Call",
    });
  };

  const handleDecline = () => {
    console.log("[NotificationCall] Call Declined");

    stopRingtone();

    if (socket && user) {
      socket.emit("call_response", {
        conversationId,
        senderId,
        receiverId: user.id,
        accepted: false,
      });
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("MainTabs");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.incomingText}>INCOMING CALL</Text>

        <View style={styles.avatarPlaceholder}>
          {senderPhoto ? (
            <Image source={{ uri: senderPhoto }} style={styles.avatarImage} />
          ) : (
            <MaterialCommunityIcons name="account" size={60} color="#334155" />
          )}
        </View>

        <Text style={styles.callerName}>{senderName || "Unknown Caller"}</Text>

        <Text style={styles.callType}>Video Call</Text>
      </View>

      <View style={styles.actionControlsDeck}>
        <View style={styles.buttonsGlassControlRow}>
          <TouchableOpacity
            style={[
              styles.utilityControlCircle,
              styles.criticalEndCallActionPill,
            ]}
            onPress={handleDecline}
          >
            <MaterialCommunityIcons
              name="phone-hangup"
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.utilityControlCircle, styles.acceptButton]}
            onPress={handleAccept}
          >
            <MaterialCommunityIcons name="phone" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// keep your existing styles unchanged}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1D",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  headerArea: {
    alignItems: "center",
    marginTop: 80,
  },
  incomingText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  callerName: {
    color: "#F3F4F6",
    fontSize: 26,
    fontWeight: "700",
  },
  callType: {
    color: "#3B82F6",
    fontSize: 15,
    marginTop: 8,
    fontWeight: "500",
  },
  actionControlsDeck: {
    paddingBottom: 40,
  },
  buttonsGlassControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    marginHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  utilityControlCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  criticalEndCallActionPill: {
    backgroundColor: "#DC2626",
  },
});
