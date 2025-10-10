import { Button, Input, Loading, Screen, Typography } from '@/components/common';
import { MigratedStyles } from '@/constants/MigratedStyles';
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
      style={MigratedStyles.loginBackgroundImage}
      blurRadius={10}
    >
      <LinearGradient
       colors={['rgba(230, 57, 70, 0.2)', 'rgba(230, 57, 70, 0.3)', 'rgba(230, 57, 70, 0.6)']}
        style={MigratedStyles.loginOverlay}
      />

      <Screen safeArea={true} edges={['top', 'bottom']} style={MigratedStyles.loginScreen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={MigratedStyles.loginKeyboardView}
        >
          <View style={MigratedStyles.loginContainer}>
            {/* Logo Section */}
            <Animatable.View
              animation="fadeInDown"
              duration={1000}
              style={MigratedStyles.loginLogoContainer}
            >
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={2000}
              >
                <Image
                  source={require('../../assets/images/icon-tnb.png')}
                  style={MigratedStyles.loginLogo}
                />
              </Animatable.View>
              
              <Typography variant="h2" color="inverse" style={MigratedStyles.loginWelcomeText}>
                Welcome Back
              </Typography>
              
              <Typography variant="body1" color="inverse" style={MigratedStyles.loginSubtitle}>
                Sign in to continue
              </Typography>
            </Animatable.View>

            {/* Form Section */}
            <Animatable.View
              animation="fadeInUp"
              duration={1000}
              delay={300}
              style={MigratedStyles.loginFormContainer}
            >
              <View style={MigratedStyles.loginCard}>
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
                        <View style={MigratedStyles.loginErrorContainer}>
                          <Typography variant="body2" color="error" style={MigratedStyles.loginErrorText}>
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
                        style={MigratedStyles.loginButton}
                      />

                      <Button
                        title="Forgot Password?"
                        onPress={() => setResetModalVisible(true)}
                        variant="ghost"
                        size="sm"
                        style={MigratedStyles.loginForgotButton}
                      />
                    </>
                  )}
                </Formik>

                <View style={MigratedStyles.loginDivider}>
                  <View style={MigratedStyles.loginDividerLine} />
                  <Typography variant="body2" color="tertiary" style={MigratedStyles.loginDividerText}>
                    OR
                  </Typography>
                  <View style={MigratedStyles.loginDividerLine} />
                </View>

                <Button
                  title="Create New Account"
                  onPress={() => setSignUpModalVisible(true)}
                  variant="outline"
                  fullWidth
                  size="lg"
                  style={MigratedStyles.loginSignupButton}
                />
              </View>
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

