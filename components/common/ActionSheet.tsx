import { Theme } from '@/constants/Theme';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomSheet } from './BottomSheet';
import { Typography } from './Typography';

export interface ActionSheetOption {
  id: string;
  title: string;
  icon?: string;
  iconColor?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  showCancel?: boolean;
  cancelText?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  message,
  options,
  showCancel = true,
  cancelText = 'Cancel',
}) => {
  const handleOptionPress = (option: ActionSheetOption) => {
    if (!option.disabled) {
      option.onPress();
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      dismissOnBackdrop={true}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        {(title || message) && (
          <View style={styles.header}>
            {title && (
              <Typography variant="h4" color="primary" style={styles.title}>
                {title}
              </Typography>
            )}
            {message && (
              <Typography variant="body2" color="secondary" style={styles.message}>
                {message}
              </Typography>
            )}
          </View>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                option.disabled && styles.optionDisabled,
                index === options.length - 1 && styles.lastOption,
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={option.disabled ? 1 : 0.7}
            >
              <View style={styles.optionContent}>
                {option.icon && (
                  <Icon
                    name={option.icon}
                    size={20}
                    color={
                      option.disabled
                        ? Theme.colors.text.disabled
                        : option.destructive
                        ? Theme.colors.error[500]
                        : option.iconColor || Theme.colors.text.primary
                    }
                    style={styles.optionIcon}
                  />
                )}
                <Typography
                  variant="body1"
                  color={
                    option.disabled
                      ? 'disabled'
                      : option.destructive
                      ? 'error'
                      : 'primary'
                  }
                  style={styles.optionText}
                >
                  {option.title}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        {showCancel && (
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Typography variant="body1" color="secondary" style={styles.cancelText}>
                {cancelText}
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: Theme.spacing.lg,
    alignItems: 'center',
  },

  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },

  message: {
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
  },

  optionsContainer: {
    marginBottom: Theme.spacing.lg,
  },

  option: {
    paddingVertical: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  lastOption: {
    borderBottomWidth: 0,
  },

  optionDisabled: {
    opacity: 0.5,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIcon: {
    marginRight: Theme.spacing.md,
  },

  optionText: {
    flex: 1,
  },

  cancelContainer: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
  },

  cancelButton: {
    paddingVertical: Theme.spacing.base,
    alignItems: 'center',
  },

  cancelText: {
    fontWeight: Theme.typography.fontWeight.semiBold,
  },
});