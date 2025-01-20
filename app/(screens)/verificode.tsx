import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import { getAuth, applyActionCode } from 'firebase/auth';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const VerifyCode: React.FC<ModalProps> = ({ isVisible, onClose }) => {
  const [code, setCode] = useState('');

 /* const handleVerify = () => {
    const auth = getAuth();
    applyActionCode(auth, code)
      .then(() => {
        console.log("Verification successful");
        // Acción adicional después de la verificación exitosa
      })
      .catch((error) => {
        console.error("Error verifying code: ", error);
      });
  };*/

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Verification Code</Text>
        <TextInput 
          style={[{ marginBottom: 15 }, styles.input]} 
          placeholder="Enter Code" 
          value={code} 
          onChangeText={setCode} 
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VerifyCode;
