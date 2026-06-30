import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./Video.CallScreen.styles";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}) => {
  return (
    <SafeAreaView style={styles.actionControlsDeckDeck} edges={["bottom"]}>
      <View style={styles.buttonsGlassControlRow}>
        {/* AUDIO MUTE TOGGLE */}
        <TouchableOpacity
          onPress={onToggleMute}
          style={[
            styles.utilityControlCircle,
            isMuted && styles.activeHardwareDisabledAlertState,
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isMuted ? "microphone-off" : "microphone"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* TELEPHONY DISCONNECT PILL TERMINAL */}
        <TouchableOpacity
          onPress={onEndCall}
          style={styles.criticalEndCallActionPill}
          activeOpacity={0.6}
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* VIDEO ENGINES DISABLER TOGGLE */}
        <TouchableOpacity
          onPress={onToggleCamera}
          style={[
            styles.utilityControlCircle,
            isCameraOff && styles.activeHardwareDisabledAlertState,
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isCameraOff ? "camera-off" : "camera"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};