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
  const [animatingField, setAnimatingField] = useState<number | null>(null);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  
  // iOS Fix: Track the last input action to prevent automatic backspace
  const lastInputAction = useRef<{
    timestamp: number;
    index: number;
    action: 'input' | 'backspace';
  } | null>(null);
  
  // Additional protection: track recent changes to prevent loops
  const recentChanges = useRef<Set<string>>(new Set());
  
  // Track specific actions for better debugging and control
  const lastActionRef = useRef<{
    type: 'input' | 'backspace' | 'auto-clear';
    index: number;
    timestamp: number;
    value?: string;
  } | null>(null);
  
  // Debug hook para monitorear el comportamiento - REACTIVADO PARA DEBUGGEAR
  const { debugLog, validateCodeIntegrity } = useVerificationCodeDebug(code, {
    enabled: __DEV__, // Reactivado para debuggear el problema
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
    debugLog(`INPUT CHANGE - Index: ${index}, Value: "${value}", Current: "${code[index] || ''}", Platform: ${Platform.OS}`);
    
    // Create a unique key for this change to detect duplicates
    const changeKey = `${index}-${value}-${Date.now()}`;
    
    // Enhanced duplicate detection
    const currentValue = code[index] || '';
    
    // Check for exact duplicates: same index, same value, same current state
    const isDuplicateValue = value === currentValue && currentValue !== '';
    
    if (isDuplicateValue) {
      debugLog(`DUPLICATE VALUE DETECTED - Ignoring: Index ${index}, Value "${value}"`);
      return;
    }
    
    // Check if we've seen this exact change very recently (within 100ms)
    const now = Date.now();
    const recentChangeKeys = Array.from(recentChanges.current);
    const isDuplicateTiming = recentChangeKeys.some(key => {
      const [keyIndex, keyValue, timestamp] = key.split('-');
      return parseInt(timestamp) > (now - 100) && 
             keyIndex === index.toString() && 
             keyValue === value;
    });
    
    if (isDuplicateTiming) {
      debugLog(`DUPLICATE TIMING DETECTED - Ignoring: ${changeKey}`);
      return;
    }
    
    // Track this change
    recentChanges.current.add(changeKey);
    setTimeout(() => {
      recentChanges.current.delete(changeKey);
    }, 200);
    
    // Validate code integrity before processing
    if (!validateCodeIntegrity()) {
      debugLog('Code integrity check failed, resetting...');
      setCode(Array(6).fill(''));
      return;
    }
    
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
      
      // Smooth paste animation: highlight each field as it fills
      for (let i = 0; i < digits.length; i++) {
        setTimeout(() => {
          setAnimatingField(i);
          setTimeout(() => setAnimatingField(null), 100);
        }, i * 80);
      }
      
      // Move focus to the last filled position with smooth timing
      const focusIndex = Math.min(digits.length, 5);
      const focusDelay = Platform.OS === 'ios' ? 200 + (digits.length * 80) : 150 + (digits.length * 80);
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
      // Check if this is an automatic iOS clear event right after completing 6 digits
      const completeCode = code.join('');
      const wasCompleteCode = completeCode.length === 6;
      
      // Check if this happened very recently after an input action
      const now = Date.now();
      const recentInput = lastInputAction.current && 
        lastInputAction.current.action === 'input' &&
        (now - lastInputAction.current.timestamp) < 200;
        
      // Check if this is a legitimate backspace action
      const recentBackspace = lastActionRef.current && 
        lastActionRef.current.type === 'backspace' &&
        (now - lastActionRef.current.timestamp) < 500; // Allow more time for legitimate backspace
      
      debugLog(`BACKSPACE CHECK - wasComplete: ${wasCompleteCode}, recentInput: ${recentInput}, recentBackspace: ${recentBackspace}, index: ${index}`);
        
      // If this is NOT a legitimate backspace and the code was complete and there was recent input
      if (wasCompleteCode && recentInput && !recentBackspace && index === 5) {
        debugLog(`IGNORING iOS AUTO-CLEAR after complete code - Index: ${index}`);
        return; // This is likely iOS auto-clearing after OTP completion
      }
      
      // If this IS a legitimate backspace, allow it to proceed
      if (recentBackspace) {
        debugLog(`ALLOWING LEGITIMATE BACKSPACE - Index: ${index}`);
      }
      
      debugLog(`iOS BACKSPACE DETECTED - Index: ${index}, "${oldValue}" → ""`);
      
      // Mark this as a legitimate backspace action when value is actually cleared
      lastActionRef.current = {
        type: 'backspace',
        index: index,
        timestamp: Date.now(),
        value: oldValue
      };
      
      // This is a legitimate backspace action (digit was cleared)
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      
      // Visual feedback
      setAnimatingField(index);
      setTimeout(() => setAnimatingField(null), 200);
      
      // Auto-navigate to previous field after deleting (if there is a previous field)
      if (index > 0) {
        debugLog(`BACKSPACE AUTO-NAVIGATE - From ${index} to ${index - 1}`);
        const previousIndex = index - 1;
        setTimeout(() => {
          debugLog(`FOCUSING PREVIOUS FIELD - Index: ${previousIndex}`);
          inputsRef.current[previousIndex]?.focus();
        }, 150); // Slightly longer delay for iOS
      } else {
        debugLog(`BACKSPACE STAY - Already at first field (${index})`);
      }
      
      // Reset validation states
      setIsCodeCorrect(false);
      setCodeValid(true);
      return;
    }
    
    // iOS Special Case: Handle backspace navigation from empty field
    if (Platform.OS === 'ios' && cleanValue === '' && oldValue === '' && index > 0) {
      // This could be a legitimate backspace from empty field
      // But only if it's not right after an auto-advance
      const now = Date.now();
      const recentAutoAdvance = lastInputAction.current && 
        lastInputAction.current.action === 'input' &&
        (now - lastInputAction.current.timestamp) < 300; // Give more time for auto-advance
      
      if (recentAutoAdvance) {
        debugLog(`IGNORING potential iOS navigation backspace - too soon after input`);
        return;
      }
      
      debugLog(`iOS NAVIGATION BACKSPACE - From empty field ${index} to ${index - 1}`);
      
      // Mark this as a legitimate backspace navigation action
      lastActionRef.current = {
        type: 'backspace',
        index: index - 1,
        timestamp: Date.now(),
        value: code[index - 1] || ''
      };
      
      // User backspaced from empty field - move to previous and clear it
      const newCode = [...code];
      const previousIndex = index - 1;
      newCode[previousIndex] = '';
      setCode(newCode);
      
      // Visual feedback and focus change
      setAnimatingField(previousIndex);
      setTimeout(() => {
        inputsRef.current[previousIndex]?.focus();
        setAnimatingField(null);
      }, 100);
      
      // Reset validation states
      setIsCodeCorrect(false);
      setCodeValid(true);
      return;
    }
    
    // Normal digit input
    const currentTime = Date.now();
    const recentBackspace = lastActionRef.current && 
      lastActionRef.current.type === 'backspace' &&
      (currentTime - lastActionRef.current.timestamp) < 500;
      
    debugLog(`SETTING DIGIT - Index: ${index}, Value: "${cleanValue}", AfterBackspace: ${recentBackspace}`);
    
    // Mark this as an input action (not from backspace)
    lastActionRef.current = {
      type: 'input',
      index: index,
      timestamp: currentTime,
      value: cleanValue
    };
    
    newCode[index] = cleanValue;
    setCode(newCode);
    
    // Smart auto-advance logic with smooth transitions
    if (cleanValue !== '' && index < 5) {
      debugLog(`AUTO-ADVANCE - From ${index} to ${index + 1}`);
      // Brief visual feedback before advancing
      setAnimatingField(index);
      
      const focusDelay = Platform.OS === 'ios' ? 120 : 80;
      setTimeout(() => {
        // Clear animation and move to next field
        setAnimatingField(null);
        inputsRef.current[index + 1]?.focus();
        
        // Optional: Pre-select text in next field for better UX
        setTimeout(() => {
          if (Platform.OS === 'android') {
            inputsRef.current[index + 1]?.setSelection(0, 0);
          }
        }, 20);
      }, focusDelay);
    }
    
    // Enhanced validation logic with smooth feedback
    const completeCode = newCode.join('');
    if (completeCode.length === 6) {
      // Code complete - provide immediate feedback
      if (completeCode === verificationCode) {
        setIsCodeCorrect(true);
        setCodeValid(true);
        
        // Success animation: briefly highlight all fields
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            setAnimatingField(i);
            setTimeout(() => setAnimatingField(null), 150);
          }, i * 50);
        }
        
        // Auto-dismiss keyboard for clean UX
        setTimeout(() => {
          inputsRef.current[5]?.blur();
        }, 500);
        
      } else {
        setIsCodeCorrect(false);
        setCodeValid(false);
        
        // Error animation: shake effect on all fields
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            setAnimatingField(i);
            setTimeout(() => setAnimatingField(null), 200);
          }, i * 30);
        }
      }
    } else {
      // Reset validation states when code is incomplete
      setIsCodeCorrect(false);
      setCodeValid(true);
    }
  };

  const handleBackspaceAction = (index: number) => {
    debugLog(`BACKSPACE ACTION - Index: ${index}`);
    
    // Mark that this is a legitimate backspace action
    lastActionRef.current = {
      type: 'backspace',
      index: index,
      timestamp: Date.now()
    };
    
    if (index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputsRef.current[index - 1]?.focus();
      debugLog(`BACKSPACE - Cleared index ${index - 1}, focused previous`);
    }
  };  const handleKeyPress = (e: any, index: number) => {
    debugLog(`KEY PRESS - Index: ${index}, Key: "${e.nativeEvent.key}", Platform: ${Platform.OS}`);
    
    if (e.nativeEvent.key === 'Backspace') {
      debugLog(`MANUAL BACKSPACE DETECTED - Index: ${index}, Platform: ${Platform.OS}`);
      
      // Mark this as a legitimate manual backspace action
      lastActionRef.current = {
        type: 'backspace',
        index: index,
        timestamp: Date.now(),
        value: code[index] || ''
      };
      
      // Also update the old tracking for compatibility
      lastInputAction.current = {
        timestamp: Date.now(),
        index,
        action: 'backspace'
      };
      
      if (Platform.OS === 'android') {
        debugLog(`EXECUTING BACKSPACE ACTION - Index: ${index}`);
        // Execute backspace logic - this will handle the visual updates
        handleBackspaceAction(index);
      } else {
        debugLog(`iOS BACKSPACE - Will be handled by onChangeText with recentBackspace=true`);
        // For iOS, let onChangeText handle it but it will now know it's legitimate
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
        setCode(newCode);
        
        // Smooth clipboard paste animation
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            setAnimatingField(i);
            setTimeout(() => setAnimatingField(null), 120);
          }, i * 100);
        }
        
        // Focus the last input with coordinated timing
        const focusDelay = Platform.OS === 'ios' ? 800 : 700;
        setTimeout(() => {
          inputsRef.current[5]?.focus();
        }, focusDelay);
        
        // Validate the complete code with slight delay for better UX
        setTimeout(() => {
          if (clipboardContent === verificationCode) {
            setIsCodeCorrect(true);
            setCodeValid(true);
          } else {
            setIsCodeCorrect(false);
            setCodeValid(false);
          }
        }, 700);
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
                animatingField === index && styles.codeInputAnimating,
              ]}
              value={digit}
              onChangeText={(value) => handleInputChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
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

  codeInputAnimating: {
    borderColor: Theme.colors.primary[400],
    backgroundColor: Theme.colors.primary[50],
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
    shadowColor: Theme.colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
