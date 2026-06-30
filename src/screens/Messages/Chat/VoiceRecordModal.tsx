import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Easing,
} from "react-native";
import { colors, spacing, borderRadius } from "../../../lib/colors";
import { Feather } from "@expo/vector-icons";
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import { useTheme } from "@/lib/context/theme-context";

interface VoiceRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSendVoice: (uri: string, durationStr: string) => void;
}

export default function VoiceRecordModal({
  visible,
  onClose,
  onSendVoice,
}: VoiceRecordModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // --- HARDWARE ENGINES ---
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const player = useAudioPlayer(recordedUri ? { uri: recordedUri } : null);

  // --- STATE CONTROLS ---
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // --- REFS & ANIMATIONS ---
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false); // Track unmount lifecycle to prevent calling released players

  // --- LIFECYCLE INITIALIZATION ---
  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      (async () => {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert(
            "Permission Denied",
            "Microphone access is required to capture voice notes.",
          );
          onClose();
          return;
        }
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
        startRecording();
      })();
    }
    return () => {
      isClosingRef.current = true;
      resetHardwareState();
    };
  }, [visible]);

  // --- TIMERS & PULSING WAVE EFFECT ENGINE ---
  useEffect(() => {
    if (visible && !isPaused && !isSaving && !recordedUri) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(450),
            Animated.timing(waveAnim2, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      waveAnim1.stopAnimation();
      waveAnim2.stopAnimation();
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, visible, isSaving, recordedUri]);

  // --- PREVIEW MONITORING ---
  useEffect(() => {
    let previewInterval: ReturnType<typeof setInterval>;
    if (player && isPreviewPlaying) {
      previewInterval = setInterval(() => {
        if (isClosingRef.current) return;

        try {
          setPreviewTime(player.currentTime);
          if (player.duration && previewDuration === 0) {
            setPreviewDuration(player.duration);
          }
          if (
            player.currentTime >=
            (player.duration || previewDuration) - 0.1
          ) {
            setIsPreviewPlaying(false);
            setPreviewTime(0);
            player.pause();
            player.seekTo(0);
          }
        } catch (e) {
          console.warn("Interval access on released player skipped safely.");
        }
      }, 100);
    }
    return () => clearInterval(previewInterval);
  }, [player, isPreviewPlaying, previewDuration]);

  // --- INTERACTION HANDLING ENGINE ---
  const startRecording = async () => {
    try {
      setRecordedUri(null);
      setSeconds(0);
      setIsPaused(false);
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not initialize hardware recorder.");
      onClose();
    }
  };

  const togglePauseResumeRecording = () => {
    if (isSaving) return;
    if (!isPaused) {
      recorder.pause();
      setIsPaused(true);
    } else {
      recorder.record();
      setIsPaused(false);
    }
  };

  const stopAndMoveToPreview = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      setIsSaving(true);
      await recorder.stop();
      if (recorder.uri) {
        setRecordedUri(recorder.uri);
      } else {
        Alert.alert("Error", "Could not resolve audio path resource.");
        startRecording();
      }
    } catch (err) {
      console.error("Stop error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreviewPlayback = () => {
    if (!player || isClosingRef.current) return;
    try {
      if (player.playing) {
        player.pause();
        setIsPreviewPlaying(false);
      } else {
        if (player.currentTime >= player.duration - 0.2) {
          player.seekTo(0);
        }
        player.play();
        setIsPreviewPlaying(true);
      }
    } catch (e) {
      console.error("Error managing playback on closing component", e);
    }
  };

  const handleDiscard = () => {
    try {
      if (player && !isClosingRef.current) {
        player.pause();
        player.seekTo(0);
      }
    } catch (e) {}
    setIsPreviewPlaying(false);
    setPreviewTime(0);
    setPreviewDuration(0);
    startRecording();
  };

  const resetHardwareState = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // SAFELY check if the context is unmounting before addressing the native module player
    if (!isClosingRef.current && player) {
      try {
        player.pause();
        player.seekTo(0);
      } catch (e) {
        /* Catch implicit shared object releases safely */
      }
    }
    waveAnim1.setValue(0);
    waveAnim2.setValue(0);
  };

  const handleCancelModal = async () => {
    resetHardwareState();
    try {
      if (recorderState.isRecording || isPaused) {
        await recorder.stop();
      }
    } catch (e) {
      /* silent clean */
    }
    onClose();
  };

  const handleFinalSend = () => {
    if (!recordedUri) return;
    isClosingRef.current = true; // Signal immediately to cease local player side-effects
    const finalDurationStr = formatTime(seconds === 0 ? 1 : seconds);

    onSendVoice(recordedUri, finalDurationStr);
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // --- STYLE ANCHOR SCHEMES ---
  const waveScale1 = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });
  const waveOpacity1 = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });
  const waveScale2 = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.1],
  });
  const waveOpacity2 = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  const progressPercent =
    previewDuration > 0 ? (previewTime / previewDuration) * 100 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancelModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!recordedUri ? (
            /* ACTIVE / PAUSED CAPTURED MODE LAYOUT */
            <>
              <View style={styles.micLayoutContainer}>
                {!isPaused && !isSaving && (
                  <>
                    <Animated.View
                      style={[
                        styles.pulseRing,
                        {
                          transform: [{ scale: waveScale1 }],
                          opacity: waveOpacity1,
                        },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.pulseRing,
                        {
                          transform: [{ scale: waveScale2 }],
                          opacity: waveOpacity2,
                        },
                      ]}
                    />
                  </>
                )}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={togglePauseResumeRecording}
                  disabled={isSaving}
                  style={[
                    styles.pulseIndicator,
                    isPaused && styles.pausedIndicatorBg,
                  ]}
                >
                  <Feather
                    name={isPaused ? "mic" : "pause"}
                    size={26}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.timerText}>{formatTime(seconds)}</Text>
              <Text style={styles.hint}>
                {isSaving
                  ? "Processing session track..."
                  : isPaused
                    ? "Recording paused. Tap mic to resume."
                    : "Recording voice note..."}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.textActionBtn}
                  onPress={handleCancelModal}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                {seconds > 0 && (
                  <TouchableOpacity
                    style={styles.stopActionBtn}
                    onPress={stopAndMoveToPreview}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Feather name="square" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            /* LIVE REWIND / PREVIEW MODE LAYOUT */
            <>
              <View style={styles.previewContainer}>
                <View style={styles.previewHeaderRow}>
                  <Text style={styles.previewTitle}>Review Voice Note</Text>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={handleDiscard}
                  >
                    <Feather name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.playerCardRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={togglePreviewPlayback}
                    style={styles.playerPlayCircle}
                  >
                    <Feather
                      name={isPreviewPlaying ? "pause" : "play"}
                      size={16}
                      color="#ffffff"
                      style={!isPreviewPlaying && { marginLeft: 2 }}
                    />
                  </TouchableOpacity>

                  <View style={styles.timelineTrackContainer}>
                    <View style={styles.timelineTrackBg} />
                    <View
                      style={[
                        styles.timelineTrackFill,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.previewTimerText}>
                    {isPreviewPlaying
                      ? formatTime(previewTime)
                      : formatTime(seconds)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.textActionBtn}
                  onPress={handleCancelModal}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={handleFinalSend}
                >
                  <Feather name="send" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    card: {
      width: "100%",
      backgroundColor: theme.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
    },
    micLayoutContainer: {
      width: 160,
      height: 160,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    pulseIndicator: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary || "#ec4899",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 5,
      elevation: 4,
    },
    pausedIndicatorBg: {
      backgroundColor: "#475569",
    },
    pulseRing: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary || "#ec4899",
      zIndex: 1,
    },
    timerText: {
      fontSize: 32,
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: spacing.xs,
      fontVariant: ["tabular-nums"],
    },
    hint: {
      color: theme.text || "#64748b",
      fontSize: 14,
      marginBottom: spacing.xl,
      textAlign: "center",
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      marginTop: spacing.md,
    },
    textActionBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    cancelText: {
      color: "#94a3b8",
      fontSize: 15,
      fontWeight: "600",
    },
    stopActionBtn: {
      backgroundColor: "#ef4444",
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
    },
    sendBtn: {
      backgroundColor: theme.primary || "#ec4899",
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    previewContainer: {
      width: "100%",
      paddingVertical: spacing.sm,
      marginBottom: spacing.lg,
    },
    previewHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    trashBtn: {
      padding: spacing.xs,
    },
    playerCardRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      gap: 10,
    },
    playerPlayCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.primary || "#ec4899",
      justifyContent: "center",
      alignItems: "center",
    },
    timelineTrackContainer: {
      flex: 1,
      height: 12,
      justifyContent: "center",
      position: "relative",
    },
    timelineTrackBg: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 2,
    },
    timelineTrackFill: {
      position: "absolute",
      left: 0,
      height: 4,
      backgroundColor: theme.primary || "#ec4899",
      borderRadius: 2,
    },
    previewTimerText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#94a3b8",
      minWidth: 34,
      textAlign: "right",
      fontVariant: ["tabular-nums"],
    },
  });
