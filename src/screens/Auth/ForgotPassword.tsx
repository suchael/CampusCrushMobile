import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/AppNavigator";
import { colors } from "../../lib/colors";
import { styles } from "./ForgotPassword.styles";
import { authApi } from "@/lib/api/auth.api"; // ✅ Updated to correct import path

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const otpRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, step]);

  const progressWidth =
    step === 1 ? "33%" : step === 2 ? "66%" : step === 3 ? "100%" : "100%";

  // ✅ Step 1: Real API integration to request an OTP code
  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const resp = await authApi.sendOtp(email.trim().toLowerCase());
      // Convert minutes directly to total seconds
      const totalSeconds = Math.floor(resp.expiresAt_in_minutes * 60);

      setStep(2);
      setCountdown(totalSeconds); // State is now 300 instead of 300000
      Alert.alert(
        "OTP Sent",
        "Verification code sent successfully to your email.",
      );
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send OTP code. Please try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Step 2: Validates length structural input constraints locally
  const handleVerifyOtp = () => {
    const code = otp.join("");

    if (code.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }

    // Move forward directly into password configuration view state
    setStep(3);
  };

  // ✅ Step 3: Trigger structural mutation payload across endpoints
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("Password Required", "Enter your new password.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak Password", "Password should be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const code = otp.join("");
      await authApi.resetPassword(
        email.trim().toLowerCase(),
        code,
        newPassword,
      );
      setStep(4);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to reset password. The code might be invalid or expired.";
      Alert.alert("Reset Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2 Resend: Request another transaction dispatch via API
  const resendOtp = async () => {
    setLoading(true);
    try {
      const resp = await authApi.sendOtp(email.trim().toLowerCase());
      // Convert minutes directly to total seconds
      const totalSeconds = Math.floor(resp.expiresAt_in_minutes * 60);

      setCountdown(totalSeconds); // State is now 300 instead of 300000

      Alert.alert("OTP Resent", "A new verification code has been sent.");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to resend code. Please try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.iconWrapper}>
              <Ionicons name="mail-outline" size={42} color={colors.primary} />
            </View>

            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendOtp}
              disabled={loading} // ✅ Freezes interaction on transaction process
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="white" />
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      case 2:
        const mins = Math.floor(countdown / 60);
        const secs = countdown % 60;

        const formattedMinutes = mins < 10 ? `0${mins}` : mins;
        const formattedSeconds = secs < 10 ? `0${secs}` : secs;
        return (
          <>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.emailText}>{email}</Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="numeric"
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  editable={!loading}
                />
              ))}
            </View>

            <Text style={styles.timer}>
              {formattedMinutes}:{formattedSeconds}
            </Text>

            {countdown === 0 && (
              <TouchableOpacity onPress={resendOtp} disabled={loading}>
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={{ marginBottom: 15 }}
                  />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerifyOtp}
              disabled={loading} // ✅ Freezes interface during setup state checks
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Verify Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Choose a strong password for your account.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 8 characters)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleResetPassword}
              disabled={loading} // ✅ Freezes interaction during password resets
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" /> // ✅ Added missing activity loader to reset button
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      case 4:
        return (
          <>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={60} color="white" />
            </View>

            <Text style={styles.title}>Password Updated</Text>
            <Text style={styles.subtitle}>
              Your password has been reset successfully.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={[colors.success, "#16a34a"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Back To Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, "#1a1a3e"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step !== 4 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.goBack();
                }
              }}
              disabled={loading} // ✅ Disables backtracking when a transaction is ongoing
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {step !== 4 && (
            <>
              <Text style={styles.stepLabel}>Step {step} of 3</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
            </>
          )}

          <View style={styles.content}>{renderStepContent()}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
