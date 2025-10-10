import { Theme } from '@/constants/Theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress?: () => void;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  children,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? Theme.colors.text.inverse : Theme.colors.primary[500]}
          size="small"
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        {children || <Text style={textStyles}>{title}</Text>}
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },

  // Variants
  primary: {
    backgroundColor: Theme.colors.primary[500],
  },

  secondary: {
    backgroundColor: Theme.colors.secondary[500],
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Theme.colors.primary[500],
    // Remove shadow for outline buttons to prevent Android border duplication
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  danger: {
    backgroundColor: Theme.colors.error[500],
  },

  // Sizes
  sm: {
    height: Theme.buttonSizes.sm.height,
    paddingHorizontal: Theme.buttonSizes.sm.paddingHorizontal,
  },

  md: {
    height: Theme.buttonSizes.md.height,
    paddingHorizontal: Theme.buttonSizes.md.paddingHorizontal,
  },

  lg: {
    height: Theme.buttonSizes.lg.height,
    paddingHorizontal: Theme.buttonSizes.lg.paddingHorizontal,
  },

  // States
  disabled: {
    opacity: 0.5,
    backgroundColor: Theme.colors.neutral[300],
  },

  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    textAlign: 'center',
  },

  primaryText: {
    color: Theme.colors.text.inverse,
  },

  secondaryText: {
    color: Theme.colors.text.inverse,
  },

  outlineText: {
    color: Theme.colors.primary[500],
  },

  ghostText: {
    color: Theme.colors.primary[500],
  },

  dangerText: {
    color: Theme.colors.text.inverse,
  },

  smText: {
    fontSize: Theme.buttonSizes.sm.fontSize,
  },

  mdText: {
    fontSize: Theme.buttonSizes.md.fontSize,
  },

  lgText: {
    fontSize: Theme.buttonSizes.lg.fontSize,
  },

  disabledText: {
    color: Theme.colors.text.disabled,
  },

  // Icon positioning
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconLeft: {
    marginRight: Theme.spacing.sm,
  },

  iconRight: {
    marginLeft: Theme.spacing.sm,
  },
});
