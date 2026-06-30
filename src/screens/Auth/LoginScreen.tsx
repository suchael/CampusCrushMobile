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
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { colors, spacing, borderRadius } from "../../lib/colors";
import { useAuth } from "../../lib/context/auth-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
    } catch (error: any) {
      const serverErrorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Something went wrong";

      Alert.alert("Login Failed", serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <LinearGradient
      colors={[colors.background, "#1a1a3e"]}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="heart"
                  size={42}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.title}>Campus Crush</Text>

              <Text style={styles.subtitle}>
                Welcome back! Sign in to continue
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>
                  Email Address
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
                    placeholder="College email (.edu)"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>
                  Password
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
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />

                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.buttonDisabled,
                ]}
                disabled={loading}
                onPress={handleLogin}
              >
                <LinearGradient
                  colors={[
                    colors.primary,
                    colors.primaryDark,
                  ]}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator
                      color="white"
                      size="small"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="white"
                      />

                      <Text style={styles.buttonText}>
                        Sign In
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Register")
                }
              >
                <Text style={styles.footerLink}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 50,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: spacing.lg,
    zIndex: 100,
    backgroundColor: colors.surface,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  form: {
    gap: spacing.md,
  },

  fieldGroup: {
    gap: spacing.xs,
  },

  inputLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  inputIcon: {
    paddingHorizontal: spacing.md,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 16,
  },

  eyeIcon: {
    paddingHorizontal: spacing.md,
  },

  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: -4,
  },

  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },

  loginButton: {
    overflow: "hidden",
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  gradientButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
    gap: 5,
  },

  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  footerLink: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});