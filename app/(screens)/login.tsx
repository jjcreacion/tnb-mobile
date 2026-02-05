import { Button, Input, Loading, Screen, Typography } from '@/components/common';
import { MigratedStyles } from '@/constants/MigratedStyles';
import { credentialsService } from '@/services/credentialsService';
import { useAppDispatch } from '@/store/hooks';
import { setAuthenticated } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  findNodeHandle,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  UIManager,
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
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');

  // Reference for password input navigation
  const passwordInputRef = useRef<TextInput>(null);
  // Reference for ScrollView to handle auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);
  // Reference for Sign In button to measure its position
  const signInButtonRef = useRef<View>(null);
  // Track keyboard height
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const scrollToButton = useCallback(() => {
    if (!signInButtonRef.current || !scrollViewRef.current) return;

    const buttonHandle = findNodeHandle(signInButtonRef.current);
    const scrollViewHandle = findNodeHandle(scrollViewRef.current);

    if (buttonHandle && scrollViewHandle) {
      // 1. Measure ScrollView position in window
      UIManager.measureInWindow(scrollViewHandle, (svX, svY, svW, svH) => {
        // 2. Measure Button position relative to ScrollView
        UIManager.measureLayout(
          buttonHandle,
          scrollViewHandle,
          () => console.warn('measureLayout failed'),
          (left, top, width, height) => {
            const windowHeight = Dimensions.get('window').height;
            
            // 3. Calculate Target Scroll Y
            // Formula: TargetScrollY = ScrollViewPageY + ButtonLayoutY + ButtonHeight - (WindowHeight - KeyboardHeight) + Margin
            // We want the button bottom to be 15px above the keyboard.
            // The visual bottom of the button on screen is: (svY + top - currentScrollY + height)
            // We want: (svY + top - currentScrollY + height) = (windowHeight - keyboardHeight - 15)
            // Solving for currentScrollY (which becomes our target):
            // TargetScrollY = svY + top + height - (windowHeight - keyboardHeight - 15)
            
            const targetVisualBottom = windowHeight - keyboardHeight - 15;
            const targetScrollY = svY + top + height - targetVisualBottom;

            scrollViewRef.current?.scrollTo({
              y: Math.max(0, targetScrollY),
              animated: true,
            });
          }
        );
      });
    }
  }, [keyboardHeight]);

  // Listen for keyboard events
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Trigger scroll when keyboard opens or focus changes
  useEffect(() => {
    if (isPasswordFocused && keyboardHeight > 0) {
      // Small delay to allow layout to settle if needed, though keyboardWillShow gives us data early
      setTimeout(scrollToButton, 100);
    }
  }, [isPasswordFocused, keyboardHeight, scrollToButton]);

  // Load saved credentials on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedCredentials = await credentialsService.getCredentials();
        if (savedCredentials) {
          setInitialEmail(savedCredentials.email);
          setInitialPassword(savedCredentials.password);
          setRememberMe(true);
        }
      } catch (error) {
        console.warn('Failed to load saved credentials:', error);
      }
    };

    loadSavedCredentials();

    // Hide status bar only on Android
    if (Platform.OS === 'android') {
      StatusBar.setHidden(false);
    }

    // Clean up: restore status bar visibility when component unmounts
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false);
      }
    };
  }, []);

  // Configure StatusBar for this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Status bar resets to app default when navigating away
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
        // 1. Save tokens to AsyncStorage
        await Promise.all([
          AsyncStorage.setItem('accessToken', data.accessToken),
          AsyncStorage.setItem('userId', String(data.pkUser))
        ]);

        // 2. Save credentials securely if user opted in
        if (rememberMe) {
          await credentialsService.saveCredentials(values.email, values.password);
        } else {
          // Delete any previously saved credentials if unchecked
          await credentialsService.deleteCredentials();
        }

        // 3. Update Redux auth slice
        dispatch(setAuthenticated({
          accessToken: data.accessToken,
          userId: String(data.pkUser),
        }));
        
        if (Platform.OS === 'android') {
          Keyboard.dismiss();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 4. Navigate to main screen
        // Navigation will automatically redirect to (tabs) because isAuthenticated = true
        router.replace('/(tabs)');
      } else {
        setErrorMessage('Email or password incorrect.\nPlease try again.');
      }
    } catch (error) {
      setErrorMessage('Connection failed. Please check your internet and try again.');
      console.log('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
  setLoading(true);
    try {
      await AsyncStorage.setItem('userId', 'GUEST_USER');
      
      dispatch(setAuthenticated({
        accessToken: 'guest_token',
        userId: 'GUEST_USER',
      }));

      router.replace('/(tabs)');
    } catch (error) {
      console.log('Guest Mode error:', error);
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
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
                    initialValues={{ email: initialEmail, password: initialPassword }}
                    validationSchema={validationSchema}
                    onSubmit={handleLogin}
                    enableReinitialize={true}
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
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={(e) => {
                            setIsPasswordFocused(false);
                            handleBlur('password')(e);
                          }}
                          error={touched.password && errors.password ? errors.password : undefined}
                          secureTextEntry={true}
                          autoCapitalize="none"
                          autoComplete="password"
                          textContentType="password"
                          returnKeyType='go'
                          onSubmitEditing={() => handleSubmit()}
                        />

                        {/* Remember Me Toggle */}
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginVertical: 12,
                          paddingHorizontal: 4
                        }}>
                          <Typography 
                            variant="body2" 
                            style={{ color: '#6B7280' }}
                          >
                            Remember my credentials
                          </Typography>
                          <Switch
                            value={rememberMe}
                            onValueChange={setRememberMe}
                            trackColor={{ false: '#ccc', true: '#E63946' }}
                            thumbColor={rememberMe ? '#fff' : '#f4f3f4'}
                          />
                        </View>

                        {errorMessage ? (
                          <View style={MigratedStyles.loginErrorContainer}>
                            <Typography variant="body2" color="error" style={MigratedStyles.loginErrorText}>
                              {errorMessage}
                            </Typography>
                          </View>
                        ) : null}

                        <View 
                          ref={signInButtonRef} 
                          collapsable={false}
                          style={{ marginBottom: 10 }} // Add some margin to be part of the measurement
                        >
                          <Button
                            title="Sign In"
                            onPress={() => handleSubmit()}
                            loading={loading}
                            fullWidth
                            size="lg"
                            variant="primary"
                            style={MigratedStyles.loginButton}
                          />
                        </View>

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

                  <Button
                    title="Explore as Guest"
                    onPress={handleGuestMode}
                    variant="ghost"
                    fullWidth
                    size="md"
                    style={{ marginTop: 10 }}
                  />
                  
                </View>
              </Animatable.View>
            </View>
          </ScrollView>
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

