import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },

  // Variants
  success: {
    backgroundColor: Theme.colors.success[50],
  },

  warning: {
    backgroundColor: Theme.colors.warning[50],
  },

  error: {
    backgroundColor: Theme.colors.error[50],
  },

  info: {
    backgroundColor: Theme.colors.info[50],
  },

  neutral: {
    backgroundColor: Theme.colors.neutral[100],
  },

  primary: {
    backgroundColor: Theme.colors.primary[50],
  },

  // Sizes
  sm: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
  },

  md: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },

  lg: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
  },

  // Text styles
  text: {
    fontWeight: Theme.typography.fontWeight.medium,
  },

  successText: {
    color: Theme.colors.success[700],
  },

  warningText: {
    color: Theme.colors.warning[700],
  },

  errorText: {
    color: Theme.colors.error[700],
  },

  infoText: {
    color: Theme.colors.info[700],
  },

  neutralText: {
    color: Theme.colors.neutral[700],
  },

  primaryText: {
    color: Theme.colors.primary[700],
  },

  smText: {
    fontSize: Theme.typography.fontSize.xs,
  },

  mdText: {
    fontSize: Theme.typography.fontSize.sm,
  },

  lgText: {
    fontSize: Theme.typography.fontSize.base,
  },
});
