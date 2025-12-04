import { Theme } from '@/constants/Theme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Typography } from './Typography';

export type BottomSheetSize = 'sm' | 'md' | 'lg' | 'xl';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: BottomSheetSize;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
  children: React.ReactNode;
  style?: any;
}

const { height: screenHeight } = Dimensions.get('window');

const sizeMap = {
  sm: screenHeight * 0.3,  // 30%
  md: screenHeight * 0.5,  // 50% 
  lg: screenHeight * 0.7,  // 70%
  xl: screenHeight * 0.9,  // 90%
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  dismissOnBackdrop = true,
  children,
  style,
}) => {
  const sheetHeight = sizeMap[size];
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Handle Android back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });

      return () => backHandler.remove();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight, translateY, backdropOpacity, onClose]);

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY }],
          },
          style,
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {title && (
                <Typography variant="h4" color="primary" style={styles.title}>
                  {title}
                </Typography>
              )}
            </View>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon
                  name="close"
                  size={24}
                  color={Theme.colors.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Theme.spacing.lg) }]}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.overlay.dark,
  },

  backdropTouchable: {
    flex: 1,
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    ...Theme.shadows.xl,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'center',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    textAlign: 'center',
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },

  content: {
    flex: 1,
  },
});