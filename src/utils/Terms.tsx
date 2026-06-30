import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/lib/context/theme-context";
import { spacing, borderRadius } from "@/lib/colors";



interface TermsProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  url: string;
  linkText?: string;
  prefixText?: string;
}

export default function Terms({
  isChecked,
  onCheckedChange,
  url,
  linkText = "Terms & Conditions",
  prefixText = "I agree to the ",
}: TermsProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleOpenUrl = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      console.error("An error occurred while opening the legal URL", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onCheckedChange(!isChecked)}
        style={styles.checkboxContainer}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
      >
        <Feather
          name={isChecked ? "check-square" : "square"}
          size={22}
          color={isChecked ? (theme.primary || "#ec4899") : theme.textMuted}
        />
      </TouchableOpacity>

      <Text style={styles.textBlock}>
        <Text style={styles.normalText}>{prefixText}</Text>
        <Text style={styles.linkText} onPress={handleOpenUrl}>
          {linkText}
        </Text>
      </Text>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    checkboxContainer: {
      paddingRight: spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    textBlock: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    normalText: {
      color: theme.text || "#ffffff",
    },
    linkText: {
      color: theme.primary || "#ec4899",
      fontWeight: "600",
      textDecorationLine: "underline",
    },
  });