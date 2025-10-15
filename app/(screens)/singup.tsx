import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Button, Input } from '@/components/common';
import { Theme } from '@/constants/Theme';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { validateEmail } from '../../scripts/validator';
import VerifyCode from './verificode';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  // State management
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [exist, setExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Hooks
  const { dismissKeyboard } = useKeyboard();
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  // Reset form when modal opens
  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setEmailError('');
      setShowVerifyCode(false);
      setExist(false);
    }
  }, [isVisible]);

  // Generate and send verification code
  const generateVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    const verifyData = {
      email: email,
      code: code,
    };

    try {
      await fetch(`${API_URL}/mailer/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyData),
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  // Verify if user exists
  const verificarUsuario = async (valor: string): Promise<boolean> => {
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

  // Handle continue button
  const handleNext = async () => {
    // Reset errors
    setEmailError('');
    setExist(false);

    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const existe = await verificarUsuario(email);

      if (existe) {
        setExist(true);
        // setEmailError('This email is already registered');
      } else {
        await AsyncStorage.setItem('emailForSignIn', email);
        await generateVerificationCode();
        setShowVerifyCode(true);
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setEmailError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back from verification
  const handleBack = () => {
    setShowVerifyCode(false);
  };

  // Handle close modal
  const handleClose = () => {
    dismissKeyboard();
    onClose();
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (!loading) {
      handleClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.keyboardAvoidingView}>
              {!showVerifyCode ? (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={styles.innerContainer}
                  keyboardVerticalOffset={0}
                  enabled={Platform.OS === 'ios'}
                >
                  <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  >
                    <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                      <Text style={styles.title}>Create Account</Text>
                      <Text style={styles.subtitle}>Enter your email to get started</Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                      onPress={handleClose}
                      style={styles.closeButton}
                      activeOpacity={0.7}
                      disabled={loading}
                    >
                      <Ionicons 
                        name="close" 
                        size={24} 
                        color={Theme.colors.neutral[500]} 
                      />
                    </TouchableOpacity>

                    {/* Form */}
                    <View style={styles.form}>
                      <Input
                        label="Email Address"
                        placeholder="johndoe@gmail.com"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          setEmailError('');
                          setExist(false);
                        }}
                        error={emailError}
                        leftIcon="mail-outline"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={handleNext}
                      />

                      {exist && (
                        <View style={styles.errorContainer}>
                          <Ionicons 
                            name="alert-circle" 
                            size={20} 
                            color={Theme.colors.error[500]} 
                          />
                          <Text style={styles.errorMessage}>
                            This email is already registered.{'\n'}
                            Please sign in instead.
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
                          onPress={handleClose}
                          disabled={loading}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
                </KeyboardAvoidingView>
              ) : (
                <VerifyCode
                  verificationCode={verificationCode}
                  onBack={handleBack}
                  email={email}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'flex-end',
  },

  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  content: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['3xl'],
    borderTopRightRadius: Theme.borderRadius['3xl'],
    paddingTop: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Platform.select({
      ios: Theme.spacing.xl,
      android: Theme.spacing.lg,
    }),
    minHeight: '65%',
    maxHeight: '90%',
    ...Theme.shadows.xl,
  },

  header: {
    marginBottom: Theme.spacing.xl,
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
    lineHeight: Theme.typography.lineHeight.lg,
  },

  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    width: 40,
    height: 40,
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Theme.shadows.sm,
  },

  form: {
    flex: 1,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.error[100],
  },

  errorMessage: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.error[700],
    lineHeight: Theme.typography.lineHeight.sm,
  },

  continueButton: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },

  footerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
});

export default SignUp;
