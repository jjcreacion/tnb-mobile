import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { getAuth, signInWithEmailLink } from 'firebase/auth';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';

interface VerifyCodeProps {
  isVisible: boolean;
  onClose: () => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ isVisible, onClose }) => {
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(true);

  const handleVerify = () => {
    const email = window.localStorage.getItem('emailForSignIn');
    const auth = getAuth();
    if (email) {
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          console.log("Email verified successfully:", result);
          // Aquí puedes manejar el registro exitoso
        })
        .catch((error: any) => {
          console.error("Error verifying email: ", error);
          setCodeValid(false);
        });
    } else {
      console.log("No email found in local storage");
      setCodeValid(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Verification Code</Text>
      <TextInput
        style={[
          { marginBottom: 15 },
          styles.input,
          !codeValid && { borderColor: 'red', borderWidth: 1 }
        ]}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
      />
      {!codeValid && <Text style={{ color: 'red', marginBottom: 5 }}>Invalid code</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
          <Text style={styles.buttonText}>Back</Text>
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonRight]} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
          <FontAwesome name="arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyCode;
