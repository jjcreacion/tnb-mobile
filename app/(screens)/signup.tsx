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
import TermsAndPolicies from './TermsAndPolicies';
import VerifyCode from './verificode';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// Interfaz para la respuesta exitosa del API de referido
interface ReferralData {
  email: string;
  firstName: string;
  lastName: string;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [noReferralCode, setNoReferralCode] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [referralCodeError, setReferralCodeError] = useState('');
  const [exist, setExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const referralCodeRef = useRef<TextInput>(null); // Ref para Código de Referido

  const { dismissKeyboard } = useKeyboard();
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setReferralCode('');
      setNoReferralCode(false);
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setReferralCodeError('');
      setShowVerifyCode(false);
      setExist(false);
      setShowTermsModal(false); // Reiniciar estado del modal de términos
    }
  }, [isVisible]);

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
      // Asumimos true por seguridad si hay un error de red
      return true;
    }
  };

  /**
   * Nueva función para verificar el código de referido contra el API
   */
  const verifyReferralCodeApi = async (code: string): Promise<ReferralData> => {
    const ruta = `${API_URL}/user/verifyReferralCode/${encodeURIComponent(code)}`;

    try {
      const respuesta = await fetch(ruta, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (respuesta.status === 404) {
        // Código no encontrado o no válido
        throw new Error('NOT_FOUND');
      }

      if (!respuesta.ok) {
        // Otros errores del servidor
        throw new Error(`Server Error: ${respuesta.status}`);
      }

      const datos: ReferralData = await respuesta.json();
      return datos;
    } catch (error) {
      throw error;
    }
  };

  const handleNext = async () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setReferralCodeError('');
    setExist(false);

    // 1. Validaciones de campos requeridos (Email, Password)
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match');
      return;
    }

    // 2. Validación de código de referido
    if (!noReferralCode && !referralCode.trim()) {
      setReferralCodeError('Please enter a referral code or check the box');
      return;
    }

    setLoading(true);
    let referralDataToStore: {
      code: string;
      refereeEmail: string;
      refereeFullName: string;
    } | null = null;

    // 3. Si se proporciona un código, verificarlo
    if (!noReferralCode && referralCode.trim()) {
      try {
        const data = await verifyReferralCodeApi(referralCode.trim());
        const fullName = `${data.firstName} ${data.lastName}`;

        referralDataToStore = {
          code: referralCode.trim(),
          refereeEmail: data.email,
          refereeFullName: fullName,
        };
        // No hay error, proceed
      } catch (error) {
        // Si el API retorna error (ej. 404 NOT_FOUND)
        setReferralCodeError(
          'Invalid referral code. Please check the code or select "I don\'t have a referral code"',
        );
        setLoading(false);
        return; // Detener el proceso si el código es inválido
      }
    }

    // 4. Verificar si el email ya existe
    try {
      const existe = await verificarUsuario(email);

      if (existe) {
        setExist(true);
      } else {
        // 5. Almacenar datos en AsyncStorage y avanzar a la verificación

        await AsyncStorage.setItem('emailForSignIn', email);
        await AsyncStorage.setItem('passwordForSignUp', password);

        // Limpiar/Establecer datos de referido
        await AsyncStorage.removeItem('referreeEmail'); // Corregir si el nombre anterior era incorrecto
        await AsyncStorage.removeItem('refereeFullName');
        await AsyncStorage.removeItem('referralCodeForSignUp');

        if (referralDataToStore) {
          // Si el código fue validado exitosamente
          await AsyncStorage.setItem('referralCodeForSignUp', referralDataToStore.code);
          await AsyncStorage.setItem('refereeEmail', referralDataToStore.refereeEmail);
          await AsyncStorage.setItem('refereeFullName', referralDataToStore.refereeFullName);
        }

        await generateVerificationCode();
        setShowVerifyCode(true);
      }
    } catch (error) {
      console.error('Error during signup process:', error);
      setEmailError(`We couldn't complete the request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTerms = () => {
    dismissKeyboard();
    setShowTermsModal(true);
  };

  const handleCloseTerms = () => {
    setShowTermsModal(false);
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
        {!showVerifyCode && !showTermsModal && (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdropArea} />
          </TouchableWithoutFeedback>
        )}

        <View style={styles.keyboardAvoidingView}>
          {!showVerifyCode && !showTermsModal ? (
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
                  <View style={styles.header} pointerEvents="box-none">
                    <Text style={styles.title} pointerEvents="none">
                      Create Your Account
                    </Text>
                    <Text style={styles.subtitle} pointerEvents="none">
                      Let's get you started!
                    </Text>
                  </View>

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
                      returnKeyType="next"
                      onSubmitEditing={() => referralCodeRef.current?.focus()}
                    />

                    <Input
                      ref={referralCodeRef}
                      label="Referral Code (Optional)"
                      placeholder="Enter code"
                      value={referralCode}
                      onChangeText={(text) => {
                        setReferralCode(text);
                        setReferralCodeError('');
                      }}
                      error={referralCodeError}
                      leftIcon="person-add-outline"
                      autoCapitalize="none"
                      editable={!loading && !noReferralCode}
                      returnKeyType="go"
                      onSubmitEditing={handleNext}
                      containerStyle={styles.referralInput}
                    />

                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => {
                        setNoReferralCode(!noReferralCode);
                        if (!noReferralCode) {
                          setReferralCode('');
                          setReferralCodeError('');
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          noReferralCode && styles.checkedCheckbox,
                        ]}
                      >
                        {noReferralCode && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={Theme.colors.text.inverse}
                          />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        I don't have a referral code
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.termsContainer}>
                      <Text style={styles.termsText}>
                        By creating an account on our app, you are accepting our{' '}
                        <Text
                          style={styles.termsLink}
                          onPress={handleOpenTerms}
                        >
                          terms and conditions
                        </Text>
                        .
                      </Text>
                    </View>
                  
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
                      <Text style={styles.footerText} pointerEvents="none">
                        Already have an account?{' '}
                      </Text>
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
          ) : showVerifyCode ? (
            <VerifyCode
              verificationCode={verificationCode}
              onBack={handleBack}
              email={email}
            />
          ) : (
            <TermsAndPolicies isVisible={showTermsModal} onClose={handleCloseTerms} />
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
    flex: 1,
    justifyContent: 'flex-end',
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
    padding: Theme.spacing.sm,
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
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },

  footerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
  },

  referralInput: {
    marginBottom: Theme.spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.primary,
  },
  checkedCheckbox: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  checkboxLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  termsContainer: {
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.base,
  },
  termsLink: {
    color: Theme.colors.primary[600],
    fontWeight: Theme.typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
});

export default SignUp;