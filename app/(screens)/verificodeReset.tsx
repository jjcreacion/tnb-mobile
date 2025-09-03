import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import SetNewPassword from './SetNewPassword';

interface VerifyPasswordResetCodeProps {
  isVisible: boolean;
  onClose: () => void;
  onBack: () => void;
  verificationCode: string; 
}

const VerifyPasswordResetCode: React.FC<VerifyPasswordResetCodeProps> = ({ 
  isVisible, 
  onClose, 
  onBack, 
  verificationCode 
}) => {
  const [enteredCode, setEnteredCode] = useState(Array(6).fill(''));
  const [codeValid, setCodeValid] = useState(true);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [showSetNewPassword, setShowSetNewPassword] = useState(false); 
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

  useEffect(() => {
    if (isVisible) {
      setEnteredCode(Array(6).fill(''));
      setCodeValid(true);
      setTimer(300); 
      setIsCodeCorrect(false);
      setShowSetNewPassword(false); 
      setTimeout(() => inputsRef.current[0]?.focus(), 100); 
    }
  }, [isVisible]);

  const handleInputChange = (value: string, index: number) => {
    const newCode = [...enteredCode];
    newCode[index] = value;
    setEnteredCode(newCode);

    if (value !== '' && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

   const allFilled = newCode.every(digit => digit !== '');
   if (allFilled) {
     const fullEnteredCode = newCode.join('');
     if (fullEnteredCode === verificationCode) {
       setIsCodeCorrect(true);
       setCodeValid(true); 
     } else {
       setIsCodeCorrect(false);
       setCodeValid(false); 
     }
   } else {
       setIsCodeCorrect(false); 
       setCodeValid(true); 
   }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0) {
      if (enteredCode[index] === '') { 
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
      console.log("Code is correct! Proceeding to set new password.");
      setShowSetNewPassword(true); 
    }
  };

  const handleCloseSetNewPassword = () => {
    setShowSetNewPassword(false); 
    onClose(); 
  };

  return (
    <Modal
      visible={isVisible} 
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {!showSetNewPassword ? (
        <View style={styles.modalContainer}>
          <Text style={styles.textH1Red}>Enter Verification Code</Text>
          <Text style={{ marginBottom: 20 }}>
            Check your inbox and enter the 6-digit code sent to your email to reset your password.
          </Text>
          <View style={styles.codeContainer}>
            {enteredCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {(inputsRef.current[index] = ref)}}
                style={[
                  styles.input,
                  styles.codeInput,
                  !codeValid && { borderColor: 'red', borderWidth: 1 }, 
                  (isCodeCorrect && enteredCode.every(d => d !== '')) && { borderColor: 'green', borderWidth: 1 }, 
                  (!isCodeCorrect && enteredCode.every(d => d !== '') && !codeValid) && { borderColor: 'red', borderWidth: 1 }, 
                ]}
                value={digit}
                onChangeText={(value) => handleInputChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="numeric"
                selectionColor="transparent" 
                onFocus={() => {
                    const newCode = [...enteredCode];
                    newCode[index] = '';
                    setEnteredCode(newCode);
                }}
              />
            ))}
          </View>
          {!codeValid && timer === 0 && ( 
            <Text style={{ color: 'red', marginBottom: 5 }}>The code has expired. Please go back to request a new one.</Text>
          )}
          {!isCodeCorrect && enteredCode.every(d => d !== '') && codeValid && timer > 0 && ( 
             <Text style={{ color: 'red', marginBottom: 5 }}>Incorrect code. Please try again.</Text>
          )}
          {isCodeCorrect && (
            <Text style={{ color: 'green', marginBottom: 5 }}>
              Code correct! Press the next button to set your new password.
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
        <SetNewPassword
          isVisible={isVisible} 
          onClose={handleCloseSetNewPassword} 
        />
      )}
    </Modal>
  );
};

export default VerifyPasswordResetCode;