import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import VerifyCode from './verificode';
import { validateEmail, validatePhone } from '../../scripts/validator';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [selectedTab, setSelectedTab] = useState('email');
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    console.log(code);
  };

  const handleNext = async () => {
    if (selectedTab === 'email') {
      if (validateEmail(email)) {
        await AsyncStorage.setItem('emailForSignIn', email);
        await AsyncStorage.setItem('phoneForSignIn', '');
        console.log("Email guardado:", email); // Para depuración
        setShowVerifyCode(true);
        generateVerificationCode();
      } else {
        setEmailValid(false);
      }
    } else {
      if (validatePhone(phone)) {
        await AsyncStorage.setItem('phoneForSignIn', phone);
        await AsyncStorage.setItem('emailForSignIn', '');
        console.log("Phone guardado:", phone); // Para depuración
        setShowVerifyCode(true);
        generateVerificationCode();
      } else {
        setPhoneValid(false);
      }
    }
  };

  const handleTabChange = (tab: any) => {
    setSelectedTab(tab);
    setEmailValid(true);
    setPhoneValid(true);
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
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, selectedTab === 'email' && styles.activeTab]} 
              onPress={() => handleTabChange('email')}
            >
              <FontAwesome name="envelope" size={24} color="black" />
              <Text style={styles.tabText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, selectedTab === 'phone' && styles.activeTab]} 
              onPress={() => handleTabChange('phone')}
            >
              <FontAwesome name="phone" size={24} color="black" />
              <Text style={styles.tabText}>Phone</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'email' ? (
            <View>
              <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Email</Text>
              <Text style={styles.textH2Black}>Email Address</Text>
              <TextInput
                style={[
                  { marginBottom: 15 },
                  styles.input,
                  !emailValid && { borderColor: 'red', borderWidth: 1 }
                ]}
                placeholder="johndoe@gmail.com"
                value={email}
                onChangeText={setEmail}
              />
              {!emailValid && <Text style={{ color: 'red', marginBottom: 5 }}>Invalid email</Text>}
            </View>
          ) : (
            <View>
              <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Phone Number</Text>
              <Text style={styles.textH2Black}>Phone Number</Text>
              <TextInput
                style={[
                  { marginBottom: 15 },
                  styles.input,
                  !phoneValid && { borderColor: 'red', borderWidth: 1 }
                ]}
                placeholder="+1234567890"
                value={phone}
                onChangeText={setPhone}
              />
              {!phoneValid && <Text style={{ color: 'red', marginBottom: 5 }}>Invalid phone number</Text>}
            </View>
          )}

          <View style={styles.containerTermsofServices}>
            <Text style={styles.TermsofServices}> By continuing, you agree to our </Text>
            <Text style={[styles.TermsofServices, styles.underlineText]}>Terms of Services</Text>
            <Text style={styles.TermsofServices}> and</Text>
            <Text style={[styles.TermsofServices, styles.underlineText]}> Privacy Policy </Text>
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
        <VerifyCode isVisible={isVisible} onBack={handleBack} verificationCode={verificationCode} />
      )}
    </Modal>
  );
};

export default SignUp;
