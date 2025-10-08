import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  disabled = false,
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    padding !== 'none' && styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: Theme.colors.surface.primary,
    overflow: 'hidden',
  },

  // Variants
  elevated: {
    ...Theme.shadows.md,
  },

  outlined: {
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    ...Theme.shadows.none,
  },

  filled: {
    backgroundColor: Theme.colors.background.secondary,
    ...Theme.shadows.none,
  },

  // Padding
  padding_sm: {
    padding: Theme.spacing.md,
  },

  padding_md: {
    padding: Theme.spacing.base,
  },

  padding_lg: {
    padding: Theme.spacing.xl,
  },
});
