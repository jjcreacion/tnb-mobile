import { Button, Input, Screen } from '@/components/common';
import { Theme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Yup from 'yup';
import ResetModal from './resetPassword';
import SignUpModal from './singup';

const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_URL}/user/loginWithEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.accessToken) {
        AsyncStorage.setItem('accessToken', data.accessToken);
        AsyncStorage.setItem('userId', String(data.pkUser));
        router.push('/(tabs)');
      } else {
        setErrorMessage(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Unable to connect to the server. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/ingenieros.jpeg')}
      style={styles.backgroundImage}
      blurRadius={10}
    >
      <LinearGradient
       colors={['rgba(230, 57, 70, 0.2)', 'rgba(230, 57, 70, 0.3)', 'rgba(230, 57, 70, 0.6)']}
        style={styles.overlay}
      />

      <Screen safeArea={true} edges={['top', 'bottom']} style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Logo Section */}
            <Animatable.View
              animation="fadeInDown"
              duration={1000}
              style={styles.logoContainer}
            >
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={2000}
              >
                <Image
                  source={require('../../assets/images/icon-tnb.png')}
                  style={styles.logo}
                />
              </Animatable.View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </Animatable.View>

            {/* Form Section */}
            <Animatable.View
              animation="fadeInUp"
              duration={1000}
              delay={300}
              style={styles.formContainer}
            >
              <View style={styles.card}>
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleLogin}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <>
                      <Input
                        placeholder="Email address"
                        leftIcon="mail-outline"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email ? errors.email : undefined}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />

                      <Input
                        placeholder="Password"
                        leftIcon="lock-closed-outline"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password ? errors.password : undefined}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="password"
                      />

                      {errorMessage ? (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                      ) : null}

                      <Button
                        title="Sign In"
                        onPress={() => handleSubmit()}
                        loading={loading}
                        fullWidth
                        size="lg"
                        variant="primary"
                        style={styles.loginButton}
                      />

                      <Button
                        title="Forgot Password?"
                        onPress={() => setResetModalVisible(true)}
                        variant="ghost"
                        size="sm"
                        style={styles.forgotButton}
                      />
                    </>
                  )}
                </Formik>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Create New Account"
                  onPress={() => setSignUpModalVisible(true)}
                  variant="outline"
                  fullWidth
                  size="lg"
                  style={styles.signupButton}
                />
              </View>
            </Animatable.View>
          </View>
        </KeyboardAvoidingView>
      </Screen>

      <SignUpModal
        isVisible={isSignUpModalVisible}
        onClose={() => setSignUpModalVisible(false)}
      />
      <ResetModal
        isVisible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  screen: {
    backgroundColor: 'transparent',
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing['2xl'],
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing['4xl'],
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: Theme.spacing.lg,
  },

  welcomeText: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.inverse,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },

  formContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: Theme.spacing.xl,
  },

  card: {
    backgroundColor: Theme.colors.surface.primary,
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing.xl,
    ...Theme.shadows.xl,
  },

  loginButton: {
    marginTop: Theme.spacing.md,
  },

  forgotButton: {
    marginTop: Theme.spacing.sm,
  },

  errorContainer: {
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.base,
    marginBottom: Theme.spacing.md,
  },

  errorText: {
    color: Theme.colors.error[600],
    fontSize: Theme.typography.fontSize.sm,
    textAlign: 'center',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border.default,
  },

  dividerText: {
    marginHorizontal: Theme.spacing.md,
    color: Theme.colors.text.tertiary,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },

  signupButton: {
    borderWidth: 1.5,
  },
});
