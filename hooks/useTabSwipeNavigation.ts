import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

const TAB_ROUTES = ['index', 'activity', 'history', 'billing', 'support'];

interface SwipeNavigationOptions {
  currentTab: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * Hook para navegación entre tabs mediante swipes horizontales
 * Detecta swipes izquierda (siguiente tab) y derecha (tab anterior)
 */
export const useTabSwipeNavigation = ({
  currentTab,
  onSwipeLeft,
  onSwipeRight,
}: SwipeNavigationOptions) => {
  const navigation = useNavigation();
  const currentIndex = TAB_ROUTES.indexOf(currentTab);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < TAB_ROUTES.length - 1) {
      const nextTab = TAB_ROUTES[currentIndex + 1];
      
      try {
        // Usar navigate directamente - React Navigation enrutará hacia el parent (Tab Navigator)
        (navigation as any).navigate(nextTab, { screen: nextTab });
      } catch (error) {
        console.error(`Error navigating to ${nextTab}:`, error);
      }
      onSwipeLeft?.();
    }
  }, [currentIndex, currentTab, navigation, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (currentIndex > 0) {
      const previousTab = TAB_ROUTES[currentIndex - 1];
      
      try {
        // Usar navigate directamente - React Navigation enrutará hacia el parent (Tab Navigator)
        (navigation as any).navigate(previousTab, { screen: previousTab });
      } catch (error) {
        console.error(`Error navigating to ${previousTab}:`, error);
      }
      onSwipeRight?.();
    }
  }, [currentIndex, currentTab, navigation, onSwipeRight]);

  return {
    handleSwipeLeft,
    handleSwipeRight,
    canSwipeLeft: currentIndex < TAB_ROUTES.length - 1,
    canSwipeRight: currentIndex > 0,
  };
};
