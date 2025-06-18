import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles';
import { FontAwesome } from '@expo/vector-icons';
import Register from './register';

interface VerifyCodeProps {
  isVisible: boolean;
  onClose: () => void;
  onBack: () => void;
  verificationCode: string;
  IsVerify: () => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ isVisible, onClose, onBack, verificationCode, IsVerify }) => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [codeValid, setCodeValid] = useState(true);
  const [timer, setTimer] = useState(300);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [showRegister, setshowRegister] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCodeValid(false);
    }
  }, [timer]);

  const handleInputChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < inputsRef.current.length - 1) {
      // Mover el enfoque al siguiente cuadro de texto
      inputsRef.current[index + 1]?.focus();
    }

   // Verificar el código cuando todos los cuadros de texto estén llenos
   const allFilled = newCode.every(digit => digit !== '');
   if (allFilled) {
     const enteredCode = newCode.join('');
     if (enteredCode === verificationCode) {
       setIsCodeCorrect(true);
       setCodeValid(true);
     } else {
       setIsCodeCorrect(false);
       setCodeValid(false);
     }
   }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      if (code[index] === '') {
        // Mover el enfoque al cuadro de texto anterior
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleNext = () => {
    if (isCodeCorrect) {
      // Código correcto, continuar con el proceso
      setshowRegister(true); 
      console.log("Código correcto!");
    }
  };

  return !showRegister ? (
    <View style={styles.modalContainer}>
      <Text style={styles.textH1Red}>Enter Verification Code</Text>
      <Text style={{ marginBottom: 20 }}>Check your inbox and enter the verification code to continue with your registration. </Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={[
              styles.input,
              styles.codeInput,
              !codeValid && { borderColor: 'red', borderWidth: 1 },
              isCodeCorrect && { borderColor: 'green', borderWidth: 1 },
            ]}
            value={digit}
            onChangeText={(value) => handleInputChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            maxLength={1}
            keyboardType="numeric"
          />
        ))}
      </View>
      {!codeValid && !isCodeCorrect && (
        <Text style={{ color: 'red', marginBottom: 5 }}>Invalid code or code expired</Text>
      )}
      {isCodeCorrect && (
        <Text style={{ color: 'green', marginBottom: 5 }}>
          Code correct! Press the next button to continue with your registration.
        </Text>
      )}
      {!isCodeCorrect && <Text style={{ marginBottom: 20 }}>Time remaining: {formatTime()}</Text>}
      <View style={styles.buttonContainer2}>
        <TouchableOpacity style={[styles.button, styles.buttonLeft]} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
          <FontAwesome name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonRight, !isCodeCorrect && { backgroundColor: 'gray' }]}
          onPress={handleNext}
          disabled={!isCodeCorrect}
        >
          <Text style={styles.buttonText}>Next</Text>
          <FontAwesome name="arrow-right" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <Register isVisible={isVisible} onClose={onClose} IsVerify={IsVerify} />
  );
};

export default VerifyCode;


