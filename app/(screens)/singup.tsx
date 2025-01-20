import React, {useState } from 'react';
import { Modal, View, Text,  TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import { validateEmail } from '../../scripts/validator';
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth';
import VerifyCode from './verificode';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUp: React.FC<ModalProps> = ({ isVisible, onClose }) => {

  const [email, setEmail] = useState(''); 
  const [emailValid, setEmailValid] = useState(true); 
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const handleNext = () =>{
    if(validateEmail(email)){
      window.localStorage.setItem('emailForSignIn', email); 
      setShowVerifyCode(true);
      console.log("Email valido verificacion en proceso ");
      /*
      setEmailValid(true);
      const auth = getAuth();
      const actionCodeSettings = { 
        url: 'https://www.example.com/finishSignUp?cartId=1234', // Cambia esta URL por la de tu aplicación 
        handleCodeInApp: true,
      }; 
      sendSignInLinkToEmail(auth, email, actionCodeSettings) .then(() => { 
        console.log("Verification email sent"); 
        window.localStorage.setItem('emailForSignIn', email); // Guardar el email en el almacenamiento local 
       }).catch((error: any) => { 
          console.error("Error sending email: ", error); 
      });*/
    }
    else{
      console.log("Email Invalido");
      setEmailValid(false);
    }
  }
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {!showVerifyCode ? (
        <View style={styles.modalContainer}>
          {/* Formulario de correo electrónico */}
          <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Your Email</Text>
          <Text style={styles.textH2Black}>Email Addrress</Text>
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
          <View style={styles.containerTermsofServices}>
            <Text style={styles.TermsofServices}> By continuing, you agree to our </Text>
            <Text style={[styles.TermsofServices, styles.underlineText]}>Terms of Services</Text>
            <Text style={styles.TermsofServices}> and</Text>
            <Text style={[styles.TermsofServices, styles.underlineText]}> Privacy Policy </Text>
          </View>
          <View style={styles.buttonContainer}>
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
        <VerifyCode isVisible={isVisible} onClose={onClose} />
      )}
    </Modal>
  );
  
};

export default SignUp;
