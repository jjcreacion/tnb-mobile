import { Button, Input, Loading, Screen, Typography } from '@/components/common';
import { MigratedStyles } from '@/constants/MigratedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    TextInput,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Yup from 'yup';
import ResetModal from './resetPassword';
import SignUpModal from './signup';

const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Please enter your email'),
  password: Yup.string()
    .required('Please enter your password')
    // .min(6, 'Password must be at least 6 characters'),
});

export default function LoginScreenMigrated() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // Referencias para navegación del teclado
  const passwordInputRef = useRef<TextInput>(null);

    useEffect(() => {
      // Hide status bar only on Android for splash screen
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false);
      }
  
      // Clean up: restore status bar visibility when component unmounts (Android only)
      return () => {
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false);
        }
      };
    }, []);

  // Configure StatusBar to be transparent only on this screen (Android)
  useFocusEffect(
    useCallback(() => {
      // This will apply when the screen comes into focus
      return () => {
        // This cleanup function runs when the screen loses focus
        // The StatusBar will automatically reset to app default when navigating away
      };
    }, [])
  );

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
        await Promise.all([
          AsyncStorage.setItem('accessToken', data.accessToken),
          AsyncStorage.setItem('userId', String(data.pkUser))
        ]);
        
        if (Platform.OS === 'android') {
          Keyboard.dismiss();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        router.push('/(tabs)');
      } else {
        setErrorMessage(`Email or password incorrect.\nPlease try again.`);
      }
    } catch (error) {
      setErrorMessage('Connection failed. Please check your internet and try again.');
      console.log('SERVER OFFLINE? Login error:', error);
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
      {/* StatusBar transparent only for login screen on Android */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      <LinearGradient
       colors={['rgba(230, 57, 70, 0.2)', 'rgba(230, 57, 70, 0.3)', 'rgba(230, 57, 70, 0.6)']}
        style={MigratedStyles.loginOverlay}
      />

      <Screen 
        safeArea={true} 
        edges={Platform.OS === 'android' ? ['bottom'] : ['top', 'bottom']} 
        style={MigratedStyles.loginScreen}
      >
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
                  source={require('../../assets/images/icon.png')}
                  style={MigratedStyles.loginLogo}
                />
              </Animatable.View>
              
              <Typography variant="h2" color="inverse" style={MigratedStyles.loginWelcomeText}>
                Welcome Back!
              </Typography>
              
              <Typography variant="body1" color="inverse" style={MigratedStyles.loginSubtitle}>
                Sign in to get started
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
                        textContentType="username"
                        returnKeyType='next'
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        blurOnSubmit={false}
                      />

                      <Input
                        ref={passwordInputRef}
                        placeholder="Password"
                        leftIcon="lock-closed-outline"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password ? errors.password : undefined}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoComplete="password"
                        textContentType="password"
                        returnKeyType='go'
                        onSubmitEditing={() => handleSubmit() }
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
                        title="Forgot your password?"
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
                  title="Create Account"
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
          message="Signing you in..."
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

