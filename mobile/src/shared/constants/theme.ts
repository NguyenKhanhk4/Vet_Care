/**
 * VetCare Theme Configuration
 * Defines the design system tokens used throughout the app
 */

export const lightColors = {
  // Primary Colors
  primary: '#87d1e8',
  primaryDark: '#5ab9d4',
  primaryLight: '#d0eff8',
  // Secondary Colors
  secondary: '#a3dfef',
  secondaryDark: '#75c4db',
  secondaryLight: '#e1f4fa',
  // Background Colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#9E9E9E',
  textWhite: '#FFFFFF',
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  // Status Badge Colors
  pending: '#FF9800',
  confirmed: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336',
  paid: '#9C27B0',
  // Other
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#BDBDBD',
};

export const darkColors = {
  ...lightColors,
  background: '#121212',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textLight: '#757575',
  border: '#333333',
  divider: '#2C2C2C',
  shadow: 'rgba(0, 0, 0, 0.5)',
  primaryLight: '#1c3b46',
  secondaryLight: '#254652',
};

export type ThemeColors = typeof lightColors;

// Fallback for backwards compatibility during refactor
export const COLORS = lightColors;

export const FONTS = {
  regular: {
    fontWeight: '400' as const,
  },
  medium: {
    fontWeight: '500' as const,
  },
  semiBold: {
    fontWeight: '600' as const,
  },
  bold: {
    fontWeight: '700' as const,
  },
};

export const SIZES = {
  // Font Sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 32,

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    round: 999, // Pill shape
  },

  // Icon Sizes
  icon: {
    sm: 16,
    md: 20,
    base: 24,
    lg: 28,
    xl: 32,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
