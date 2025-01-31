
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [verifiEmail, setVerifiEmail] = useState(0);
  const [verifiPhone, setVerifiPhone] = useState(0);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const SignupSchema = Yup.object().shape({
    first_name: Yup.string()
      .required('Requested'),
    last_name: Yup.string()
      .required('Requested'),  
    address: Yup.string()
      .required('Requested'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Requested'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
      .required('Requested'),
  });

  const handleRegister = async (values: any, resetForm: () => void) => {
    setLoading(true);
    setMessage('');
    setError('');

    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const email = await AsyncStorage.getItem('emailForSignIn');
    const phone = await AsyncStorage.getItem('phoneForSignIn');

    if (email !== null && email !== "") {
      setVerifiEmail(1);
    }
    if (phone !== null && phone !== "") {
      setVerifiPhone(1);
    }

    const person = {
        first_name: values.first_name,
        middle_name: '',
        last_name: values.last_name,
        address: values.address,
        date_of_birth: '',
        email: email,
        phone: phone,
        createdAt: createdAt,
        updatedAt: updatedAt,
    };

    console.log(JSON.stringify(person));
    try {
        const response = await fetch('http://192.168.1.37:3000/person/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(person),
        });

        if (!response.ok) {
            throw new Error('Algo salió mal');
        }

        const data = await response.json();
        console.log(`ID generado: ${data.id}`); 

        const user ={
          username: '',
          email: email,
          validate_email: verifiEmail,
          phone: phone, 
          validate_phone: verifiPhone,
          password: values.password,
          fk_profile: 1, 
          fk_person: data.id,
          createdAt: createdAt,
          updatedAt: updatedAt,
        }
        console.log(JSON.stringify(user));

        const userResponse = await fetch('http://192.168.1.37:3000/users/', { 
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json(); 
            throw new Error(`Error creating user: ${userResponse.status} - ${errorData?.message || userResponse.statusText || 'Unknown error'}`); // More informative error
        }

        const userData = await userResponse.json(); 
        console.log("User created successfully:", userData); 

        setLoading(false);
        setMessage('Registro exitoso');
        setIsSuccessModalVisible(true); 
        resetForm();
    } catch (err: any) {
        setLoading(false);
        setError('Error en el registro: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <Formik
      initialValues={{ first_name: '', last_name: '', address: '', password: '', confirmPassword: '' }}
      validationSchema={SignupSchema}
      onSubmit={(values, { resetForm }) => {
        handleRegister(values, resetForm);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
        <View style={styles.container}>
          <LinearGradient
            colors={['#ff6a59', '#ff0000']}
            style={styles.banner}
          >
            <Text style={styles.bannerText}>New User Registration</Text>
          </LinearGradient>
          <View style={styles.formContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, focusedInput === 'first_name' && { borderColor: 'blue', borderWidth: 2 }]}
              onChangeText={handleChange('first_name')}
              onBlur={handleBlur('first_name')} 
              onFocus={() => setFocusedInput('first_name')}
              value={values.first_name}
            />
            {errors.first_name && touched.first_name ? (
              <Text style={{ color: 'red' }}>{errors.first_name}</Text>
            ) : null}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, focusedInput === 'last_name' && { borderColor: 'blue', borderWidth: 2 }]}
              onChangeText={handleChange('last_name')}
              onBlur={handleBlur('last_name')} 
              onFocus={() => setFocusedInput('last_name')}
              value={values.last_name}
            />
            {errors.last_name && touched.last_name ? (
              <Text style={{ color: 'red' }}>{errors.last_name}</Text>
            ) : null}
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, focusedInput === 'address' && { borderColor: 'blue', borderWidth: 2 }]}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')} 
              onFocus={() => setFocusedInput('address')}
              value={values.address}
            />
            {errors.address && touched.address ? (
              <Text style={{ color: 'red' }}>{errors.address}</Text>
            ) : null}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, focusedInput === 'password' && { borderColor: 'blue', borderWidth: 2 }]}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')} 
              onFocus={() => setFocusedInput('password')}
              value={values.password}
              secureTextEntry
            />
            {errors.password && touched.password ? (
              <Text style={{ color: 'red' }}>{errors.password}</Text>
            ) : null}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, focusedInput === 'confirmPassword' && { borderColor: 'blue', borderWidth: 2 }]}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')} 
              onFocus={() => setFocusedInput('confirmPassword')}
              value={values.confirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && touched.confirmPassword ? (
              <Text style={{ color: 'red' }}>{errors.confirmPassword}</Text>
            ) : null}
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {message && <Text style={{ color: 'green' }}>{message}</Text>}
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
            <TouchableOpacity 
              style={styles.buttonRegister} 
              onPress={() => {
                if (isValid) {
                  handleSubmit();
                }
              }} // Verifica la validez antes de enviar
            >
              <Text style={styles.buttonTextRegister}>Register</Text>
            </TouchableOpacity>
          </View>
          <Modal visible={isSuccessModalVisible} transparent={true}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                    <Text>¡Registro exitoso!</Text>
                    <TouchableOpacity onPress={() => {
                        setIsSuccessModalVisible(false);
                     //   navigation.navigate('Login'); // Navega a la página de inicio de sesión
                    }}>
                        <Text>Ir a la página de inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        </View>
      )}
      
    </Formik>
  );
};

export default Register;
