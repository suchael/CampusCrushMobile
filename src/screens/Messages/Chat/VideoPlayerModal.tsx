import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Feather } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../../lib/colors";

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export default function VideoPlayerModal({
  visible,
  videoUrl,
  onClose,
}: VideoPlayerModalProps) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize native expo-video instance with auto-play configurations
  const player = useVideoPlayer(videoUrl || "", (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.play();
  });

  // Reset tracking states when the media modal mounts or shifts targets
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setErrorMessage(null);
    }
  }, [videoUrl, visible]);

  // Sync core initialization statuses and structural failure modes
  useEffect(() => {
    if (!player || !videoUrl || !visible) return;

    if (player.status === "readyToPlay") {
      setLoading(false);
    } else if (player.status === "error") {
      setLoading(false);
      setErrorMessage("An error occurred while loading this video.");
    }

    const statusListener = player.addListener("statusChange", (event) => {
      if (event.status === "readyToPlay") {
        setErrorMessage(null);
        setLoading(false);
      } else if (event.status === "error") {
        setLoading(false);
        setErrorMessage("An error occurred while loading this video.");
      } else {
        setLoading(true);
      }
    });

    return () => {
      statusListener.remove();
    };
  }, [player, videoUrl, visible]);

  const handleClose = () => {
    if (player) {
      player.pause();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible && !!videoUrl}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Top Close Header Layer - Kept to ensure users can exit the modal container */}
        <View style={styles.topHeaderDeck}>
          <TouchableOpacity
            style={styles.closeOverlayButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {videoUrl && player && (
          <View style={styles.videoCardContainer}>
            {!errorMessage && (
              <VideoView
                style={styles.nativeVideoElement}
                player={player}
                fullscreenOptions={{ enable: true }}
                allowsPictureInPicture
                nativeControls={true} // 👈 Native OS scrubbers, timers, and toggles enabled here
              />
            )}

            {/* Error Message Dashboard View Fallback */}
            {errorMessage && (
              <View style={styles.errorContainerView}>
                <Feather name="alert-circle" size={44} color="#f43f5e" />
                <Text style={styles.errorMainTitleText}>Video Playback Failed</Text>
                <Text style={styles.errorSubSubtitleText}>{errorMessage}</Text>
              </View>
            )}

            {/* Loading Spinner Indicator */}
            {loading && !errorMessage && (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoCardContainer: {
    width: width,
    height: height,
    position: "absolute",
    zIndex: 1,
  },
  nativeVideoElement: {
    width: "100%",
    height: "100%",
  },
  loadingWrapper: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  topHeaderDeck: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10, // Sits above native video engine context frames
  },
  closeOverlayButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: spacing.sm || 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  errorContainerView: {
    alignSelf: "center",
    marginTop: height * 0.3,
    paddingHorizontal: spacing.xl || 24,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#131520",
    width: width * 0.85,
    paddingVertical: spacing.xl || 24,
    borderRadius: borderRadius.md || 12,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.2)",
    zIndex: 10,
  },
  errorMainTitleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.sm || 8,
    marginBottom: spacing.xs || 4,
  },
  errorSubSubtitleText: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});