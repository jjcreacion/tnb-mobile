import { Theme } from '@/constants/Theme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { Typography } from './Typography';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'spinner' | 'overlay' | 'inline';

interface LoadingProps {
  visible?: boolean;
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  color?: string;
  style?: ViewStyle;
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
};

export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  size = 'md',
  variant = 'inline',
  message,
  color = Theme.colors.primary[500],
  style,
}) => {
  if (!visible) return null;

  const renderSpinner = () => (
    <ActivityIndicator
      size={sizeMap[size]}
      color={color}
      style={styles[`${size}Spinner`]}
    />
  );

  const renderContent = () => (
    <View style={styles.content}>
      {renderSpinner()}
      {message && (
        <Typography 
          variant="body2" 
          color={variant === 'overlay' ? 'inverse' : 'secondary'}
          style={styles.message}
        >
          {message}
        </Typography>
      )}
    </View>
  );

  switch (variant) {
    case 'overlay':
      return (
        <View style={[styles.overlay, style]}>
          <View style={styles.overlayContent}>
            {renderContent()}
          </View>
        </View>
      );

    case 'spinner':
      return (
        <View style={[styles.spinner, style]}>
          {renderContent()}
        </View>
      );

    case 'inline':
    default:
      return (
        <View style={[styles.inline, style]}>
          {renderContent()}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  // Variants
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  overlayContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    minWidth: 120,
    alignItems: 'center',
    ...Theme.shadows.lg,
  },

  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
  },

  inline: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },

  // Content
  content: {
    alignItems: 'center',
  },

  message: {
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },

  // Sizes
  smSpinner: {
    width: 20,
    height: 20,
  },

  mdSpinner: {
    width: 32,
    height: 32,
  },

  lgSpinner: {
    width: 48,
    height: 48,
  },
});