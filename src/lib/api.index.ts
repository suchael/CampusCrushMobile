import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_URL = "https://campuscrush-1hc6.onrender.com";
const LOCAL_URL = "http://10.134.174.68:5000";

export const API_BASE_URL = __DEV__ ? LOCAL_URL : PUBLIC_URL;

// async storage key
export const USER_TOKEN_KEY = 'userToken';
export const USER_CACHE_KEY = "cached_user_profile";
export const USER_PREFERENCE_KEY = '@user_filters';
export const THEME_KEY = '@theme_key';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor to attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;