import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles'; 
import { FontAwesome } from '@expo/vector-icons';
import VerifyCode from './verificodeReset'; 
import { validateEmail } from '../../scripts/validator'; 
import Constants from 'expo-constants';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ResetPassword: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [userFound, setUserFound] = useState(false); 
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    if (isVisible) { 
      setEmail('');
      setEmailValid(true);
      setUserFound(false);
      setShowVerifyCode(false);
    }
  }, [isVisible]); 

  const generateVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    console.log(code);

    const verifyData = {
      email: email,
      code: code,
    };

    const verifyResponse = await fetch(`${API_URL}/mailer/send-code`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    if (!verifyResponse.ok) {
        console.error('Failed to send verification code.');
    }
  };

  const checkUserExistence = async (userEmail: string) => {
    setEmailValid(true);
  
    const url = `${API_URL}/user/verifyEmail?email=${encodeURIComponent(userEmail)}`; 

    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json', 
        },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      return data.exists; 
    } catch (error) {
      console.error(`Error checking user existence:`, error);
      return false; 
    }
  };

  const handleNext = async () => {
    if (validateEmail(email)) {
        try {
            const exists = await checkUserExistence(email);

            if (exists) {
               await AsyncStorage.setItem('emailForPasswordReset', email); 
               console.log(`Email stored for password reset:`, email);
               setShowVerifyCode(true); 
               generateVerificationCode();
            } else {
               setUserFound(true); 
            }
        } catch (error) {
            console.error(`Error during password reset flow:`, error);
            alert('An error occurred. Please try again later.');
        }
    } else {
        setEmailValid(false); 
    }
  };

  const handleBack = () => {
    setShowVerifyCode(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      
      {!showVerifyCode ? (
        <View style={styles.modalContainer}>
           <View>
              <Text style={[{ marginBottom: 20, textAlign: 'center' }, styles.textH1]}>Reset Your Password</Text>
              <Text style={styles.textH2Black}>Email Address</Text>
              <TextInput
                style={[
                  { marginBottom: 15 },
                  styles.input,
                  !emailValid && { borderColor: 'red', borderWidth: 1 }
                ]}
                placeholder="johndoe@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {!emailValid && <Text style={{ color: 'red', marginBottom: 5 }}>Please enter a valid email address.</Text>}
              {userFound && <Text style={{ color: 'red', marginBottom: 5 }}>This email is not registered.</Text>}              
            </View>
          
         
          <View style={styles.buttonContainer2}>
            <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
              <Text style={styles.buttonText}>Back</Text>
              <FontAwesome name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonRight]} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
              <FontAwesome name="arrow-right" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <VerifyCode 
          isVisible={isVisible} 
          onClose={onClose} 
          onBack={handleBack} 
          verificationCode={verificationCode} 
          IsVerify={() => {
            setShowVerifyCode(false); 
          }}
        />
      )}
    </Modal>
  );
};

export default ResetPassword;