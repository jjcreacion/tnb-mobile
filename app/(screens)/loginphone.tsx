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
  phone: Yup.string()
    .required('phone is required'),
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
      const response = await axios.post('http://192.168.1.37:3000/users/login/phone', {
        phone: values.phone,
        password: values.password,
      });

      const token = response.data.token;

      await AsyncStorage.setItem('token', token);
      setLoading(false);
      router.push('/(tabs)');

      onClose();

    } catch (error: any) {
     
      if (error.response) {
        if (error.response.status === 401) { 
          setMensajeErrorUsuario("Incorrect credentials. Try again.");
        } else {
          setMensajeErrorUsuario("There was an error logging in. Please try again later.");
        }
      } else if (error.request) {
        setMensajeErrorUsuario("Could not connect to the server.");
      } else {
        setMensajeErrorUsuario("An unexpected error occurred.");
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
        initialValues={{ phone: '', password: '' }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          handleLogin(values);
        }}
      >
        {({ handleChange, handleBlur, values, errors, touched, isValid, handleSubmit }) => ( 
          <View style={styles.modalContainer}>
            <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Credentials</Text>

            <Text style={styles.textH2Black}>Phone</Text>
            <TextInput
              style={[styles.input, touched.phone && errors.phone && styles.inputError]} 
              placeholder={"Enter your phone"}
              value={values.phone}
              onChangeText={handleChange('phone')} 
              onBlur={handleBlur('phone')} 
            />
            {touched.phone && errors.phone && ( 
              <Text style={styles.errorText}>{errors.phone}</Text>
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

            <View style={styles.buttonContainer2}>
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
