import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Lógica para manejar el registro
  };

  return (
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
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.buttonRegister} onPress={handleRegister}>
          <Text style={styles.buttonTextRegister}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default Register;
