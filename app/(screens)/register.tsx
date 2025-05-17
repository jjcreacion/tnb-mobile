
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles';
import { useNavigation } from '@react-navigation/native';
import RegisterComplete from './registerComplete';
import Constants from 'expo-constants';

interface RegisterProps {
  isVisible: boolean;
  onClose: () => void;
  IsVerify: () => void;
}
const Register: React.FC<RegisterProps> = ({ isVisible, onClose, IsVerify}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [verifiEmail, setVerifiEmail] = useState(0);
  const [verifiPhone, setVerifiPhone] = useState(0);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [showComplete, setshowComplete] = useState(false);
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

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

  const personData = {
    firstName: values.first_name,
    middleName: '',
    lastName: values.last_name,
    status: 1,
  };

  console.log('Creando persona:', JSON.stringify(personData));

  try {
    const personResponse = await fetch(`${API_URL}/person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personData),
    });

    if (!personResponse.ok) {
      const errorDetails = await personResponse.json();
      throw new Error(`Error al crear persona: ${personResponse.status} - ${errorDetails?.message || personResponse.statusText || 'Error desconocido'}`);
    }

    const personResult = await personResponse.json();
    const fkPerson = personResult.pkPerson;
    console.log('Persona creada, ID:', fkPerson);

    // Crear contacto
    const contactData = {
      fkPerson: fkPerson,
      entry: 1,
      isCommercial: 0,
    };

    console.log('Creando contacto:', JSON.stringify(contactData));
    const contactResponse = await fetch(`${API_URL}/Contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!contactResponse.ok) {
      const errorDetails = await contactResponse.json();
      throw new Error(`Error al crear contacto: ${contactResponse.status} - ${errorDetails?.message || contactResponse.statusText || 'Error desconocido'}`);
    }

    const contactResult = await contactResponse.json();
    console.log('Contacto creado:', contactResult);

    // Crear email de persona
    const personEmailData = {
      email: email,
      isPrimary: 1,
      fkPerson: fkPerson,
    };

    console.log('Creando email de persona:', JSON.stringify(personEmailData));
    const personEmailResponse = await fetch(`${API_URL}/person-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personEmailData),
    });

    if (!personEmailResponse.ok) {
      const errorDetails = await personEmailResponse.json();
      throw new Error(`Error al crear email de persona: ${personEmailResponse.status} - ${errorDetails?.message || personEmailResponse.statusText || 'Error desconocido'}`);
    }

    const personEmailResult = await personEmailResponse.json();
    console.log('Email de persona creado:', personEmailResult);

    // Crear dirección de persona
    const personAddressData = {
      fkPerson: fkPerson,
      address: values.address,
      isPrimary: 1,
    };

    console.log('Creando dirección de persona:', JSON.stringify(personAddressData));
    const personAddressResponse = await fetch(`${API_URL}/person-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personAddressData),
    });

    if (!personAddressResponse.ok) {
      const errorDetails = await personAddressResponse.json();
      throw new Error(`Error al crear dirección de persona: ${personAddressResponse.status} - ${errorDetails?.message || personAddressResponse.statusText || 'Error desconocido'}`);
    }

    const personAddressResult = await personAddressResponse.json();
    console.log('Dirección de persona creada:', personAddressResult);

    // Crear usuario 
    const userData = {
      fkPerson: fkPerson,
      email: email,
      password: values.password,
    };

    console.log('Creando usuario:', JSON.stringify(userData));
    const userResponse = await fetch(`${API_URL}/user/createWithEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!userResponse.ok) {
      const errorDetails = await userResponse.json();
      throw new Error(`Error al crear usuario: ${userResponse.status} - ${errorDetails?.message || userResponse.statusText || 'Error desconocido'}`);
    }

    const userResult = await userResponse.json();
    console.log('Usuario creado:', userResult);

    setshowComplete(true);
    setLoading(false);
    setMessage('Registro exitoso');
    setIsSuccessModalVisible(true);
    resetForm();

  } catch (err: any) {
    setLoading(false);
    setError('Error en el registro: ' + (err.message || 'Error desconocido'));
  }
};

  return (
    <View style={styles.container}> 
    {!showComplete ? (
    <Formik
      initialValues={{ first_name: '', last_name: '', address: '', password: '', confirmPassword: '' }}
      validationSchema={SignupSchema}
      onSubmit={(values, { resetForm }) => {
        handleRegister(values, resetForm);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
        <View style={styles.container}>
          <Text style={[{ textAlign: 'center', marginTop: 10 }, styles.bannerText]}>New User Registration</Text>
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
              }} 
            >
              <Text style={styles.buttonTextRegister}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
    </Formik>
     ) : (
      <RegisterComplete isVisible={isVisible} onClose={onClose} IsVerify={IsVerify} /> 
    )}
    </View>
  );
};

export default Register;
