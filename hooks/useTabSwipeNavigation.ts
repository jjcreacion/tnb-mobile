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

  console.log(`📍 useTabSwipeNavigation - currentTab: ${currentTab}, currentIndex: ${currentIndex}`);

  const handleSwipeLeft = useCallback(() => {
    console.log(`👆 handleSwipeLeft called - currentIndex: ${currentIndex}`);
    
    if (currentIndex < TAB_ROUTES.length - 1) {
      const nextTab = TAB_ROUTES[currentIndex + 1];
      console.log(`🔄 Swipe Left: navigating from ${currentTab} to ${nextTab}`);
      
      try {
        // Usar navigate directamente - React Navigation enrutará hacia el parent (Tab Navigator)
        (navigation as any).navigate(nextTab, { screen: nextTab });
        console.log(`✅ Successfully called navigate('${nextTab}')`);
      } catch (error) {
        console.log(`❌ Error navigating: ${error}`);
      }
      onSwipeLeft?.();
    }
  }, [currentIndex, currentTab, navigation, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    console.log(`👆 handleSwipeRight called - currentIndex: ${currentIndex}`);
    
    if (currentIndex > 0) {
      const previousTab = TAB_ROUTES[currentIndex - 1];
      console.log(`🔄 Swipe Right: navigating from ${currentTab} to ${previousTab}`);
      
      try {
        // Usar navigate directamente - React Navigation enrutará hacia el parent (Tab Navigator)
        (navigation as any).navigate(previousTab, { screen: previousTab });
        console.log(`✅ Successfully called navigate('${previousTab}')`);
      } catch (error) {
        console.log(`❌ Error navigating: ${error}`);
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
