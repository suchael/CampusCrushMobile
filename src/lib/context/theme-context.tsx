import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { darkTheme, lightTheme } from "@/lib/colors";
import { THEME_KEY } from "../api.index";

type ThemeContextType = {
  isDarkMode: boolean;
  theme: typeof darkTheme;
  toggleTheme: (value: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);

        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === "dark");
        }
      } catch (error) {
        console.log("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, []);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = async (value: boolean) => {
    try {
      setIsDarkMode(value);

      await AsyncStorage.setItem(
        THEME_KEY,
        value ? "dark" : "light"
      );
    } catch (error) {
      console.log("Failed to save theme:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    );
  }

  return context;
};