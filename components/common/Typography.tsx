import { Theme } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'button' 
  | 'overline';

export type TypographyColor = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'inverse' 
  | 'disabled'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'primary',
  style,
  children,
  ...rest
}) => {
  const textStyles = [
    styles.base,
    styles[variant],
    styles[`${color}Color` as keyof typeof styles],
    style,
  ];

  return (
    <Text style={textStyles} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Theme.typography.fontFamily.regular,
  },

  // Variants
  h1: {
    fontSize: Theme.typography.fontSize['4xl'],
    lineHeight: Theme.typography.lineHeight['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
  },

  h2: {
    fontSize: Theme.typography.fontSize['3xl'],
    lineHeight: Theme.typography.lineHeight['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
  },

  h3: {
    fontSize: Theme.typography.fontSize['2xl'],
    lineHeight: Theme.typography.lineHeight['2xl'],
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  h4: {
    fontSize: Theme.typography.fontSize.xl,
    lineHeight: Theme.typography.lineHeight.xl,
    fontWeight: Theme.typography.fontWeight.semiBold,
  },

  body1: {
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.lineHeight.base,
    fontWeight: Theme.typography.fontWeight.regular,
  },

  body2: {
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.lineHeight.sm,
    fontWeight: Theme.typography.fontWeight.regular,
  },

  caption: {
    fontSize: Theme.typography.fontSize.xs,
    lineHeight: Theme.typography.lineHeight.xs,
    fontWeight: Theme.typography.fontWeight.regular,
  },

  button: {
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.lineHeight.base,
    fontWeight: Theme.typography.fontWeight.semiBold,
    letterSpacing: 0.5,
  },

  overline: {
    fontSize: Theme.typography.fontSize.xs,
    lineHeight: Theme.typography.lineHeight.xs,
    fontWeight: Theme.typography.fontWeight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Colors
  primaryColor: {
    color: Theme.colors.text.primary,
  },

  secondaryColor: {
    color: Theme.colors.text.secondary,
  },

  tertiaryColor: {
    color: Theme.colors.text.tertiary,
  },

  inverseColor: {
    color: Theme.colors.text.inverse,
  },

  disabledColor: {
    color: Theme.colors.text.disabled,
  },

  errorColor: {
    color: Theme.colors.error[500],
  },

  successColor: {
    color: Theme.colors.success[500],
  },

  warningColor: {
    color: Theme.colors.warning[500],
  },

  infoColor: {
    color: Theme.colors.info[500],
  },
});