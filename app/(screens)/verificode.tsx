import { Button, KeyboardDismissWrapper } from '@/components/common';
import { Theme } from '@/constants/Theme';
import { useVerificationCodeDebug } from '@/hooks/useVerificationCodeDebug';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Register from './register';

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
  
  // iOS Fix: Track the last input action to prevent automatic backspace
  const lastInputAction = useRef<{
    timestamp: number;
    index: number;
    action: 'input' | 'backspace';
  } | null>(null);
  
  // Debug hook para monitorear el comportamiento
  const { debugLog, logInput, validateCodeIntegrity } = useVerificationCodeDebug(code, {
    enabled: __DEV__,
    logStateChanges: true,
    logInputEvents: true,
    logFocusEvents: false,
  });

  useEffect(() => {
    // Auto-focus first input with platform-specific timing
    const focusDelay = Platform.OS === 'ios' ? 100 : 50;
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, focusDelay);
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
    // Validate code integrity before processing
    if (!validateCodeIntegrity()) {
      debugLog('Code integrity check failed, resetting...');
      setCode(Array(6).fill(''));
      return;
    }
    
    logInput(index, code[index] || '', value, 'change');
    
    // Track this input action for iOS backspace prevention
    lastInputAction.current = {
      timestamp: Date.now(),
      index,
      action: 'input'
    };
    
    // Clean the value to only contain digits
    const cleanValue = value.replace(/\D/g, '');
    
    // If pasting multiple characters (6-digit code)
    if (cleanValue.length > 1) {
      debugLog(`Paste detected - Length: ${cleanValue.length}, Value: "${cleanValue}"`);
      const digits = cleanValue.slice(0, 6).split('');
      const newCode = ['', '', '', '', '', ''];
      
      // Fill the code array with the pasted digits
      for (let i = 0; i < digits.length && i < 6; i++) {
        newCode[i] = digits[i];
      }
      
      debugLog('Setting pasted code:', newCode);
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
      const focusDelay = Platform.OS === 'ios' ? 100 : 50;
      setTimeout(() => {
        inputsRef.current[focusIndex]?.focus();
      }, focusDelay);
      
      return; // Early return to avoid further processing
    }
    
    // Handle single character input (0 or 1 character)
    const newCode = [...code];
    const oldValue = code[index] || '';
    
    // iOS Special Case: Handle backspace through onChangeText
    if (Platform.OS === 'ios' && cleanValue === '' && oldValue !== '') {
      // This is a backspace (clearing the current field)
      debugLog(`iOS backspace detected via onChangeText - Index: ${index}`);
      newCode[index] = '';
      setCode(newCode);
      
      // Reset validation states
      setIsCodeCorrect(false);
      setCodeValid(true);
      return; // Don't auto-advance on backspace
    }
    
    // iOS Special Case: Handle backspace navigation (when field was already empty)
    if (Platform.OS === 'ios' && cleanValue === '' && oldValue === '' && index > 0) {
      // User is trying to backspace from an empty field, move to previous and clear it
      debugLog(`iOS backspace navigation - moving from ${index} to ${index - 1}`);
      newCode[index - 1] = '';
      setCode(newCode);
      
      // Move focus to previous field
      setTimeout(() => {
        inputsRef.current[index - 1]?.focus();
      }, 50);
      
      // Reset validation states
      setIsCodeCorrect(false);
      setCodeValid(true);
      return;
    }
    
    // Normal digit input
    newCode[index] = cleanValue;
    debugLog(`Single digit update - Index: ${index}, "${oldValue}" → "${cleanValue}"`);
    setCode(newCode);
    
    // Auto-advance logic: only move focus if we entered a digit (not empty)
    if (cleanValue !== '' && index < 5) {
      const focusDelay = Platform.OS === 'ios' ? 100 : 50;
      setTimeout(() => {
        inputsRef.current[index + 1]?.focus();
      }, focusDelay);
    }
    
    // Validation logic
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
  };

  const handleKeyPress = (e: any, index: number) => {
    debugLog(`Key press - Index: ${index}, Key: "${e.nativeEvent.key}"`);
    
    if (e.nativeEvent.key === 'Backspace') {
      // CRITICAL FIX: Prevent iOS automatic backspace when entering digits
      // iOS tends to send automatic backspace events when replacing text
      const now = Date.now();
      
      // Check if this backspace comes immediately after an input (within 200ms)
      // This indicates it's likely an automatic iOS backspace, not user-initiated
      const isLikelyAutomaticBackspace = Platform.OS === 'ios' && 
        lastInputAction.current &&
        lastInputAction.current.action === 'input' &&
        (now - lastInputAction.current.timestamp) < 200;
      
      if (isLikelyAutomaticBackspace) {
        debugLog(`Ignoring automatic iOS backspace at index ${index} (${now - lastInputAction.current!.timestamp}ms after input)`);
        return; // Don't process this backspace
      }
      
      // Track this backspace action
      lastInputAction.current = {
        timestamp: now,
        index,
        action: 'backspace'
      };
      
      const newCode = [...code];
      
      if (code[index] !== '') {
        // Current field has a digit, delete it and stay in current field
        newCode[index] = '';
        debugLog(`Backspace - clearing current field ${index}`);
        setCode(newCode);
        // Cursor stays in current field (no focus change)
      } else if (index > 0) {
        // Current field is empty, move to previous field and clear it
        newCode[index - 1] = '';
        debugLog(`Backspace - clearing previous field ${index - 1}`);
        setCode(newCode);
        
        // Move focus to previous field
        const focusDelay = Platform.OS === 'ios' ? 50 : 25;
        setTimeout(() => {
          inputsRef.current[index - 1]?.focus();
        }, focusDelay);
      }
      // If we're at the first field (index 0) and it's empty, do nothing
      
      // Reset validation states
      setIsCodeCorrect(false);
      setCodeValid(true);
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
    
    // Focus first input with platform-specific timing
    const focusDelay = Platform.OS === 'ios' ? 100 : 50;
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, focusDelay);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      debugLog(`Clipboard content: "${clipboardContent}"`);
      
      if (clipboardContent && /^\d{6}$/.test(clipboardContent)) {
        const newCode = clipboardContent.split('');
        debugLog('Setting clipboard code:', newCode);
        setCode(newCode);
        
        // Focus the last input with platform-specific timing
        const focusDelay = Platform.OS === 'ios' ? 150 : 100;
        setTimeout(() => {
          inputsRef.current[5]?.focus();
        }, focusDelay);
        
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
    <>
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]}
      />
      <KeyboardDismissWrapper style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
          enabled={Platform.OS === 'ios'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
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
              key={`code-input-${index}`} // More stable key
              ref={(ref) => { inputsRef.current[index] = ref; }}
              style={[
                styles.codeInput,
                !codeValid && !isCodeCorrect && styles.codeInputError,
                isCodeCorrect && styles.codeInputSuccess,
              ]}
              value={digit}
              onChangeText={(value) => handleInputChange(value, index)}
              {...(Platform.OS === 'android' && {
                onKeyPress: (e) => handleKeyPress(e, index)
              })}
              {...(Platform.OS === 'ios' && {
                // iOS: Handle backspace through onChangeText instead of onKeyPress
                // to avoid automatic backspace events
              })}
              maxLength={1} // Consistent maxLength=1 for both platforms
              keyboardType="numeric"
              textAlign="center"
              selectTextOnFocus={false} // Disabled for both platforms to prevent selection issues
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              contextMenuHidden={false}
              returnKeyType="next"
              blurOnSubmit={false}
              clearTextOnFocus={false} // iOS: Don't clear text when gaining focus
              textContentType="oneTimeCode" // iOS: Help with OTP detection
              {...(Platform.OS === 'ios' && {
                spellCheck: false,
                smartInsertDelete: false,
                enablesReturnKeyAutomatically: false
              })}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </KeyboardDismissWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.xl,
    justifyContent: 'center',
    paddingTop: Theme.spacing.xl,
    paddingBottom: Platform.select({
      ios: Theme.spacing.xl,
      android: Theme.spacing['4xl'], // Espacio extra para evitar solapamiento
    }),
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
