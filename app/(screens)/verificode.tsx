import { Button } from '@/components/common';
import { Theme } from '@/constants/Theme';
import React, { useEffect, useRef, useState } from 'react';
import { Clipboard, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Register from './registerMigrated';

interface VerifyCodeProps {
  verificationCode: string;
  onBack: () => void;
  email: string;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ onBack, verificationCode, email }) => {
  const [code, setCode] = useState(Array(6).fill(''));
  const [codeValid, setCodeValid] = useState(true);
  const [timer, setTimer] = useState(300);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input
    inputsRef.current[0]?.focus();
  }, []);

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
    // Clean the value to only contain digits
    const cleanValue = value.replace(/\D/g, '');
    
    // If pasting multiple characters (6-digit code)
    if (cleanValue.length > 1) {
      const digits = cleanValue.slice(0, 6).split('');
      const newCode = ['', '', '', '', '', ''];
      
      // Fill the code array with the pasted digits
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      
      setCode(newCode);
      
      // Validate the complete code if 6 digits
      if (digits.length === 6) {
        const enteredCode = digits.join('');
        if (enteredCode === verificationCode) {
          setIsCodeCorrect(true);
          setCodeValid(true);
        } else {
          setIsCodeCorrect(false);
          setCodeValid(false);
        }
      }
      
      // Move focus to the last filled position or the next empty one
      const focusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        inputsRef.current[focusIndex]?.focus();
      }, 10);
    } else {
      // Single character input
      const newCode = [...code];
      newCode[index] = cleanValue;
      setCode(newCode);
      
      // Check if code is complete and validate
      const completeCode = newCode.join('');
      if (completeCode.length === 6) {
        if (completeCode === verificationCode) {
          setIsCodeCorrect(true);
          setCodeValid(true);
        } else {
          setIsCodeCorrect(false);
          setCodeValid(false);
        }
      } else {
        // Reset validation states when code is incomplete
        setIsCodeCorrect(false);
        setCodeValid(true);
      }
      
      // Move to next input if digit entered
      if (cleanValue && index < 5) {
        setTimeout(() => {
          inputsRef.current[index + 1]?.focus();
        }, 10);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
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
      setShowRegister(true);
    }
  };

  const handleResendCode = () => {
    setTimer(300);
    setCode(Array(6).fill(''));
    setCodeValid(true);
    setIsCodeCorrect(false);
    inputsRef.current[0]?.focus();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent && /^\d{6}$/.test(clipboardContent)) {
        const newCode = clipboardContent.split('');
        setCode(newCode);
        
        // Focus the last input
        inputsRef.current[5]?.focus();
        
        // Validate the complete code
        if (clipboardContent === verificationCode) {
          setIsCodeCorrect(true);
          setCodeValid(true);
        } else {
          setIsCodeCorrect(false);
          setCodeValid(false);
        }
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  };

  if (showRegister) {
    return <Register isVisible={true} onClose={() => {}} IsVerify={() => {}} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header with Icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="mail-outline" size={48} color={Theme.colors.primary[500]} />
          </View>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a code to{' '}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
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
              maxLength={6} // Allow pasting but control display
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Paste Button - Show only when no digits entered */}
        {code.every(digit => digit === '') && (
          <View style={styles.pasteContainer}>
            <Button
              title="Paste Code"
              variant="ghost"
              size="sm"
              onPress={handlePasteFromClipboard}
              icon={<Icon name="clipboard-outline" size={16} color={Theme.colors.primary[500]} />}
              iconPosition="left"
              style={styles.pasteButton}
            />
          </View>
        )}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.xl,
    justifyContent: 'center',
  },

  content: {
    width: '100%',
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
  },

  emailText: {
    fontWeight: Theme.typography.fontWeight.semiBold,
    color: Theme.colors.primary[600],
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.md,
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

  pasteContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },

  pasteButton: {
    paddingHorizontal: Theme.spacing.lg,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.error[50],
    padding: Theme.spacing.md,
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
    padding: Theme.spacing.md,
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
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },

  backButton: {
    flex: 1,
  },

  continueButton: {
    flex: 2,
  },
});

export default VerifyCode;
