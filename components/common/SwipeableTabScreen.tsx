import { useTabSwipeNavigation } from '@/hooks/useTabSwipeNavigation';
import React, { useRef } from 'react';
import { PanResponder, View, ViewProps } from 'react-native';

interface SwipeableTabScreenProps extends ViewProps {
  tabName: string;
  children: React.ReactNode;
}

/**
 * Componente wrapper para pantallas de tab que soportan navegación por swipe
 * Detecta gestos horizontales y navega entre tabs
 */
export const SwipeableTabScreen: React.FC<SwipeableTabScreenProps> = ({

  tabName,
  children,
  style,
  ...props
}) => {
  const { handleSwipeLeft, handleSwipeRight } = useTabSwipeNavigation({
    currentTab: tabName,
  });

  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log(`🎯 [${tabName}] onStartShouldSetPanResponder`);
        return true;
      },
      onMoveShouldSetPanResponder: (_, { dx }) => {
        const shouldSet = Math.abs(dx) > 10;
        if (shouldSet) {
          console.log(`🎯 [${tabName}] onMoveShouldSetPanResponder - dx: ${dx}`);
        }
        return shouldSet;
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const minDistance = 50;
        const minVelocity = 0.1;

        console.log(`🎯 [${tabName}] onPanResponderRelease - dx: ${dx}, vx: ${vx}, minDistance: ${minDistance}, minVelocity: ${minVelocity}`);

        // Swipe izquierda (dx negativo) -> siguiente tab
        if (dx < -minDistance && Math.abs(vx) > minVelocity) {
          console.log(`✅ [${tabName}] SWIPE LEFT DETECTED - calling handleSwipeLeft()`);
          handleSwipeLeft();
        }
        // Swipe derecha (dx positivo) -> tab anterior
        else if (dx > minDistance && Math.abs(vx) > minVelocity) {
          console.log(`✅ [${tabName}] SWIPE RIGHT DETECTED - calling handleSwipeRight()`);
          handleSwipeRight();
        } else {
          console.log(`❌ [${tabName}] Gesture detected but not a valid swipe`);
        }
      },
    })
  ).current;

  return (
    <View
      {...props}
      {...panResponderRef.panHandlers}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </View>
  );
};
