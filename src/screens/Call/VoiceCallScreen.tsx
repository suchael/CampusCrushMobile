import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing } from '../../lib/colors';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';

const { width } = Dimensions.get('window');

export default function VoiceCallScreen() {
  const navigation = useNavigation();
 

  return (
    <View style={styles.container}>
      {/* Upper Context Deck */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' }} 
          style={styles.avatar} 
        />
        <Text style={styles.userName}>Dummy Name</Text>
        <Text style={styles.callStatus}>Ringing...</Text>
      </View>

      {/* Control Action Tray */}
      <View style={styles.actionTray}>
        <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
          <Feather name="mic-off" size={22} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.circleButton, styles.hangUpButton]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="phone-hangup" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
          <Feather name="volume-2" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Global scope bundle fix for missing icon set subcomponents
import { MaterialCommunityIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b0e', // Dark mode background variant
    justifyContent: 'space-between',
    paddingVertical: 100,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary || '#ec4899',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text || '#ffffff',
  },
  callStatus: {
    fontSize: 16,
    color: colors.textMuted || '#94a3b8',
    marginTop: spacing.xs,
  },
  actionTray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hangUpButton: {
    backgroundColor: '#f43f5e',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});