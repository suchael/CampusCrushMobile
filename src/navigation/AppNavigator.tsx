import React, { useEffect } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { globalNavigationRef } from "./rootNavigation";
import { useAuth } from "../lib/context/auth-context";
import { useSocket } from "../lib/context/socket-context";
import { colors } from "../lib/colors";

import HomeScreen from "../screens/Home/HomeScreen";
import ExploreScreen from "../screens/Explore/ExploreScreen";
import MessagesScreen from "../screens/Messages/MessagesScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import LandingScreen from "@/screens/Auth/LandingScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";
import OnboardingScreen from "@/screens/Auth/OnboardingScreen";
import ChatScreen from "@/screens/Messages/Chat/ChatScreen";
import VoiceCallScreen from "@/screens/Call/VoiceCallScreen";
import VideoCallScreen from "@/screens/Call/VideoCallScreen";
import NotificationCallScreen from "@/screens/Call/Notification.call";
import SearchScreen from "@/screens/Home/SearchScreen";
import NotificationMatchScreen from "@/screens/Home/NotificationMatchScreen";
import ForgotPasswordScreen from "@/screens/Auth/ForgotPassword";
import TestScreen from "@/screens/Auth/TestScreen";
import SettingsScreen from "@/screens/Settings/SettingsScreen";
import { useTheme } from "@/lib/context/theme-context";

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Chat: { matchId: string; name: string; photo: string };
  VoiceCall: { matchId: string; name: string };
  VideoCall: { matchId: string; name: string };
  NotificationCall: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderPhoto: string;
  };
  SearchScreen: undefined;
  NotificationMatchScreen: undefined;
  ForgotPassword: undefined;
  TestScreen: undefined;
  SettingsScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function GlobalSocketObserver() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // 2. Clear tracker logs added here to show activity in Metro Bundler
    socket.on("incoming_call", (data) => {
      console.log(
        "[SOCKET GLOBAL DETECTED] Incoming call event payload received:",
        data,
      );

      if (globalNavigationRef.isReady()) {
        console.log(
          "[SOCKET GLOBAL] Navigating to NotificationCall Screen now...",
        );
        globalNavigationRef.navigate("NotificationCall", {
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhoto: data.senderPhoto,
        });
      } else {
        console.error(
          "[SOCKET GLOBAL ERROR] Navigation Container is not fully initialized.",
        );
      }
    });

    socket.on("call_response_received", (data) => {
      console.log("[SOCKET GLOBAL DETECTED] Call response received:", data);

      if (globalNavigationRef.isReady()) {
        if (data.accepted) {
          globalNavigationRef.navigate("VideoCall", {
            matchId: data.conversationId,
            name: "Video Call",
          });
        } else {
          Alert.alert("Call Declined", "The user is currently busy.");
        }
      }
    });

    return () => {
      socket.off("incoming_call");
      socket.off("call_response_received");
    };
  }, [socket]);

  return null;
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          },
        ],
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "heart" : "heart-outline";
              break;
            case "Explore":
              iconName = focused ? "compass" : "compass-outline";
              break;
            case "Messages":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Match" }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText,]}>Loading...</Text>
      </View>
    );
  }

  return (
    /* 3. Added the ref property to the container context root */
    <NavigationContainer ref={globalNavigationRef}>
      {user && <GlobalSocketObserver />}

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.hasCompletedOnboarding ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="VoiceCall"
                component={VoiceCallScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="VideoCall"
                component={VideoCallScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="NotificationCall"
                component={NotificationCallScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="NotificationMatchScreen"
                component={NotificationMatchScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="SettingsScreen"
                component={SettingsScreen}
                options={{ animation: "fade_from_bottom" }}
              />
              <Stack.Screen
                name="TestScreen"
                component={TestScreen}
                options={{ animation: "fade_from_bottom" }}
              />
            </>
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      color: theme.text,
      fontSize: 18,
    },
    tabBar: {
      backgroundColor: theme.surface,
      borderTopColor: theme.border,
      paddingTop: 10,
    },
  });
