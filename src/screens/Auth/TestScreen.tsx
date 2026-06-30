import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

// Import from our new isolated test API
import { testApi } from "@/lib/api/test.api";
import { colors, borderRadius, spacing } from "../../lib/colors";

export default function TestScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    photos: [] as string[],
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setLoading(true);
      const data = await testApi.get();

      setFormData({
        name: data.name || "",
        photos: data.photos && data.photos.length > 0 ? [data.photos[0]] : [],
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to load current profile data");
      console.error("[TestScreen GET Error]", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Select a new image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // FIX: Use the new array syntax to remove the deprecation warning
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    console.log("uri: ", result);
    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        photos: [result.assets[0].uri],
      }));
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      await testApi.update({
        name: formData.name,
        photos: formData.photos,
      });

      Alert.alert("Success!", "Profile updated successfully on Render.");
    } catch (error: any) {
      // Adjusted catch block because 'fetch' throws standard JS Errors
      const errorMessage =
        error.message || "An unknown error occurred during update.";
      Alert.alert("Update Error", errorMessage);
      console.error("[TestScreen PATCH Error]", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary || "#000"} />
        <Text style={styles.loadingText}>Fetching Profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.headerTitle}>API Sandbox</Text>
        <Text style={styles.headerSubtitle}>Testing PATCH /profile</Text>

        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoSlot} onPress={pickImage}>
            {formData.photos[0] ? (
              <Image
                source={{ uri: formData.photos[0] }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons
                  name="camera"
                  size={32}
                  color={colors.textMuted || "#666"}
                />
                <Text style={styles.photoText}>Tap to add</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
          />
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send PATCH Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background || "#1a1a3e" },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 24, flex: 1, justifyContent: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text || "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textMuted || "#aaa",
    marginBottom: 32,
    textAlign: "center",
  },
  loadingText: { marginTop: 12, color: colors.text || "#fff", fontSize: 16 },
  photoContainer: { alignItems: "center", marginBottom: 32 },
  photoSlot: {
    width: 120,
    height: 160,
    borderRadius: borderRadius?.lg || 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { alignItems: "center" },
  photoText: { color: colors.textMuted || "#666", marginTop: 8, fontSize: 12 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 14,
    color: colors.text || "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius?.md || 12,
    padding: 16,
    color: colors.text || "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary || "#4A90E2",
    padding: 16,
    borderRadius: borderRadius?.md || 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
