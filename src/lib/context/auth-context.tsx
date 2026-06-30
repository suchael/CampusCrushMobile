import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authApi } from "../api/auth.api";
import { USER_TOKEN_KEY } from "../api.index";

const USER_CACHE_KEY = "cached_user_profile";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
  hasCompletedOnboarding: boolean;
  name?: string;
  photo?: string;
  major_list?: string[];
  college_list?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<any>;
  authenticateSession: (token: string, userPayload: User) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.log(
        "[AUTH CHECK] Connection exception intercepted:",
        error?.message,
      );

      const isAuthError =
        error?.response &&
        (error.response.status === 401 || error.response.status === 403);

      if (isAuthError) {
        console.log("[AUTH] Token expired/revoked. Removing session context.");
        await AsyncStorage.removeItem(USER_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_CACHE_KEY);
        setUser(null);
      } else {
        console.log(
          "[AUTH] Server unreachable. Reverting to cached data session...",
        );
        const cachedUserRaw = await AsyncStorage.getItem(USER_CACHE_KEY);

        if (cachedUserRaw) {
          setUser(JSON.parse(cachedUserRaw));
        } else {
          setUser({
            id: "offline_fallback",
            email: "",
            emailVerified: true,
            isAdmin: false,
            hasCompletedOnboarding: true,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const userData = await authApi.login(email, password);
    if (userData.token) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, userData.token);
    }
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (email: string, password: string) => {
    // Only fetch data from server; do not manipulate application session states yet
    const responseData = await authApi.register(email, password);

    // If your backend ever bypasses OTP and logs users in automatically:
    if (responseData.token && responseData.emailVerified) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, responseData.token);
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(responseData));
      setUser(responseData);
    }

    return responseData;
  };

  // Called manually after OTP verification succeeds to mount the main user stack
  const authenticateSession = async (token: string, userPayload: User) => {
    if (token) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, token);
    }
    await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(userPayload));
    setUser(userPayload);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log(
        "Network unreachable during backend logout, proceeding with local wipe.",
      );
    } finally {
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_CACHE_KEY);
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount();
    } catch (e) {
      console.log(
        "Server failed or unreachable during account destruction. Forcing local data purge.",
      );
    } finally {
      // Clean storage context files regardless of operational request status code outcomes
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_CACHE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        authenticateSession,
        logout,
        refresh: checkAuth,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
