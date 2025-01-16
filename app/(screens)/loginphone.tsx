import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const LoginPhone: React.FC<ModalProps> = ({ isVisible, onClose }) => {
    
    const [text, setText] = useState(''); 

    return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
      <Text style={[{ marginBottom: 20 }, styles.textH1Red]}>Enter Phone Number</Text>
        <Text style={styles.textH2Black}>Mobile Number</Text>
        <TextInput style={styles.input} placeholder="" value={text} onChangeText={setText} />
        <Text style={styles.textH3Blue}>Please enter the phone number</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onClose}>
        <Text style={styles.buttonText}>Back</Text>
        <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonRight]} onPress={() => {/* Acción para el botón "Next" */}}> 
        <Text style={styles.buttonText}>Next</Text> 
        <FontAwesome name="arrow-right" size={24} color="white" /> 
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default LoginPhone;
