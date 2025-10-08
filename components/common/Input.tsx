import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Theme } from '@/constants/Theme';

export type InputSize = 'sm' | 'md' | 'lg';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  disabled = false,
  required = false,
  style,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const inputContainerStyles = [
    styles.inputContainer,
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    style,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <View style={inputContainerStyles}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={Theme.iconSize.sm}
            color={isFocused ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={inputStyles}
          placeholderTextColor={Theme.colors.text.tertiary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Icon
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={Theme.iconSize.sm}
              color={Theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon
              name={rightIcon}
              size={Theme.iconSize.sm}
              color={isFocused ? Theme.colors.primary[500] : Theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.base,
  },

  labelContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
  },

  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
  },

  required: {
    color: Theme.colors.error[500],
    marginLeft: 2,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border.default,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },

  sm: {
    height: Theme.inputSizes.sm.height,
    paddingHorizontal: Theme.inputSizes.sm.paddingHorizontal,
  },

  md: {
    height: Theme.inputSizes.md.height,
    paddingHorizontal: Theme.inputSizes.md.paddingHorizontal,
  },

  lg: {
    height: Theme.inputSizes.lg.height,
    paddingHorizontal: Theme.inputSizes.lg.paddingHorizontal,
  },

  focused: {
    borderColor: Theme.colors.primary[500],
    borderWidth: 1.5,
  },

  error: {
    borderColor: Theme.colors.error[500],
  },

  disabled: {
    backgroundColor: Theme.colors.neutral[100],
    opacity: 0.6,
  },

  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    padding: 0,
  },

  inputWithLeftIcon: {
    marginLeft: Theme.spacing.xs,
  },

  inputWithRightIcon: {
    marginRight: Theme.spacing.xs,
  },

  leftIcon: {
    marginRight: Theme.spacing.xs,
  },

  rightIcon: {
    marginLeft: Theme.spacing.xs,
    padding: Theme.spacing.xs,
  },

  errorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.error[500],
    marginTop: Theme.spacing.xs,
  },

  helperText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
  },
});
