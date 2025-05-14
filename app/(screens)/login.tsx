import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Ionicons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const cardBackgroundColor = 'rgba(255, 255, 255, 0.9)';
const primaryButtonColor = '#007AFF';
const textColorPrimary = '#333';
const textColorLink = '#007AFF';
const inputBackgroundColor = '#f2f2f2';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Por favor, introduce un correo electrónico válido').required('El correo electrónico es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values) => {
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
        setErrorMessage(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setErrorMessage('Hubo un error al iniciar sesión');
      console.error('Error de inicio de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/ingenieros.jpeg')}
      style={styles.backgroundImageLogin}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(76, 102, 159, 0.5)', '#ADD8E6', '#FFDAB9']}
          style={styles.backgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Animatable.View
          animation="pulse" 
          iterationCount="infinite" 
          duration={2000} 
          style={styles.iconContainer}
        >
          <Image
            source={require('../../assets/images/icon-tnb.png')}
            style={styles.imageSplash}
          />
        </Animatable.View>

        <Animatable.View animation="fadeIn" duration={1000} style={styles.content}>
          <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
            <Text style={[styles.title, { color: textColorPrimary }]}>Sign In</Text>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                  <TextInput
                    style={[styles.input, { backgroundColor: inputBackgroundColor }]}
                    placeholder="Correo electrónico"
                    placeholderTextColor="#888"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.passwordInput, { backgroundColor: inputBackgroundColor }]}
                      placeholder="Contraseña"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                    />
                    <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                      <Icon
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={24}
                        color="#888"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: primaryButtonColor }]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Log In</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <Text style={[styles.link, { color: textColorLink }]}>Create account</Text>
          </View>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  iconContainer: {
    position: 'absolute',
    top: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5, 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSplash: {
    width: 120,
    height: 120,
    margin: 10,
  },
  card: {
    borderRadius: 40,
    padding: 30,
    marginTop: 120,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backgroundImageLogin: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    color: textColorPrimary,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    backgroundColor: inputBackgroundColor,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: textColorPrimary,
    borderRadius: 10,
  },
  eyeIcon: {
    padding: 15,
  },
});