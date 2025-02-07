import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const Login: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (values: any) => {
    setLoginError(null); // Limpia el error anterior

    try {
      const response = await axios.post('http://192.168.1.37:3000/users/login/email', {
        email: values.email,
        password: values.password,
      });

      const token = response.data.token;

      await AsyncStorage.setItem('token', token);

      router.push('/(tabs)');

      onClose();

    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        setLoginError(error.response.data.error || "Invalid credentials."); // Guarda el mensaje de error
      } else {
        setLoginError("An error occurred during login."); // Guarda el mensaje de error
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          handleLogin(values);
        }}
      >
        {({ handleChange, handleBlur, values, errors, touched, isValid, handleSubmit }) => ( // Props de Formik
          <View style={styles.modalContainer}>
            <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Credentials</Text>

            <Text style={styles.textH2Black}>Email</Text>
            <TextInput
              style={[styles.input, touched.email && errors.email && styles.inputError]} // Estilos condicionales
              placeholder={"Enter your email"}
              value={values.email}
              onChangeText={handleChange('email')} // Usa handleChange
              onBlur={handleBlur('email')} // Usa handleBlur
              keyboardType={"email-address"}
            />
            {touched.email && errors.email && ( // Muestra mensaje de error si hay
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <Text style={styles.textH2Black}>Password</Text>
            <TextInput
              style={[styles.input, touched.password && errors.password && styles.inputError]} // Estilos condicionales
              placeholder=""
              value={values.password}
              onChangeText={handleChange('password')} // Usa handleChange
              onBlur={handleBlur('password')} // Usa handleBlur
              secureTextEntry
            />
            {touched.password && errors.password && ( // Muestra mensaje de error si hay
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {loginError && <Text style={styles.errorText}>{loginError}</Text>}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
                <Text style={styles.buttonText}>Back</Text>
                <FontAwesome name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonRight, !isValid && styles.buttonDisabled]} 
                disabled={!isValid} 
              >
                <Text style={styles.buttonText}>Login</Text>
                <FontAwesome name="sign-in" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </Modal>
  );
};


export default Login;