import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import styles from '../styles';
import EmailModal from './loginemail'; 
import PhoneModal from './loginphone'; 
import SignUpModal from './singup'

export default function LoginScreen() {
  
  const [isPhoneModalVisible, setPhoneModalVisible] = useState(false); 
  const [isEmailModalVisible, setEmailModalVisible] = useState(false); 
  const [isSignUpModalVisible, setSignUpModalVisible] = useState(false);
  
  return (
    <ImageBackground 
      source={require('@/assets/images/roof-repair.jpg')} 
      style={styles.backgroundImageLogin}
    >
      <LinearGradient
        colors={['rgba(76, 102, 159, 0)', '#ff6a59', '#ff0000']}
        style={styles.gradientLogin}
      >
        <Animatable.View animation="fadeIn" duration={1000} style={styles.iconContainer}>
        <Image
        source={require('../../assets/images/icon-tnb.png')}
        style={styles.imageSplash}
        />
        </Animatable.View>
      </LinearGradient>
      
      <Animatable.View animation="fadeIn" duration={1000} style={styles.buttonsContainer}> 
        <TouchableOpacity style={styles.buttonPhone} onPress={() => setPhoneModalVisible(true)}> 
          <FontAwesome name="phone" size={24} color="black" style={styles.iconLeft} /> 
          <Text style={styles.buttonTextPhone}>Login with phone</Text> 
        </TouchableOpacity> 
        <TouchableOpacity style={styles.buttonEmail} onPress={() => setEmailModalVisible(true)}>
          <MaterialIcons name="email" size={24} color="white" style={styles.iconLeft} /> 
          <Text style={styles.buttonTextEmail}>Login with email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSignUp} onPress={() => setSignUpModalVisible(true)}>
          <FontAwesome name="user-plus" size={24} color="white" style={styles.iconLeft} />
          <Text style={styles.buttonTextSignUp}>Sign Up</Text> 
        </TouchableOpacity>
      </Animatable.View>

      <PhoneModal isVisible={isPhoneModalVisible} onClose={() => setPhoneModalVisible(false)} /> 
      <EmailModal isVisible={isEmailModalVisible} onClose={() => setEmailModalVisible(false)} /> 
      <SignUpModal isVisible={isSignUpModalVisible} onClose={() => setSignUpModalVisible(false)} />

    </ImageBackground>
  );
}
