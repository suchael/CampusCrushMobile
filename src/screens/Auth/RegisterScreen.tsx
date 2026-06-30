import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { colors, spacing, borderRadius } from "../../lib/colors";
import { useAuth } from "../../lib/context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import Terms from "@/utils/Terms";
import { APP_DETAILS } from "@/utils/constant";
import VerifyOtpModal from "./VerifyOtpModal";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
};

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, authenticateSession } = useAuth();

  const [hasAccepted, setHasAccepted] = useState(false);
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.endsWith(".edu")) {
      Alert.alert("Error", "Please use a valid .edu email address");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!hasAccepted) {
      Alert.alert(
        "Agreement Required",
        "Please read and accept the Terms of Service & Privacy Guidelines to continue.",
      );
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      // Backend registration hit succeeded, safely reveal verification modal view layout
      setIsVerifyModalVisible(true);
    } catch (error: any) {
      const serverErrorMessage =
        error.response?.data?.message ||
        error.data?.message || 
        error.message ||
        "Something went wrong";

      Alert.alert("Registration Error", serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async (authData: any) => {
    setIsVerifyModalVisible(false);
    try {
      // Expecting authData context format: { token: string, user: User } or flat properties
      const token = authData.token;
      const userPayload = authData.user || authData;

      await authenticateSession(token, userPayload);
      Alert.alert("Success", "Account verified successfully!");
    } catch (err) {
      Alert.alert("Session Error", "Could not initialize secure local application runtime session.");
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, "#1a1a3e"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <Ionicons name="heart" size={40} color={colors.primary} />
              <Text style={styles.title}>{APP_DETAILS.name}</Text>
              <Text style={styles.subtitle}>Create your account</Text>
              <Text style={styles.description}>
                Join students across US & Canada colleges
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="College email (.edu)"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Password</Text>
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
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Terms
                isChecked={hasAccepted}
                onCheckedChange={setHasAccepted}
                url={APP_DETAILS.terms}
                prefixText="By continuing, you acknowledge our "
                linkText="Terms of Service & Privacy Guidelines"
              />

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (loading || !hasAccepted) && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VerifyOtpModal
        visible={isVerifyModalVisible}
        email={email.toLowerCase().trim()}
        onClose={() => setIsVerifyModalVisible(false)}
        onSuccess={handleVerificationSuccess}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  backButton: { position: "absolute", top: 30, left: spacing.lg, zIndex: 10 },
  content: { flex: 1, padding: spacing.lg, justifyContent: "center", paddingTop: 20 },
  header: { alignItems: "center", marginBottom: spacing.xxl },
  title: { fontSize: 28, fontWeight: "bold", color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: 18, fontWeight: "600", color: colors.text, marginTop: spacing.xs },
  description: { fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  form: { gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  inputLabel: { fontSize: 14, fontWeight: "500", color: colors.text, paddingLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  inputIcon: { padding: spacing.md },
  input: { flex: 1, color: colors.text, fontSize: 16, padding: spacing.md, paddingLeft: 0 },
  eyeIcon: { padding: spacing.md },
  registerButton: { borderRadius: borderRadius.md, overflow: "hidden", marginTop: spacing.md },
  buttonDisabled: { opacity: 0.6 },
  gradientButton: { padding: spacing.md, alignItems: "center", justifyContent: "center", minHeight: 54 },
  buttonText: { color: colors.text, fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: "600" },
});