import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import VerifyCode from './verificode';
import { validateEmail, validatePhone } from '../../scripts/validator';
import Constants from 'expo-constants';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [exist, setExist] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [selectedTab, setSelectedTab] = useState('email');
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    if (isVisible) { 
      setEmail('');
      setEmailValid(true);
      setPhone('');
      setPhoneValid(true);
      setSelectedTab('email'); 
      setShowVerifyCode(false);
      setExist(false);
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

  };

  const verificarUsuario = async (valor: any, campo: any) => {
  
  setEmailValid(true);
  
  if (campo === 'email') {
    const ruta = `${API_URL}/user/verifyEmail?email=${encodeURIComponent(valor)}`; 

    console.log(ruta);

    try {
      const respuesta = await fetch(ruta, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json', 
        },
      });
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}`);
      }
      const datos = await respuesta.json();
      return datos.exists;
    } catch (error) {
      console.error(`Error verificando ${campo}:`, error);
      return true; 
    }
  } else if (campo === 'phone') {
    console.log('Verificación de teléfono no implementada.');
    return true; 
  }
};

/*
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
*/
  const handleNext = async () => {
    let campo = 'email';
    let valor = email;
    let setValid = setEmailValid;
    let validationFunction = validateEmail;

    if (validationFunction(valor)) {
        try {
            const existe = await verificarUsuario(valor, campo);

            if (existe) {
                setExist(true);
            } else {
               await AsyncStorage.setItem('emailForSignIn', valor);
              // await AsyncStorage.setItem('phoneForSignIn', '');
              
               console.log(`${campo} guardado:`, valor);
               setShowVerifyCode(true);
               generateVerificationCode();
            }
        } catch (error) {
            console.error(`Error verificando ${campo}:`, error);
            alert('An error occurred. Please try again later.');
        }
    } else {
        setValid(false);
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
           <View>
              <Text style={[{ marginBottom: 20, textAlign: 'center' }, styles.textH1]}>Enter Your Email</Text>
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
              {exist && <Text style={{ color: 'red', marginBottom: 5 }}>It is already registered</Text>}              
            </View>
          
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
        <VerifyCode isVisible={isVisible} onClose={onClose} onBack={handleBack} verificationCode={verificationCode} IsVerify={() => setShowVerifyCode(false)}/>
      )}
    </Modal>
  );
};

export default SignUp;
