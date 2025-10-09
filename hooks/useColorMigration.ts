/**
 * Hook de desarrollo para detectar y migrar colores hardcodeados
 * Solo se ejecuta en modo desarrollo
 */

import { ColorMigration } from '@/constants/ColorMigration';

export const useColorMigrationTracker = (componentName: string) => {
  const trackColor = (color: string, location?: string) => {
    if (__DEV__) {
      const suggestedColor = ColorMigration[color as keyof typeof ColorMigration];
      
      if (suggestedColor && suggestedColor !== color) {
        console.warn(
          `🎨 ${componentName} - Hardcoded color detected:\n` +
          `Current: ${color}\n` +
          `Suggested: ${suggestedColor}\n` +
          `Location: ${location || 'Unknown'}`
        );
      }
    }
  };

  return { trackColor };
};

/**
 * Función helper para verificar si un color es hardcodeado
 */
export const isHardcodedColor = (color: string): boolean => {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbaPattern = /^rgba?\(/;
  const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey', 'black', 'white'];
  
  return hexPattern.test(color) || 
         rgbaPattern.test(color) || 
         namedColors.includes(color.toLowerCase());
};

/**
 * Función helper para auto-migrar colores en tiempo de desarrollo
 */
export const autoMigrateColor = (color: string): string => {
  if (__DEV__ && isHardcodedColor(color)) {
    const migratedColor = ColorMigration[color as keyof typeof ColorMigration];
    if (migratedColor) {
      console.log(`🔄 Auto-migrated color: ${color} → ${migratedColor}`);
      return migratedColor;
    }
  }
  return color;
};