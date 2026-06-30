import React from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "@/lib/colors";
import InterestBtnModal from "@/utils/InterestBtnModal";
import { useTheme } from "@/lib/context/theme-context";

interface ProfileDetailsCardProps {
  profile: any;
  isEditing: boolean;
  onUpdateField: (field: string, value: any) => void;
}

export default function ProfileDetailsCard({
  profile,
  isEditing,
  onUpdateField,
}: ProfileDetailsCardProps) {
   const { theme } = useTheme();
    const styles = getStyles(theme);

  const mutedText = theme.textMuted || "#62627A";
  const primaryColor = theme.pink || "#7C3AED";

  return (
    <View style={styles.container}>
      {/* Main Section Heading */}
      <Text style={styles.mainSectionHeader}>Profile Details</Text>

      {/* ==========================================
          SECTION 1: PERSONAL DETAILS 
         ========================================== */}
      <View
        style={[styles.sectionBlock, isEditing && styles.sectionBlockEditing]}
      >
        <Text style={styles.sectionTagLabel}>Personal Details</Text>

        {/* Full Name (Full Row) */}
        <View style={styles.fieldItemCell}>
          <Text style={styles.fieldInputTitle}>Full Name</Text>
          {isEditing ? (
            <View style={styles.inputIconWrapper}>
              <Ionicons
                name="person-outline"
                size={16}
                color={mutedText}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInputBoxFrame}
                value={profile.name}
                onChangeText={(val) => onUpdateField("name", val)}
                placeholder="Enter full name"
                placeholderTextColor={mutedText}
              />
            </View>
          ) : (
            <View style={styles.readOnlyDisplayRow}>
              <Ionicons name="person-sharp" size={15} color={primaryColor} />
              <Text style={styles.readOnlyTextValue}>
                {profile.name || "Unspecified Name"}
              </Text>
            </View>
          )}
        </View>

        {/* Age & Gender Identity (Grid/Split Row) */}
        <View style={styles.gridInputRow}>
          <View style={styles.flexItemValueCell}>
            <Text style={styles.fieldInputTitle}>Age</Text>
            {isEditing ? (
              <View style={styles.inputIconWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={mutedText}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInputBoxFrame}
                  value={String(profile.age ?? "")}
                  onChangeText={(val) =>
                    onUpdateField("age", val.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="Age"
                  placeholderTextColor={mutedText}
                  maxLength={3}
                />
              </View>
            ) : (
              <View style={styles.readOnlyDisplayRow}>
                <Ionicons
                  name="calendar-sharp"
                  size={15}
                  color={primaryColor}
                />
                <Text style={styles.readOnlyTextValue}>
                  {profile.age ? `${profile.age} YRS` : "Unset"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.flexItemValueCell}>
            <Text style={styles.fieldInputTitle}>Gender Identity</Text>
            {isEditing ? (
              <View style={styles.inputIconWrapper}>
                <Ionicons
                  name="transgender-outline"
                  size={16}
                  color={mutedText}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInputBoxFrame}
                  value={profile.genderIdentity}
                  onChangeText={(val) => onUpdateField("genderIdentity", val)}
                  placeholder="Identity"
                  placeholderTextColor={mutedText}
                />
              </View>
            ) : (
              <View style={styles.readOnlyDisplayRow}>
                <Ionicons
                  name="transgender-sharp"
                  size={15}
                  color={primaryColor}
                />
                <Text style={styles.readOnlyTextValue}>
                  {profile.genderIdentity || "Unset"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio Statement (Full Row) */}
        <View style={styles.fieldItemCell}>
          <Text style={styles.fieldInputTitle}>Bio</Text>
          {isEditing ? (
            <View style={styles.inputIconWrapper}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={mutedText}
                style={[styles.inputLeftIcon, { top: 14 }]}
              />
              <TextInput
                style={[styles.textInputBoxFrame, styles.textAreaHeight]}
                multiline
                numberOfLines={3}
                value={profile.bio}
                onChangeText={(val) => onUpdateField("bio", val)}
                placeholder="Share something interesting..."
                placeholderTextColor={mutedText}
              />
            </View>
          ) : (
            <View style={styles.readOnlyBioDisplayBox}>
              <Text style={styles.readOnlyBioTextValue}>
                {`"${profile.bio}"` ||
                  "No description written yet. Tap edit to update your bio."}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ==========================================
          SECTION 2: INSTITUTION DETAILS
         ========================================== */}
      <View
        style={[styles.sectionBlock, isEditing && styles.sectionBlockEditing]}
      >
        <Text style={styles.sectionTagLabel}>Institution Details</Text>

        {/* College (Full Row to safely handle long institutional names) */}
        <View style={styles.fieldItemCell}>
          <Text style={styles.fieldInputTitle}>College / University</Text>
          {isEditing ? (
            <View style={styles.inputIconWrapper}>
              <Ionicons
                name="business-outline"
                size={16}
                color={mutedText}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInputBoxFrame}
                value={profile.college}
                onChangeText={(val) => onUpdateField("college", val)}
                placeholder="Enter complete university name"
                placeholderTextColor={mutedText}
              />
            </View>
          ) : (
            <View style={styles.readOnlyDisplayRow}>
              <Ionicons name="business-sharp" size={15} color={primaryColor} />
              <Text style={styles.readOnlyTextValue} numberOfLines={2}>
                {profile.college || "Unspecified Institution"}
              </Text>
            </View>
          )}
        </View>

        {/* Field of Study & Academic Year (Grid/Split Row) */}
        <View style={styles.gridInputRow}>
          <View style={styles.flexItemValueCell}>
            <Text style={styles.fieldInputTitle}>Field of Study (Major)</Text>
            {isEditing ? (
              <View style={styles.inputIconWrapper}>
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={mutedText}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInputBoxFrame}
                  value={profile.major}
                  onChangeText={(val) => onUpdateField("major", val)}
                  placeholder="e.g. Economics"
                  placeholderTextColor={mutedText}
                />
              </View>
            ) : (
              <View style={styles.readOnlyDisplayRow}>
                <Ionicons name="book-sharp" size={15} color={primaryColor} />
                <Text style={styles.readOnlyTextValue}>
                  {profile.major || "Unset"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.flexItemValueCell}>
            <Text style={styles.fieldInputTitle}>Academic Year</Text>
            {isEditing ? (
              <View style={styles.inputIconWrapper}>
                <Ionicons
                  name="school-outline"
                  size={16}
                  color={mutedText}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  style={styles.textInputBoxFrame}
                  value={profile.year}
                  onChangeText={(val) => onUpdateField("year", val)}
                  placeholder="e.g. Senior"
                  placeholderTextColor={mutedText}
                />
              </View>
            ) : (
              <View style={styles.readOnlyDisplayRow}>
                <Ionicons name="school-sharp" size={15} color={primaryColor} />
                <Text style={styles.readOnlyTextValue}>
                  {profile.year || "Unset"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ==========================================
          SECTION 3: CAMPUS PREFERENCES
         ========================================== */}
      <View
        style={[styles.sectionBlock, isEditing && styles.sectionBlockEditing]}
      >
        <Text style={styles.sectionTagLabel}>Campus Preferences</Text>

        {/* Relationship Goal (Full Row) */}
        <View style={styles.fieldItemCell}>
          <Text style={styles.fieldInputTitle}>Relationship Goal</Text>
          {isEditing ? (
            <View style={styles.inputIconWrapper}>
              <Ionicons
                name="heart-outline"
                size={16}
                color={mutedText}
                style={styles.inputLeftIcon}
              />
              <TextInput
                style={styles.textInputBoxFrame}
                value={profile.relationshipGoal}
                onChangeText={(val) => onUpdateField("relationshipGoal", val)}
                placeholder="What are you looking for?"
                placeholderTextColor={mutedText}
              />
            </View>
          ) : (
            <View style={styles.readOnlyDisplayRow}>
              <Ionicons name="heart-sharp" size={15} color={primaryColor} />
              <Text style={styles.readOnlyTextValue}>
                {profile.relationshipGoal || "Unset Preference"}
              </Text>
            </View>
          )}
        </View>

        {/* Primary Campus Interest Component */}
        <View style={styles.fieldItemCell}>
          {isEditing ? (
            <View style={styles.modalSpacer}>
              <Text style={styles.fieldInputTitle}>
                Interest & Passion
              </Text>
              <InterestBtnModal
                interest={profile.interests[0] || ""}
                setInterest={(selectedVal) =>
                  onUpdateField("interests", selectedVal ? [selectedVal] : [])
                }
              />
            </View>
          ) : (
            <View style={styles.interestReadOnlyWrapper}>
              <Text style={styles.fieldInputTitle}>
                Interest & Passion
              </Text>
              <View style={styles.activeInterestTagPill}>
                <View style={styles.interestPulseDot} />
                <Text style={styles.activeInterestText}>
                  {profile.interests[0] || "No interest selected"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

 const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg || 16,
  },
  mainSectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 16,
    paddingLeft: 2,
  },
  sectionBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: borderRadius.xl || 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  sectionBlockEditing: {
    backgroundColor: "#121224",
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  sectionTagLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.pink, // Clean identity tag line
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  fieldItemCell: {
    width: "100%",
  },
  fieldInputTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#62627A",
    textTransform: "uppercase",
    letterSpacing: 1.0,
    marginBottom: 6,
    paddingLeft: 2,
  },
  inputIconWrapper: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  inputLeftIcon: {
    position: "absolute",
    left: 14,
    zIndex: 10,
  },
  textInputBoxFrame: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: borderRadius.md || 12,
    height: 46,
    paddingLeft: 40,
    paddingRight: 16,
    color: theme.text,
    fontSize: 14,
    fontWeight: "500",
  },
  textAreaHeight: {
    height: 84,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  readOnlyDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  readOnlyTextValue: {
    fontSize: 15,
    color: theme.text,
    opacity: 0.8,
    fontWeight: "600",
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  readOnlyBioDisplayBox: {
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: borderRadius.md,
  },
  readOnlyBioTextValue: {
    fontSize: 14,
    color: "#A3A3C2",
    fontWeight: "500",
    lineHeight: 20,
  },
  gridInputRow: {
    flexDirection: "row",
    gap: 12,
  },
  flexItemValueCell: {
    flex: 1,
  },
  modalSpacer: {
    gap: 6,
  },
  interestReadOnlyWrapper: {
    gap: 4,
  },
  activeInterestTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(124, 58, 237, 0.06)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md || 10,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.2)",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  interestPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7C3AED",
  },
  activeInterestText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: "600",
  },
});
