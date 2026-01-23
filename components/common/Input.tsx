import { Theme } from '@/constants/Theme';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
    NativeSyntheticEvent,
    Platform,
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

export type InputSize = 'sm' | 'md' | 'lg';

export interface CustomInputProps extends TextInputProps {
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

export const Input = forwardRef((
  {
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
    multiline,
    numberOfLines,
    ...rest
  }: CustomInputProps,
  ref: React.Ref<TextInput>
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Internal ref to manage cursor position
  const inputRef = useRef<TextInput>(null);
  const cursorPositionRef = useRef<number>(0);

  // iOS specific: Store the value to force re-sync after secureTextEntry change
  const [internalValue, setInternalValue] = useState(rest.value || '');
  const isTogglingRef = useRef(false);

  // Expose the ref to parent components
  useImperativeHandle(ref, () => inputRef.current as TextInput);

  // iOS: Sync internal value with prop value
  useEffect(() => {
    if (!isTogglingRef.current && rest.value !== undefined) {
      setInternalValue(rest.value as string);
    }
  }, [rest.value]);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e as any);
    }
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e as any);
    }
  };

  // Track cursor position on selection change
  const handleSelectionChange = useCallback((event: any) => {
    if (event?.nativeEvent?.selection?.start !== undefined) {
      cursorPositionRef.current = event.nativeEvent.selection.start;
    }

    // Call parent's onSelectionChange if provided
    if (rest.onSelectionChange) {
      rest.onSelectionChange(event);
    }
  }, [rest.onSelectionChange]);

  const togglePasswordVisibility = useCallback(() => {
    if (Platform.OS === 'ios') {
      // iOS specific: Mark that we're toggling to prevent value sync issues
      isTogglingRef.current = true;

      // Store current value and cursor position BEFORE changing state
      const currentValue = rest.value as string || internalValue;
      const currentCursorPos = cursorPositionRef.current;

      setIsPasswordVisible((prev) => {
        const newVisibility = !prev;

        // iOS: Use requestAnimationFrame to ensure proper state updates
        // without losing focus or dismissing the keyboard
        requestAnimationFrame(() => {
          if (inputRef.current) {
            // Force value update using setNativeProps to maintain the text
            inputRef.current.setNativeProps({
              text: currentValue,
            });

            // Restore cursor position without changing focus
            if (currentCursorPos !== undefined) {
              requestAnimationFrame(() => {
                inputRef.current?.setNativeProps({
                  selection: {
                    start: currentCursorPos,
                    end: currentCursorPos,
                  },
                });
              });
            }

            // Reset toggling flag
            setTimeout(() => {
              isTogglingRef.current = false;
            }, 50);
          }
        });

        return newVisibility;
      });
    } else {
      // Android: Simple toggle
      setIsPasswordVisible((prev) => !prev);
    }
  }, [rest.value, internalValue]);

  const inputContainerStyles = [
    styles.inputContainer,
    !multiline && styles[size], // Only apply fixed height if not multiline
    multiline && styles.multilineContainer,
    error && styles.error, // Error takes priority over focus
    isFocused && !error && styles.focused, // Focus only when no error
    disabled && styles.disabled,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    multiline && styles.multilineInput,
    style,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer} pointerEvents="none">
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <View style={inputContainerStyles}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={Theme.iconSize.sm}
            color={
              error
                ? Theme.colors.border.error
                : isFocused
                  ? Theme.colors.border.focus
                  : Theme.colors.text.tertiary
            }
            style={[styles.leftIcon, multiline && styles.multilineIcon]}
          />
        )}

        <TextInput
          ref={inputRef}
          style={inputStyles}
          placeholderTextColor={Theme.colors.text.tertiary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSelectionChange={handleSelectionChange}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          value={Platform.OS === 'ios' && secureTextEntry ? internalValue : rest.value}
          autoCorrect={rest.autoCorrect ?? (secureTextEntry ? false : undefined)}
          autoCapitalize={rest.autoCapitalize ?? (secureTextEntry ? 'none' : undefined)}
          autoComplete={rest.autoComplete as any}
          textContentType={rest.textContentType as any}
          keyboardType={rest.keyboardType}
          submitBehavior={rest.returnKeyType === 'next' || rest.returnKeyType === 'done' ? 'submit' : 'blurAndSubmit'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...(rest as any)}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            activeOpacity={0.7}
          >
            <Icon
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={Theme.iconSize.sm}
              color={Theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={[styles.rightIcon, multiline && styles.multilineIcon]}>
            <Icon
              name={rightIcon}
              size={Theme.iconSize.sm}
              color={
                error
                  ? Theme.colors.border.error
                  : isFocused
                    ? Theme.colors.border.focus
                    : Theme.colors.text.tertiary
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText} pointerEvents="none">{error}</Text>}
      {helperText && !error && <Text style={styles.helperText} pointerEvents="none">{helperText}</Text>}
    </View>
  );
});

Input.displayName = 'Input';

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
    borderColor: Theme.colors.border.default, // Soft, professional gray (#E5E7EB)
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

  multilineContainer: {
    minHeight: Theme.inputSizes.md.height,
    paddingHorizontal: Theme.inputSizes.md.paddingHorizontal,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'flex-start', // Align items to top for multiline
  },

  focused: {
    borderColor: Theme.colors.border.focus, // Dark gray (neutral[600])
    borderWidth: 1.5,
  },

  error: {
    borderColor: Theme.colors.border.error, // Red for errors
    borderWidth: 1.5,
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

  multilineInput: {
    height: '100%',
    textAlignVertical: 'top',
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

  multilineIcon: {
    marginTop: 2, // Align icon with first line of text
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
