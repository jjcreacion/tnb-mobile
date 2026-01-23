/**
 * TNB Mobile - Consolidated Colors System
 * Unified color definitions including theme colors, migration utilities, and legacy Expo colors
 */

import { Theme } from '@/constants/Theme';

// ============================================
// LEGACY EXPO COLORS (for compatibility)
// ============================================

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ============================================
// COLOR MIGRATION UTILITIES
// ============================================

/**
 * Color Migration Mapping
 * Maps legacy hardcoded colors to new Theme tokens
 */
export const ColorMigration = {
  // Rojos TNB - mapeo de variaciones hardcodeadas
  '#ea0e08': Theme.colors.primary[500], // Rojo principal anterior
  '#EA0E08': Theme.colors.primary[500],
  '#ff0000': Theme.colors.primary[500], // Rojo básico
  '#FF0000': Theme.colors.primary[500],
  '#ff6a59': Theme.colors.primary[400], // Rojo claro anterior
  '#FF6A59': Theme.colors.primary[400],
  '#fa2d64': Theme.colors.primary[600], // Gradiente anterior
  '#FA2D64': Theme.colors.primary[600],
  '#7c1310': Theme.colors.primary[800], // Rojo oscuro anterior
  '#7C1310': Theme.colors.primary[800],
  '#d9534f': Theme.colors.error[500],   // Rojo de error
  '#D9534F': Theme.colors.error[500],

  // Azules hardcodeados
  '#0d47fc': Theme.colors.secondary[500], // Azul anterior
  '#0D47FC': Theme.colors.secondary[500],
  '#007AFF': Theme.colors.info[500],      // Azul iOS
  '#6090d5': Theme.colors.secondary[400], // Azul claro anterior
  '#6090D5': Theme.colors.secondary[400],

  // Grises y neutros
  '#f5f5f5': Theme.colors.neutral[100],   // Gris muy claro
  '#F5F5F5': Theme.colors.neutral[100],
  '#f0f0f0': Theme.colors.neutral[200],   // Gris claro
  '#F0F0F0': Theme.colors.neutral[200],
  '#e5e5e5': Theme.colors.border.default, // Borde gris
  '#E5E5E5': Theme.colors.border.default,
  '#ddd': Theme.colors.border.default,    // Borde
  '#DDD': Theme.colors.border.default,
  '#ccc': Theme.colors.border.dark,       // Borde oscuro
  '#CCC': Theme.colors.border.dark,
  '#666': Theme.colors.text.secondary,    // Texto secundario
  '#333': Theme.colors.text.primary,      // Texto primario
  'gray': Theme.colors.neutral[400],      // Gris genérico
  'grey': Theme.colors.neutral[400],

  // Colores semánticos
  'green': Theme.colors.success[500],     // Verde éxito
  'red': Theme.colors.error[500],         // Rojo error
  'orange': Theme.colors.warning[500],    // Naranja advertencia

  // Colores especiales
  'transparent': 'transparent',
  'white': Theme.colors.background.primary,
  '#ffffff': Theme.colors.background.primary,
  '#FFFFFF': Theme.colors.background.primary,
  'black': Theme.colors.text.primary,
  '#000000': Theme.colors.text.primary,
  '#000': Theme.colors.text.primary,

  // Overlays (rgba)
  'rgba(0, 0, 0, 0.5)': Theme.colors.overlay.medium,
  'rgba(0, 0, 0, 0.3)': Theme.colors.overlay.light,
  'rgba(0, 0, 0, 0.6)': Theme.colors.overlay.dark,
  'rgba(230, 57, 70, 0.2)': `${Theme.colors.primary[500]}33`, // 20% opacity
  'rgba(230, 57, 70, 0.3)': `${Theme.colors.primary[500]}4D`, // 30% opacity
  'rgba(230, 57, 70, 0.6)': `${Theme.colors.primary[500]}99`, // 60% opacity
  'rgba(255, 255, 255, 0.6)': `${Theme.colors.text.inverse}99`,
  'rgba(255, 255, 255, 0.2)': `${Theme.colors.text.inverse}33`,
} as const;

/**
 * Helper function to migrate colors
 * @param color Legacy hardcoded color
 * @returns Corresponding theme color
 */
export const migrateColor = (color: string): string => {
  return ColorMigration[color as keyof typeof ColorMigration] || color;
};

/**
 * Common gradient migrations
 */
export const GradientMigration = {
  primaryGradient: [Theme.colors.primary[500], Theme.colors.primary[600]],
  lightGradient: [Theme.colors.primary[400], Theme.colors.primary[500]],
  darkGradient: [Theme.colors.primary[700], Theme.colors.primary[800]],
  
  // Gradientes con transparencia
  overlayGradient: [
    `${Theme.colors.primary[500]}33`, // 20%
    `${Theme.colors.primary[500]}4D`, // 30%
    `${Theme.colors.primary[500]}99`, // 60%
  ],
} as const;

/**
 * Common style migrations mapping
 */
export const StyleMigration = {
  // Sombras comunes
  commonShadow: Theme.shadows.md,
  lightShadow: Theme.shadows.sm,
  strongShadow: Theme.shadows.lg,

  // Border radius comunes
  smallRadius: Theme.borderRadius.sm,
  mediumRadius: Theme.borderRadius.md,
  largeRadius: Theme.borderRadius.lg,
  roundRadius: Theme.borderRadius.full,

  // Espaciado común
  smallPadding: Theme.spacing.sm,
  mediumPadding: Theme.spacing.sm,
  largePadding: Theme.spacing.lg,
  xlPadding: Theme.spacing.xl,

  // Alturas comunes de componentes
  inputHeight: 48,
  buttonHeight: 44,
  headerHeight: 60,
  tabBarHeight: 70,
} as const;
