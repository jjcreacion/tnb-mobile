import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Button, Input } from '@/components/common';
import { Theme } from '@/constants/Theme';

interface SetNewPasswordProps {
  isVisible: boolean;
  onClose: () => void;
}

const SetNewPassword: React.FC<SetNewPasswordProps> = ({ isVisible, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  const validatePassword = () => {
    let isValid = true;

    // Reset errors
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate new password
    if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters long');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setNewPasswordError('Password must contain uppercase, lowercase and number');
      isValid = false;
    }

    // Validate confirm password
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    let userEmail = '';

    try {
      userEmail = await AsyncStorage.getItem('emailForPasswordReset') || '';
      if (!userEmail) {
        Alert.alert('Error', 'User email not found. Please restart the password reset process.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error getting email from AsyncStorage:', error);
      Alert.alert('Error', 'Could not retrieve user information. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your password has been successfully changed!',
          [{ text: 'OK', onPress: onClose }]
        );
        await AsyncStorage.removeItem('emailForPasswordReset');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Icon name="key" size={48} color={Theme.colors.primary[500]} />
              </View>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password to secure your account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewPasswordError('');
                }}
                error={newPasswordError}
                leftIcon="lock-closed-outline"
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                error={confirmPasswordError}
                leftIcon="lock-closed-outline"
                secureTextEntry
                autoCapitalize="none"
                onBlur={validatePassword}
              />

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementItem}>
                  <Icon
                    name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={newPassword.length >= 8 ? Theme.colors.success[500] : Theme.colors.text.tertiary}
                  />
                  <Text style={[
                    styles.requirementText,
                    newPassword.length >= 8 && styles.requirementTextMet
                  ]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Icon
                    name={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? Theme.colors.success[500] : Theme.colors.text.tertiary}
                  />
                  <Text style={[
                    styles.requirementText,
                    /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) && styles.requirementTextMet
                  ]}>
                    Uppercase and lowercase letters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Icon
                    name={/(?=.*\d)/.test(newPassword) ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={/(?=.*\d)/.test(newPassword) ? Theme.colors.success[500] : Theme.colors.text.tertiary}
                  />
                  <Text style={[
                    styles.requirementText,
                    /(?=.*\d)/.test(newPassword) && styles.requirementTextMet
                  ]}>
                    At least one number
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  icon={<Icon name="close" size={20} color={Theme.colors.primary[500]} />}
                  iconPosition="left"
                  style={styles.cancelButton}
                />

                <Button
                  title="Reset Password"
                  variant="primary"
                  onPress={handleChangePassword}
                  loading={loading}
                  disabled={!newPassword || !confirmPassword}
                  icon={<Icon name="checkmark" size={20} color={Theme.colors.text.inverse} />}
                  iconPosition="right"
                  style={styles.resetButton}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '100%',
    paddingHorizontal: Theme.spacing.base,
  },

  content: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing['2xl'],
    ...Theme.shadows.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },

  title: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.base,
  },

  form: {
    width: '100%',
  },

  requirementsContainer: {
    backgroundColor: Theme.colors.background.secondary,
    padding: Theme.spacing.base,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
  },

  requirementsTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },

  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },

  requirementText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },

  requirementTextMet: {
    color: Theme.colors.success[700],
    fontWeight: Theme.typography.fontWeight.medium,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },

  cancelButton: {
    flex: 1,
  },

  resetButton: {
    flex: 2,
  },
});

export default SetNewPassword;
