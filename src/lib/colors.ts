// @/lib/colors.ts

export const darkTheme = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#ec4899',
  background: '#0f0f23',
  surface: '#1a1a2e',
  surfaceLight: '#252541',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#374151',
  gradient: { start: '#6366f1', end: '#8b5cf6' },
  pink: '#ec4899',
  rose: '#f43f5e',
  black: "black",
  isLightTheme: false,
};

// Carefully matched to your requested light mode aesthetic
export const lightTheme = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#ec4899',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#F1F3F5',
  text: '#1A1A22',
  textMuted: '#636366',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#E5E5EA',
  gradient: { start: '#6366f1', end: '#8b5cf6' },
  pink: '#ec4899',
  rose: '#f43f5e',
  black: "black",
  isLightTheme: true,

};

// Keep your spacing and border radius as they are
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
};

// Fallback to prevent breaking current imports in other files
export const colors = darkTheme;