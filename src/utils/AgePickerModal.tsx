import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../lib/colors";

// Generates an array of ages from 18 to 30
const AGE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 18);

type AgePickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelectAge: (age: number) => void;
  selectedValue: number | null;
};

export default function AgePickerModal({
  visible,
  onClose,
  onSelectAge,
  selectedValue,
}: AgePickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <TouchableOpacity
          style={modalStyles.dismissArea}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={modalStyles.contentCard}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>Select Your Age</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={AGE_OPTIONS}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item;
              return (
                <TouchableOpacity
                  style={[
                    modalStyles.ageRow,
                    isSelected && modalStyles.ageRowSelected,
                  ]}
                  onPress={() => {
                    onSelectAge(item);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      modalStyles.ageText,
                      isSelected && modalStyles.ageTextSelected,
                    ]}
                  >
                    {item} Years Old
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.text} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: "#1a1a3e", // Matches your deep onboarding background layer style
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: "50%",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  ageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  ageRowSelected: {
    backgroundColor: colors.primary + "20", // Subtly tints selected row with your primary theme color
  },
  ageText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  ageTextSelected: {
    color: colors.text,
    fontWeight: "bold",
  },
});
