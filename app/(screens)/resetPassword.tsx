import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Modal, Text, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { validateEmail } from '../../scripts/validator';
import { Button, Input, KeyboardDismissWrapper } from '@/components/common';
import { Theme } from '@/constants/Theme';
import VerifyCode from './verificodeReset';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ResetPassword: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setEmailError('');
      setShowVerifyCode(false);
    }
  }, [isVisible]);

  const generateVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    const verifyData = {
      email: email,
      code: code,
    };

    const verifyResponse = await fetch(`${API_URL}/mailer/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    if (!verifyResponse.ok) {
      console.error('Failed to send verification code.');
    }
  };

  const checkUserExistence = async (userEmail: string) => {
    const url = `${API_URL}/user/verifyEmail?email=${encodeURIComponent(userEmail)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const handleNext = async () => {
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const exists = await checkUserExistence(email);

      if (exists) {
        await AsyncStorage.setItem('emailForPasswordReset', email);
        setShowVerifyCode(true);
        generateVerificationCode();
      } else {
        setEmailError('This email is not registered in our system');
      }
    } catch (error) {
      console.error('Error during password reset flow:', error);
      setEmailError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowVerifyCode(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardDismissWrapper style={styles.modalOverlay}>
        {!showVerifyCode ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Icon name="lock-closed" size={48} color={Theme.colors.primary[500]} />
                </View>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a code to reset your password
                </Text>
              </View>

              {/* Close Button */}
              <Button
                icon={<Icon name="close" size={24} color={Theme.colors.text.secondary} />}
                variant="ghost"
                onPress={onClose}
                style={styles.closeButton}
              />

              {/* Form */}
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="johndoe@example.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={onClose}
                    style={styles.cancelButton}
                  />

                  <Button
                    title="Send Code"
                    variant="primary"
                    onPress={handleNext}
                    loading={loading}
                    style={styles.sendButton}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <VerifyCode
            isVisible={isVisible}
            onClose={onClose}
            onBack={handleBack}
            verificationCode={verificationCode}
          />
        )}
      </KeyboardDismissWrapper>
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

  closeButton: {
    position: 'absolute',
    top: Theme.spacing.base,
    right: Theme.spacing.base,
    width: 40,
    height: 40,
  },

  form: {
    width: '100%',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },

  cancelButton: {
    flex: 1,
  },

  sendButton: {
    flex: 1,
  },
});

export default ResetPassword;
