import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert, StyleSheet } from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [mensajeErrorUsuario, setMensajeErrorUsuario] = useState<string | null>(null); 


  const handleLogin = async (values: any) => {
    setLoading(true);
    setLoginError(null); 
    setMensajeErrorUsuario(null);
    console.log("Enviando...");
    try {
      const response = await axios.post('http://192.168.1.37:3000/users/login/email', {
        email: values.email,
        password: values.password,
      });

      const token = response.data.token;

      await AsyncStorage.setItem('token', token);
      setLoading(false);
      router.push('/(tabs)');

      onClose();

    } catch (error: any) {
      console.error("Error en el inicio de sesión:", error);

      if (error.response) {
        if (error.response.status === 401) { 
          setMensajeErrorUsuario("Credenciales incorrectas. Inténtalo de nuevo.");
        } else {
          setMensajeErrorUsuario("Hubo un error al iniciar sesión. Inténtalo más tarde.");
        }
      } else if (error.request) {
        setMensajeErrorUsuario("No se pudo conectar con el servidor.");
      } else {
        setMensajeErrorUsuario("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
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
        {({ handleChange, handleBlur, values, errors, touched, isValid, handleSubmit }) => ( 
          <View style={styles.modalContainer}>
            <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Credentials</Text>

            <Text style={styles.textH2Black}>Email</Text>
            <TextInput
              style={[styles.input, touched.email && errors.email && styles.inputError]} 
              placeholder={"Enter your email"}
              value={values.email}
              onChangeText={handleChange('email')} 
              onBlur={handleBlur('email')} 
              keyboardType={"email-address"}
            />
            {touched.email && errors.email && ( 
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <Text style={styles.textH2Black}>Password</Text>
            <TextInput
              style={[styles.input, touched.password && errors.password && styles.inputError]}
              placeholder=""
              value={values.password}
              onChangeText={handleChange('password')} 
              onBlur={handleBlur('password')} 
              secureTextEntry
            />
            {touched.password && errors.password && ( 
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {mensajeErrorUsuario && <Text style={styles.errorText}>{mensajeErrorUsuario}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
                <Text style={styles.buttonText}>Back</Text>
                <FontAwesome name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonRight, !isValid && styles.buttonDisabled]} 
                disabled={!isValid} 
                onPress={() => {
                  if (isValid) {
                    handleSubmit();
                  }
                }} 
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