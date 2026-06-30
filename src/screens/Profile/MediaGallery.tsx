import React, { useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, borderRadius } from "@/lib/colors";
import ImageViewerModal from "../Messages/ImageViewerModal";

interface MediaGalleryProps {
  photos: string[];
  userName: string;
  isEditing: boolean;
  onUpdatePhotos: (photos: string[]) => void;
}

export default function MediaGallery({ photos, userName, isEditing, onUpdatePhotos }: MediaGalleryProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedViewerUrl, setSelectedViewerUrl] = useState("");

  const defaultImagePlaceholder = "";
  const featuredImage = photos[0] || defaultImagePlaceholder;
  const gridPhotos = photos.slice(1);

  const handleAddImage = async () => {
    if (photos.length >= 6) {
      Alert.alert("Gallery Full", "You can upload a maximum of 6 images.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Allow camera access to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onUpdatePhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onUpdatePhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  const handleImagePress = (url: string) => {
    if (!isEditing && url) {
      setSelectedViewerUrl(url);
      setViewerVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Featured Primary Identity Showcase Card */}
      <TouchableOpacity 
        style={styles.featuredFrame} 
        activeOpacity={isEditing ? 1 : 0.9}
        onPress={() => handleImagePress(photos[0])}
      >
        <Image source={{ uri: featuredImage }} style={styles.featuredImage} />
        
        {/* Soft Cinematographic Bottom Mask Overlay */}
        <View style={styles.featuredGradientOverlay}>
          <Text style={styles.userNameOverlay}>{userName || "Set Name"}</Text>
          <View style={styles.primaryBadge}>
            <Ionicons name="star" size={10} color={colors.primary || "#7C3AED"} />
            <Text style={styles.primaryBadgeText}>PRIMARY DISPLAY</Text>
          </View>
        </View>

        {isEditing && photos.length > 0 && (
          <TouchableOpacity 
            style={styles.removeMainTrigger} 
            onPress={() => handleRemoveImage(0)}
            activeOpacity={0.8}
          >
            <Ionicons name="close-sharp" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Grid Header Label Layout */}
      <View style={styles.gridMetaRow}>
        <Text style={styles.gridSectionLabel}>Supporting Media</Text>
        <Text style={styles.gridCounterText}>{photos.length}/6 slots filled</Text>
      </View>

      {/* High-Fidelity Secondary Assets Grid */}
      <View style={styles.photoGrid}>
        {gridPhotos.map((photoUri, relativeIdx) => {
          const absoluteIdx = relativeIdx + 1;
          return (
            <TouchableOpacity
              key={`${photoUri}-${absoluteIdx}`}
              style={styles.gridItemContainer}
              activeOpacity={isEditing ? 1 : 0.8}
              onPress={() => handleImagePress(photoUri)}
            >
              <Image source={{ uri: photoUri }} style={styles.gridPhoto} />
              {isEditing && (
                <TouchableOpacity 
                  style={styles.removeGridTrigger} 
                  onPress={() => handleRemoveImage(absoluteIdx)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-sharp" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Modern Glassmorphic Dashed Slot Upload Trigger */}
        {photos.length < 6 && isEditing && (
          <TouchableOpacity style={styles.addMediaSlot} onPress={handleAddImage} activeOpacity={0.7}>
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={20} color={colors.primary || "#7C3AED"} />
            </View>
            <Text style={styles.addSlotText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <ImageViewerModal 
        visible={viewerVisible} 
        imageUrl={selectedViewerUrl} 
        onClose={() => setViewerVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl || 24,
  },
  featuredFrame: {
    width: "100%",
    aspectRatio: 0.85, // Premium tall aspect structure for clear framing
    borderRadius: borderRadius.xl || 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#121224",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.8,
    borderColor: colors.border,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredGradientOverlay: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    padding: spacing.md,
    // Multi-stop background tint projection mimics premium CSS layouts
    backgroundColor: "rgba(6, 6, 15, 0.85)",
    paddingTop: 10,
  },
  userNameOverlay: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm || 6,
    marginTop: spacing.xs || 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: "#E2E2E9",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  removeMainTrigger: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255, 75, 75, 0.9)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gridMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  gridSectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#62627A",
    textTransform: "uppercase",
    letterSpacing: 1.0,
  },
  gridCounterText: {
    fontSize: 12,
    color: "#8E8E9F",
    fontWeight: "600",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItemContainer: {
    position: "relative",
    width: "31.1%",
    aspectRatio: 0.78, // Matching portrait ratio downscaling flawlessly
    borderRadius: borderRadius.lg || 16,
    backgroundColor: "#121224",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.8,
    borderColor: colors.border,
  },
  gridPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.lg || 16,
    resizeMode: "cover",
  },
  removeGridTrigger: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4B4B",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#06060F", // Blends target lines seamlessly into the deep backdrop canvas
  },
  addMediaSlot: {
    width: "31.1%",
    aspectRatio: 0.78,
    borderRadius: borderRadius.lg || 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1.5,
    borderColor: "rgba(124, 58, 237, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  addSlotText: {
    fontSize: 11,
    color: colors.primary || "#7C3AED",
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});