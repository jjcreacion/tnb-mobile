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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx }) => Math.abs(dx) > 10,
      onPanResponderRelease: (_, { dx, vx }) => {
        const minDistance = 50;
        const minVelocity = 0.1;

        // Swipe izquierda (dx negativo) -> siguiente tab
        if (dx < -minDistance && Math.abs(vx) > minVelocity) {
          handleSwipeLeft();
        }
        // Swipe derecha (dx positivo) -> tab anterior
        else if (dx > minDistance && Math.abs(vx) > minVelocity) {
          handleSwipeRight();
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
