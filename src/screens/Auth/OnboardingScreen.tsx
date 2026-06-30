import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "../../navigation/AppNavigator";
import { colors, } from "../../lib/colors";
import AgePickerModal from "@/utils/AgePickerModal";
import SearchSelectionModal from "@/utils/SearchSelectionModal"; // New lookup modal import
import { useAuth } from "@/lib/context/auth-context";
import { profileApi } from "@/lib/api/profile.api";
import {
  GENDER_OPTIONS,
  RELATIONSHIP_GOALS,
  YEAR_OPTIONS,
} from "@/utils/constant";
import InterestBtnModal from "@/utils/InterestBtnModal";
import ClearData from "@/utils/ClearData";
import { styles } from "./OnboardingScreen.styles";


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Onboarding">;
};

export default function OnboardingScreen({ navigation }: Props) {
  const { refresh, user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false); // College modal control visibility state
  const [isMajorModalOpen, setIsMajorModalOpen] = useState(false); // Major modal control visibility state

  const [formData, setFormData] = useState({
    name: "",
    age: null as number | null,
    college: "",
    major: "",
    year: "",
    bio: "",
    genderIdentity: "",
    relationshipGoal: "",
    photos: [] as string[],
    interests: [] as string[],
  });
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileApi.create(formData);
      await refresh();
    } catch (error: any) {
      const serverErrorMessage =
        error.response?.data?.message ||
        error.data?.message ||
        error.message ||
        "Failed to create profile";

      Alert.alert("Error", serverErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Let's get to know you</Text>
            <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <TouchableOpacity
                style={styles.input}
                activeOpacity={0.7}
                onPress={() => setIsAgeModalOpen(true)}
              >
                <Text
                  style={{
                    color: formData.age ? colors.text : colors.textMuted,
                    fontSize: 16,
                  }}
                >
                  {formData.age ? formData.age : "Select"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* College interactive field selection row container instead of direct text type input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>College/University</Text>
              <TouchableOpacity
                style={styles.input}
                activeOpacity={0.7}
                onPress={() => setIsCollegeModalOpen(true)}
              >
                <Text
                  style={{
                    color: formData.college ? colors.text : colors.textMuted,
                    fontSize: 16,
                  }}
                >
                  {formData.college
                    ? formData.college
                    : "Select your college..."}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Major interactive field selection row container instead of direct text type input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Major</Text>
              <TouchableOpacity
                style={styles.input}
                activeOpacity={0.7}
                onPress={() => setIsMajorModalOpen(true)}
              >
                <Text
                  style={{
                    color: formData.major ? colors.text : colors.textMuted,
                    fontSize: 16,
                  }}
                >
                  {formData.major ? formData.major : "Select your major..."}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>About you</Text>
            <Text style={styles.stepSubtitle}>Help others get to know you</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipContainer}
              >
                {YEAR_OPTIONS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.chip,
                      formData.year === year && styles.chipSelected,
                    ]}
                    onPress={() => setFormData((prev) => ({ ...prev, year }))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.year === year && styles.chipTextSelected,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender Identity</Text>
              <View style={styles.chipGrid}>
                {GENDER_OPTIONS.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.chip,
                      formData.genderIdentity === gender && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        genderIdentity: gender,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.genderIdentity === gender &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What are you looking for?</Text>
            <Text style={styles.stepSubtitle}>
              1. Select your relationship goal
            </Text>

            <View style={[styles.chipGrid, { marginTop: -16 }]}>
              {RELATIONSHIP_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalChip,
                    formData.relationshipGoal === goal && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, relationshipGoal: goal }))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.relationshipGoal === goal &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InterestBtnModal
              interest={formData.interests[0] || ""}
              setInterest={(selectedInterest) =>
                setFormData((prev) => ({
                  ...prev,
                  interests: selectedInterest ? [selectedInterest] : [],
                }))
              }
              title="2. What are you interested in?"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>3. Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write a short bio about yourself..."
                placeholderTextColor={colors.textMuted}
                value={formData.bio}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, bio: text }))
                }
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add your photos</Text>
            <Text style={styles.stepSubtitle}>Show off your best self</Text>

            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={pickImage}
                >
                  {formData.photos[index] ? (
                    <Image
                      source={{ uri: formData.photos[index] }}
                      style={styles.photo}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="add" size={32} color={colors.textMuted} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >

          <ClearData />
          <View style={styles.header}>
            <View style={styles.progressBar}>
              {[1, 2, 3, 4].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.progressDot,
                    s <= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
          >
            {renderStep()}
          </ScrollView>

          <View style={styles.footerSafeArea}>
            <View style={styles.footer}>
              {step > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.nextButton, loading && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={loading}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>
                        {step === 4 ? "Complete" : "Next"}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* RENDER AGE MODAL */}
      <AgePickerModal
        visible={isAgeModalOpen}
        onClose={() => setIsAgeModalOpen(false)}
        selectedValue={formData.age}
        onSelectAge={(selectedAge) =>
          setFormData((prev) => ({ ...prev, age: selectedAge }))
        }
      />

      {/* COLLEGE SELECTION SEARCH MODAL */}
      <SearchSelectionModal
        visible={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        title="Select College"
        placeholder="Search for your university..."
        data={user?.college_list || []}
        selectedValue={formData.college}
        onSelect={(selectedCollege) =>
          setFormData((prev) => ({ ...prev, college: selectedCollege }))
        }
        isCollege={true}
      />

      {/* MAJOR SELECTION SEARCH MODAL */}
      <SearchSelectionModal
        visible={isMajorModalOpen}
        onClose={() => setIsMajorModalOpen(false)}
        title="Select Major"
        placeholder="Search for your academic major..."
        data={user?.major_list || []}
        selectedValue={formData.major}
        onSelect={(selectedMajor) =>
          setFormData((prev) => ({ ...prev, major: selectedMajor }))
        }
      />
    </LinearGradient>
  );
}

