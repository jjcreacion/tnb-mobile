import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Input } from '@/components/common';
import { Theme } from '@/constants/Theme';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { validateEmail } from '../../scripts/validator';
import VerifyCode from './verificode';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [exist, setExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setEmailError('');
      setShowVerifyCode(false);
      setExist(false);
    }
  }, [isVisible]);

  const generateVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    const verifyData = {
      email: email,
      code: code,
    };

    await fetch(`${API_URL}/mailer/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });
  };

  const verificarUsuario = async (valor: string) => {
    const ruta = `${API_URL}/user/verifyEmail?email=${encodeURIComponent(valor)}`;

    try {
      const respuesta = await fetch(ruta, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}`);
      }
      const datos = await respuesta.json();
      return datos.exists;
    } catch (error) {
      console.error('Error verificando email:', error);
      return true;
    }
  };

  const handleNext = async () => {
    setEmailError('');
    setExist(false);

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const existe = await verificarUsuario(email);

      if (existe) {
        setExist(true);
        setEmailError('This email is already registered');
      } else {
        await AsyncStorage.setItem('emailForSignIn', email);
        setShowVerifyCode(true);
        generateVerificationCode();
      }
    } catch (error) {
      console.error('Error verificando email:', error);
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
      <View style={styles.modalOverlay}>
        {!showVerifyCode ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Enter your email to get started</Text>
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
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                {exist && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={20} color={Theme.colors.error[500]} />
                    <Text style={styles.errorMessage}>
                      This email is already registered. Please sign in instead.
                    </Text>
                  </View>
                )}

                <Button
                  title="Continue"
                  onPress={handleNext}
                  loading={loading}
                  fullWidth
                  size="lg"
                  variant="primary"
                  style={styles.continueButton}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Button
                    title="Sign In"
                    variant="ghost"
                    size="sm"
                    onPress={onClose}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <VerifyCode
            verificationCode={verificationCode}
            onBack={handleBack}
            email={email}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'flex-end',
  },

  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  content: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['3xl'],
    borderTopRightRadius: Theme.borderRadius['3xl'],
    paddingTop: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? Theme.spacing['4xl'] : Theme.spacing.xl,
    minHeight: '60%',
    ...Theme.shadows.xl,
  },

  header: {
    marginBottom: Theme.spacing['2xl'],
  },

  title: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
  },

  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 40,
    height: 40,
  },

  form: {
    flex: 1,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },

  errorMessage: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.error[600],
  },

  continueButton: {
    marginTop: Theme.spacing.md,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },

  footerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
});

export default SignUp;
