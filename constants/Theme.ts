/**
 * TNB Mobile - Design System Tokens
 * Professional design system with color palette, typography, spacing, and more
 */

// ============================================
// COLOR PALETTE
// ============================================

export const Colors = {
  // Primary Brand Colors - Refined Red Palette
  primary: {
    50: '#FFF1F0',
    100: '#FFDFDD',
    200: '#FFC5C1',
    300: '#FF9B94',
    400: '#FF6B61',
    500: '#E63946', // Main brand red - more sophisticated
    600: '#D62828',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Secondary Colors - Professional Blue
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Background & Surface
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    elevated: '#FFFFFF',
  },

  // Navigation Colors
  navigation: {
    bar: '#050505', // Android navigation bar background
    barSplash: '#f2f2f2', // Splash screen navigation bar (white)
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },

  // Border Colors
  border: {
    light: '#F3F4F6',
    default: '#E5E7EB',
    dark: '#D1D5DB',
    focus: '#E63946',
  },

  // Overlay
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
};

// ============================================
// TYPOGRAPHY
// ============================================

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    mono: 'SpaceMono',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 56,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

// ============================================
// SPACING
// ============================================

export const Spacing = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ============================================
// BORDER RADIUS
// ============================================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// ============================================
// SHADOWS
// ============================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ============================================
// LAYOUT
// ============================================

export const Layout = {
  container: {
    maxWidth: 1200,
    paddingHorizontal: Spacing.base,
  },

  screen: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
  },

  card: {
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
  },

  header: {
    height: 60,
    paddingHorizontal: Spacing.base,
  },

  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
};

// ============================================
// ANIMATIONS
// ============================================

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ============================================
// ICON SIZES
// ============================================

export const IconSize = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// ============================================
// BUTTON SIZES
// ============================================

export const ButtonSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 12,
    fontSize: Typography.fontSize.sm,
  },
  md: {
    height: 44,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
  },
  lg: {
    height: 52,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.lg,
  },
};

// ============================================
// INPUT SIZES
// ============================================

export const InputSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 12,
    fontSize: Typography.fontSize.sm,
  },
  md: {
    height: 48,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
  },
  lg: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.lg,
  },
};

// ============================================
// EXPORT DEFAULT THEME
// ============================================

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
  animation: Animation,
  iconSize: IconSize,
  buttonSizes: ButtonSizes,
  inputSizes: InputSizes,
};

export type ThemeType = typeof Theme;
