import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { colors, spacing, borderRadius } from "../../../lib/colors";

interface VoiceRecordPlayerProps {
  uri: string;
  isMe: boolean;
  staticDuration?: string;
  isUploading?: boolean;
}

export default function VoiceRecordPlayer({ uri, isMe, staticDuration, isUploading }: VoiceRecordPlayerProps) {
  const player = useAudioPlayer(uri ? { uri } : null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [internalReady, setInternalReady] = useState(false);

  const isLoading = isUploading || !internalReady;

  // Polling mechanism to check readiness without relying on disallowed event listeners
  useEffect(() => {
    if (!player || internalReady) return;

    const pollInterval = setInterval(() => {
      if (player.duration > 0 ) {
        setDuration(player.duration);
        setInternalReady(true);
        clearInterval(pollInterval);
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [player, internalReady]);

  // Playback progress tracking
  useEffect(() => {
    let tickTracker: NodeJS.Timeout;
    if (player && isPlaying) {
      tickTracker = setInterval(() => {
        const current = player.currentTime;
        const total = player.duration || duration;

        setCurrentTime(current);

        if (total > 0 && current >= total - 0.15) {
          setIsPlaying(false);
          setCurrentTime(0);
          player.pause();
          player.seekTo(0);
          clearInterval(tickTracker);
        }
      }, 100);
    }
    return () => clearInterval(tickTracker);
  }, [player, isPlaying, duration]);

  const togglePlayback = async () => {
    if (!player || isLoading) return;

    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      if (player.currentTime >= (player.duration || 0) - 0.2) {
        player.seekTo(0);
      }
      player.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secondsNum: number) => {
    if (!secondsNum || isNaN(secondsNum)) return "0:00";
    const mins = Math.floor(secondsNum / 60);
    const secs = Math.floor(secondsNum % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.playerContainer, isMe ? styles.wrapperMe : styles.wrapperThem]}>
      <TouchableOpacity 
        onPress={togglePlayback} 
        activeOpacity={0.75} 
        disabled={isLoading}
        style={[styles.playControlCircle, isMe ? styles.btnMe : styles.btnThem]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isMe ? "#ffffff" : colors.pink || "#ec4899"} />
        ) : (
          <Feather 
            name={isPlaying ? "pause" : "play"} 
            size={14} 
            color={isMe ? "#ffffff" : colors.pink || "#ec4899"} 
            style={!isPlaying && styles.playIconOffset}
          />
        )}
      </TouchableOpacity>
      
      <View style={styles.timelineFlexCarrier}>
        <View style={styles.trackTimelineContainer}>
          <View style={[styles.staticTrackBackground, isMe ? styles.trackMeBg : styles.trackThemBg]} />
          <View 
            style={[
              styles.filledProgressMask, 
              { width: `${progressPercent}%` },
              isMe ? styles.fillMe : styles.fillThem
            ]} 
          />
          {!isLoading && progressPercent > 0 && (
            <View 
              style={[
                styles.timelineThumbIndicator, 
                { left: `${progressPercent}%` },
                isMe ? styles.thumbMe : styles.thumbThem
              ]} 
            />
          )}
        </View>

        <Text style={[styles.durationText, isMe ? styles.txtMe : styles.txtThem]}>
          {isLoading 
            ? (isUploading ? "Uploading..." : (staticDuration || "--:--")) 
            : formatTime(isPlaying ? currentTime : duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    width: 210,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.md || 12,
    paddingHorizontal: spacing.sm || 10,
    gap: 10,
  },
  wrapperMe: { backgroundColor: "rgba(255, 255, 255, 0.06)" },
  wrapperThem: { backgroundColor: "#171926", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.03)" },
  playControlCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  btnMe: { backgroundColor: "rgba(255, 255, 255, 0.12)" },
  btnThem: { backgroundColor: "rgba(255, 112, 162, 0.08)" },
  playIconOffset: { marginLeft: 1.5 },
  timelineFlexCarrier: { flex: 1, height: "100%", justifyContent: "center", gap: 2, paddingTop: 2 },
  trackTimelineContainer: { width: "100%", height: 10, position: "relative", justifyContent: "center" },
  staticTrackBackground: { position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2 },
  trackMeBg: { backgroundColor: "rgba(255, 255, 255, 0.2)" },
  trackThemBg: { backgroundColor: "rgba(255, 255, 255, 0.06)" },
  filledProgressMask: { position: "absolute", left: 0, height: 4, borderRadius: 2 },
  fillMe: { backgroundColor: "#ffffff" },
  fillThem: { backgroundColor: colors.pink || "#ec4899" },
  timelineThumbIndicator: { position: "absolute", width: 8, height: 8, borderRadius: 4, marginLeft: -4, backgroundColor: "#ffffff" },
  thumbMe: { backgroundColor: "#ffffff" },
  thumbThem: { backgroundColor: colors.pink || "#ec4899" },
  durationText: { fontSize: 9, fontWeight: "600", fontVariant: ["tabular-nums"] },
  txtMe: { color: "rgba(255, 255, 255, 0.5)" },
  txtThem: { color: "#64748b" },
});