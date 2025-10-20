import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [exist, setExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Refs for keyboard navigation (iOS)
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Hooks
  const { dismissKeyboard } = useKeyboard();
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  // Reset form when modal opens
  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setShowVerifyCode(false);
      setExist(false);
    }
  }, [isVisible]);

  // Generate and send verification code
  const generateVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    console.log('Generated verification code:', code);
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
    setPasswordError('');
    setConfirmPasswordError('');
    setExist(false);

    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    // Validate password
    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match');
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
        await AsyncStorage.setItem('passwordForSignUp', password);
        await generateVerificationCode();
        setShowVerifyCode(true);
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setEmailError(`We couldn't verify your email. Please try again.`);
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
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdropArea} />
        </TouchableWithoutFeedback>

        <View style={styles.keyboardAvoidingView}>
          {!showVerifyCode ? (
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.innerContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                  <View style={styles.content}>
                    <ScrollView
                      contentContainerStyle={styles.scrollContent}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      bounces={true}
                    >
                      {/* Header */}
                      <View style={styles.header} pointerEvents="box-none">
                        <Text style={styles.title} pointerEvents="none">Create Your Account</Text>
                        <Text style={styles.subtitle} pointerEvents="none">Let's get you started!</Text>
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
                      <View style={styles.form} pointerEvents="box-none">
                        <Input
                          ref={emailRef}
                          label="Email Address"
                          placeholder="you@example.com"
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
                          returnKeyType="next"
                          onSubmitEditing={() => passwordRef.current?.focus()}
                        />

                        <Input
                          ref={passwordRef}
                          label="Password"
                          placeholder="Enter your password"
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError('');
                          }}
                          error={passwordError}
                          leftIcon="lock-closed-outline"
                          secureTextEntry={true}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="new-password"
                          textContentType="newPassword"
                          editable={!loading}
                          returnKeyType="next"
                          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        />

                        <Input
                          ref={confirmPasswordRef}
                          label="Confirm Password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChangeText={(text) => {
                            setConfirmPassword(text);
                            setConfirmPasswordError('');
                          }}
                          error={confirmPasswordError}
                          leftIcon="lock-closed-outline"
                          secureTextEntry={true}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="new-password"
                          textContentType="newPassword"
                          editable={!loading}
                          returnKeyType="go"
                          onSubmitEditing={handleNext}
                        />

                        {exist && (
                          <View style={styles.errorContainer} pointerEvents="none">
                            <Ionicons
                              name="alert-circle"
                              size={20}
                              color={Theme.colors.error[500]}
                            />
                            <Text style={styles.errorMessage}>
                              This email is already in use.{'\n'}
                              Please sign in or use a different email.
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

                        <View style={styles.footer} pointerEvents="box-none">
                          <Text style={styles.footerText} pointerEvents="none">Already have an account? </Text>
                          <Button
                            title="Sign In"
                            variant="ghost"
                            size="sm"
                            onPress={handleClose}
                            disabled={loading}
                          />
                        </View>
                      </View>
                    </ScrollView>
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

  backdropArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  keyboardAvoidingView: {
    justifyContent: 'flex-end',
    maxHeight: '90%',
  },

  innerContainer: {
    justifyContent: 'flex-end',
    maxHeight: '90%',
  },

  content: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['3xl'],
    borderTopRightRadius: Theme.borderRadius['3xl'],
    maxHeight: '100%',
    overflow: 'hidden',
    ...Theme.shadows.xl,
  },

  scrollContent: {
    paddingTop: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.xl,
    paddingBottom: Platform.select({
      ios: Theme.spacing['3xl'],
      android: Theme.spacing['2xl'],
    }),
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
    width: '100%',
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
    marginBottom: Theme.spacing.md,
  },

  footerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },
});

export default SignUp;
