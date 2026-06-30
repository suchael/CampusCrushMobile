import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RTCView } from "react-native-webrtc";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./Video.CallScreen.styles";

interface RemoteVideoProps {
  stream: any;
  status: string;
  roomId: string;
}

export const RemoteVideoView: React.FC<RemoteVideoProps> = ({ stream, status, roomId }) => {
  return (
    <View style={styles.remoteViewportContainer}>
      {stream ? (
        <RTCView
          key={`remote-${stream.id}`}
          streamURL={stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          zOrder={0} // Forces remote view to the background
        />
      ) : (
        <View style={styles.remotePlaceholderContainer}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={64} color="#6B7280" />
          </View>
          <Text style={styles.placeholderStatusText}>{status}</Text>
          <Text style={styles.roomLabelText}>Room ID: {roomId}</Text>
        </View>
      )}
    </View>
  );
};

interface LocalVideoProps {
  stream: any;
  isCameraOff: boolean;
}

export const LocalVideoView: React.FC<LocalVideoProps> = ({ stream, isCameraOff }) => {
  return (
    <View style={styles.localPipContainer} pointerEvents="none">
      {!isCameraOff && stream ? (
        <RTCView
          key={`local-${stream.id}`}
          streamURL={stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror={true}
          zOrder={1} // Forces local view to float on top
        />
      ) : (
        <View style={styles.localCameraOffPlaceholder}>
          <MaterialCommunityIcons name="camera-off" size={24} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
};