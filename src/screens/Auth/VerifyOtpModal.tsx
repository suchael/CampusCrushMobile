import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../../lib/colors";
import { authApi } from "@/lib/api/auth.api";

interface VerifyOtpModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function VerifyOtpModal({
  visible,
  email,
  onClose,
  onSuccess,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    const formattedOtp = otp.trim();
    if (formattedOtp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the complete 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const responseData = await authApi.verifyEmail(email, formattedOtp);
      onSuccess(responseData);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.data?.message ||
        error.message ||
        "Verification failed. Please try again.";
      Alert.alert("Verification Error", errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await authApi.sendOtp(email);
      Alert.alert("Code Resent", "A fresh 6-digit verification code was dispatched.");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend code.";
      Alert.alert("Error", errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* 1. KeyboardAvoidingView wraps the entire content space.
        Using 'padding' on iOS and 'height' or undefined on Android guarantees clean shifting inside Modals.
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidWrapper}
      >
        {/* Dismiss keyboard if user clicks background area safely */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentCard}>
              
              {/* Close Trigger Button Header */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.iconWrapper}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
              </View>

              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <Text style={styles.modalSubtitle}>
                We sent a 6-digit verification token code sequence to:
              </Text>
              <Text style={styles.emailHighlight}>{email}</Text>

              {/* OTP Unified Layout Field Input Group */}
              <View style={styles.otpInputGroup}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.otpInputText}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.textMuted}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus={true}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* CTA Execution Submission Button */}
              <TouchableOpacity
                style={[styles.actionButton, verifying && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={verifying}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.gradientButton}
                >
                  {verifying ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Text style={styles.buttonText}>Verify Code</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Resend Operations Action Group */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
                  {resending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidWrapper: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 26, 0.85)", // Deep darkened background overlay filter
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContentCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface || "#1e1e38",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border || "rgba(255,255,255,0.1)",
    padding: spacing.xl,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  closeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
    zIndex: 5,
  },
  iconWrapper: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  otpInputGroup: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    padding: spacing.md,
  },
  otpInputText: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    padding: spacing.md,
    paddingLeft: 0,
    letterSpacing: 2,
  },
  actionButton: {
    width: "100%",
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  gradientButton: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});