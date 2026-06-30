import React from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./src/lib/context/auth-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { SocketProvider } from "@/lib/context/socket-context";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "@/lib/api.index";
import { ThemeProvider, useTheme } from "@/lib/context/theme-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// Create an inner component to consume the theme
const RootLayout = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <SafeAreaView
        style={[{ flex: 1, backgroundColor: theme.background }]}
        edges={["top", "left", "right", "bottom"]}
      >
        <AppNavigator />
      </SafeAreaView>
    </>
  );
};

export default function App() {
  console.log("DEV MODE:", __DEV__);
  console.log("API URL:", API_BASE_URL);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <RootLayout />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}