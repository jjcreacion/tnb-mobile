import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Typography } from './Typography';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  selected = false,
  disabled = false,
  onPress,
  style,
}) => {
  const isInteractive = !!onPress && !disabled;
  
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[size],
    selected && styles[`${variant}Selected`],
    disabled && styles.disabled,
    style,
  ];

  const textColor = selected 
    ? 'inverse' 
    : variant === 'default' 
    ? 'primary' 
    : 'inverse';

  const content = (
    <Typography 
      variant={size === 'sm' ? 'caption' : 'body2'} 
      color={disabled ? 'disabled' : textColor}
      style={styles.text}
    >
      {label}
    </Typography>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity
        style={badgeStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={badgeStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  // Sizes
  sm: {
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: 2,
    minHeight: 20,
  },

  md: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    minHeight: 24,
  },

  lg: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: 32,
  },

  // Variants
  default: {
    backgroundColor: Theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
  },

  primary: {
    backgroundColor: Theme.colors.primary[500],
  },

  secondary: {
    backgroundColor: Theme.colors.secondary[500],
  },

  success: {
    backgroundColor: Theme.colors.success[500],
  },

  warning: {
    backgroundColor: Theme.colors.warning[500],
  },

  error: {
    backgroundColor: Theme.colors.error[500],
  },

  info: {
    backgroundColor: Theme.colors.info[500],
  },

  // Selected states
  defaultSelected: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },

  primarySelected: {
    backgroundColor: Theme.colors.primary[700],
  },

  secondarySelected: {
    backgroundColor: Theme.colors.secondary[700],
  },

  successSelected: {
    backgroundColor: Theme.colors.success[700],
  },

  warningSelected: {
    backgroundColor: Theme.colors.warning[700],
  },

  errorSelected: {
    backgroundColor: Theme.colors.error[700],
  },

  infoSelected: {
    backgroundColor: Theme.colors.info[700],
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  text: {
    fontWeight: Theme.typography.fontWeight.medium,
  },
});