import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '@/components/common';
import { Theme } from '@/constants/Theme';
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
  const [timer, setTimer] = useState(300);
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
    if (e.nativeEvent.key === 'Backspace') {
      if (enteredCode[index] === '' && index > 0) {
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
      setShowSetNewPassword(true);
    }
  };

  const handleResendCode = () => {
    setTimer(300);
    setEnteredCode(Array(6).fill(''));
    setCodeValid(true);
    setIsCodeCorrect(false);
    inputsRef.current[0]?.focus();
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
        <View style={styles.modalOverlay}>
          <View style={styles.container}>
            <View style={styles.content}>
              {/* Header with Icon */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Icon name="shield-checkmark" size={48} color={Theme.colors.primary[500]} />
                </View>
                <Text style={styles.title}>Enter Verification Code</Text>
                <Text style={styles.subtitle}>
                  We sent a verification code to your email. Enter it below to reset your password.
                </Text>
              </View>

              {/* Code Input */}
              <View style={styles.codeContainer}>
                {enteredCode.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputsRef.current[index] = ref; }}
                    style={[
                      styles.codeInput,
                      !codeValid && !isCodeCorrect && styles.codeInputError,
                      isCodeCorrect && styles.codeInputSuccess,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleInputChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={1}
                    keyboardType="numeric"
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Status Messages */}
              {!codeValid && !isCodeCorrect && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={20} color={Theme.colors.error[500]} />
                  <Text style={styles.errorText}>
                    Invalid code or code expired
                  </Text>
                </View>
              )}

              {isCodeCorrect && (
                <View style={styles.successContainer}>
                  <Icon name="checkmark-circle" size={20} color={Theme.colors.success[500]} />
                  <Text style={styles.successText}>
                    Code verified successfully!
                  </Text>
                </View>
              )}

              {/* Timer */}
              {!isCodeCorrect && timer > 0 && (
                <View style={styles.timerContainer}>
                  <Icon name="time-outline" size={16} color={Theme.colors.text.tertiary} />
                  <Text style={styles.timerText}>
                    Code expires in {formatTime()}
                  </Text>
                </View>
              )}

              {/* Resend Code */}
              {timer === 0 && (
                <Button
                  title="Resend Code"
                  variant="ghost"
                  onPress={handleResendCode}
                  icon={<Icon name="reload" size={20} color={Theme.colors.primary[500]} />}
                  iconPosition="left"
                  style={styles.resendButton}
                />
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Back"
                  variant="outline"
                  onPress={onBack}
                  icon={<Icon name="arrow-back" size={20} color={Theme.colors.primary[500]} />}
                  iconPosition="left"
                  style={styles.backButton}
                />

                <Button
                  title="Continue"
                  variant="primary"
                  onPress={handleNext}
                  disabled={!isCodeCorrect}
                  icon={<Icon name="arrow-forward" size={20} color={Theme.colors.text.inverse} />}
                  iconPosition="right"
                  style={styles.continueButton}
                />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <SetNewPassword
          isVisible={showSetNewPassword}
          onClose={handleCloseSetNewPassword}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    width: '100%',
    paddingHorizontal: Theme.spacing.base,
  },

  content: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing['2xl'],
    ...Theme.shadows.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing['3xl'],
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },

  title: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
    paddingHorizontal: Theme.spacing.base,
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },

  codeInput: {
    width: 48,
    height: 56,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border.default,
    backgroundColor: Theme.colors.background.primary,
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    ...Theme.shadows.sm,
  },

  codeInputError: {
    borderColor: Theme.colors.error[500],
    backgroundColor: Theme.colors.error[50],
  },

  codeInputSuccess: {
    borderColor: Theme.colors.success[500],
    backgroundColor: Theme.colors.success[50],
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.error[50],
    padding: 12,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },

  errorText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.error[600],
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.success[50],
    padding: 12,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },

  successText: {
    flex: 1,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.success[700],
    fontWeight: Theme.typography.fontWeight.medium,
  },

  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.lg,
  },

  timerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.tertiary,
  },

  resendButton: {
    marginBottom: Theme.spacing.lg,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Theme.spacing.lg,
  },

  backButton: {
    flex: 1,
  },

  continueButton: {
    flex: 2,
  },
});

export default VerifyPasswordResetCode;
