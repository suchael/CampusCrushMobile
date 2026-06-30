import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, spacing, borderRadius } from '../../lib/colors';
import { Ionicons } from '@expo/vector-icons';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

export default function LandingScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={[colors.background, '#1a1a3e']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="heart" size={40} color={colors.primary} />
          </View>
          <Text style={styles.logoText}>Campus Crush</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Dating for{'\n'}
            <Text style={styles.heroHighlight}>College Students</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Match with verified students on your campus. No townies, no bots.
          </Text>
        </View>

        <View style={styles.verifiedBadge}>
          <View style={styles.badgeIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          </View>
          <View>
            <Text style={styles.badgeSubtext}>Verified Students</Text>
            <Text style={styles.badgeText}>100% Real</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms & Privacy Policy.{'\n'}
          Only for US & Canada students.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  logoIcon: {
    marginRight: spacing.sm,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 44,
  },
  heroHighlight: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'center',
    marginBottom: spacing.xl,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: {
    marginRight: spacing.sm,
  },
  badgeSubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
