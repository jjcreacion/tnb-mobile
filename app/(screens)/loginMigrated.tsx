import { Button, Input, Loading, Screen, Typography } from '@/components/common';
import { GradientMigration } from '@/constants/ColorMigration';
import { Theme } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
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

export default function LoginScreenMigrated() {
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
        colors={GradientMigration.overlayGradient as any}
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
              
              <Typography variant="h2" color="inverse" style={styles.welcomeText}>
                Welcome Back
              </Typography>
              
              <Typography variant="body1" color="inverse" style={styles.subtitle}>
                Sign in to continue
              </Typography>
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
                          <Typography variant="body2" color="error" style={styles.errorText}>
                            {errorMessage}
                          </Typography>
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

                      {/* Forgot Password */}
                      <TouchableOpacity 
                        onPress={() => setResetModalVisible(true)}
                        style={styles.forgotPasswordContainer}
                      >
                        <Typography variant="body2" color="primary" style={styles.forgotPassword}>
                          Forgot Password?
                        </Typography>
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>
              </View>
            </Animatable.View>

            {/* Footer Actions */}
            <Animatable.View
              animation="fadeInUp"
              duration={1000}
              delay={600}
              style={styles.footer}
            >
              <TouchableOpacity onPress={() => setSignUpModalVisible(true)}>
                <Typography variant="body1" color="inverse" style={styles.signUpText}>
                  Don't have an account?{' '}
                  <Typography variant="body1" color="inverse" style={styles.signUpLink}>
                    Sign Up
                  </Typography>
                </Typography>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </KeyboardAvoidingView>

        {/* Loading Overlay */}
        <Loading
          visible={loading}
          variant="overlay"
          message="Signing in..."
          size="lg"
        />

        {/* Modals */}
        <SignUpModal 
          isVisible={isSignUpModalVisible} 
          onClose={() => setSignUpModalVisible(false)} 
        />
        
        <ResetModal 
          isVisible={resetModalVisible} 
          onClose={() => setResetModalVisible(false)} 
        />
      </Screen>
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
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },

  formContainer: {
    paddingHorizontal: Theme.spacing.lg,
  },

  card: {
    backgroundColor: `${Theme.colors.background.primary}F0`, // 94% opacity
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing['2xl'],
    ...Theme.shadows.xl,
    backdropFilter: 'blur(10px)', // For web
  },

  errorContainer: {
    marginVertical: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: `${Theme.colors.error[50]}E6`, // 90% opacity
    borderRadius: Theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error[500],
  },

  errorText: {
    textAlign: 'center',
  },

  loginButton: {
    marginTop: Theme.spacing.lg,
  },

  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },

  forgotPassword: {
    textDecorationLine: 'underline',
  },

  footer: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },

  signUpText: {
    textAlign: 'center',
  },

  signUpLink: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    textDecorationLine: 'underline',
  },
});