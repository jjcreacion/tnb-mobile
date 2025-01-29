import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styles from '../styles';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const SignupSchema = Yup.object().shape({
    name: Yup.string()
      .required('Requerido'),
    address: Yup.string()
      .required('Requerido'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('Requerido'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Las contraseñas deben coincidir')
      .required('Requerido'),
  });

  const handleRegister = async (values: any) => {
    setLoading(true);
    setMessage('');
    setError('');
    console.log(JSON.stringify(values))

    try {
      // Enviar datos a la API
      const response = await fetch('https://your-api-endpoint.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('Algo salió mal');
      }

      const data = await response.json();
      setLoading(false);
      setMessage('Registro exitoso');
    } catch (err: any) { 
      setLoading(false);
      setError('Error en el registro: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <Formik
      initialValues={{ name: '', address: '', password: '', confirmPassword: '' }}
      validationSchema={SignupSchema}
      onSubmit={(values, { resetForm }) => {
        handleRegister(values);
        resetForm();
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
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            {errors.name && touched.name ? (
              <Text>{errors.name}</Text>
            ) : null}
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('address')}
              onBlur={handleBlur('address')}
              value={values.address}
            />
            {errors.address && touched.address ? (
              <Text>{errors.address}</Text>
            ) : null}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {errors.password && touched.password ? (
              <Text>{errors.password}</Text>
            ) : null}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              secureTextEntry
            />
            {errors.confirmPassword && touched.confirmPassword ? (
              <Text>{errors.confirmPassword}</Text>
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
        </View>
      )}
    </Formik>
  );
};

export default Register;
