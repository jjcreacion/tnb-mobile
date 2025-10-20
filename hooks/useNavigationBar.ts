import { Theme } from '@/constants/Theme';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook para configurar la barra de navegación de Android
 * Permite establecer diferentes colores según la pantalla
 */
export const useNavigationBar = (backgroundColor?: string) => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      const color = backgroundColor || Theme.colors.navigation.bar;
      SystemUI.setBackgroundColorAsync(color);
    }
  }, [backgroundColor]);

  const setNavigationBarColor = (color: string) => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(color);
    }
  };

  return {
    setNavigationBarColor,
  };
};