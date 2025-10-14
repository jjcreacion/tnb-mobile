import { Button, KeyboardDismissWrapper } from '@/components/common';
import { Theme } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

type ValidationState = 'idle' | 'valid' | 'invalid' | 'expired';

const VerifyCode: React.FC<VerifyCodeProps> = ({ onBack, verificationCode, email }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [timer, setTimer] = useState(300);
  const [showRegister, setShowRegister] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  
  // iOS FIX: Track recent input activity to prevent phantom backspaces
  const recentInputRef = useRef<{
    timestamp: number;
    index: number;
    value: string;
  } | null>(null);
  
  // iOS DEBUG SYSTEM - Solo activo en iOS
  const debugLog = useRef<{
    timestamp: string;
    event: string;
    details: any;
    codeState: string[];
  }[]>([]);
  
  const logDebugEvent = useCallback((event: string, details: any) => {
    if (Platform.OS === 'ios') {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
      const logEntry = {
        timestamp,
        event,
        details,
        codeState: [...code]
      };
      debugLog.current.push(logEntry);
      
      // Keep only last 50 entries
      if (debugLog.current.length > 50) {
        debugLog.current = debugLog.current.slice(-50);
      }
      
      console.log(`🔍 iOS OTP DEBUG [${timestamp}] ${event}:`, {
        details,
        currentCode: code,
        codeString: code.join('')
      });
    }
  }, [code]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      // Clear iOS tracking
      if (Platform.OS === 'ios') {
        recentInputRef.current = null;
      }
    };
  }, []);

  // Auto-focus first input on mount - Simplified approach
  useEffect(() => {
    const focusDelay = Platform.OS === 'ios' ? 300 : 100;
    const timeout = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, focusDelay);
    
    timeoutsRef.current.push(timeout);
  }, []);

  // iOS DEBUG - Monitor code changes
  useEffect(() => {
    if (Platform.OS === 'ios') {
      logDebugEvent('CODE_STATE_CHANGED', {
        newCode: [...code],
        codeString: code.join(''),
        emptyCount: code.filter(d => d === '').length,
        filledCount: code.filter(d => d !== '').length
      });
    }
  }, [code, logDebugEvent]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && validationState !== 'valid') {
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          if (newTimer === 0) {
            setValidationState('expired');
          }
          return newTimer;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, validationState]);

  // Helper function to add managed timeouts
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay) as unknown as number;
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  // Validate code helper
  const validateCode = useCallback((codeString: string) => {
    if (codeString.length === 6) {
      // Keep iOS phantom backspace protection even when code is complete
      if (Platform.OS === 'ios') {
        logDebugEvent('CODE_COMPLETE_DETECTED', { 
          reason: 'Code complete - maintaining phantom protection',
          codeString 
        });
      }
      
      if (codeString === verificationCode) {
        setValidationState('valid');
        setIsProcessing(true);
        // Auto-dismiss keyboard after validation
        addTimeout(() => {
          inputsRef.current.forEach(input => input?.blur());
          setIsProcessing(false);
        }, 800);
      } else {
        setValidationState('invalid');
        // Reset validation state after showing error
        addTimeout(() => {
          if (validationState === 'invalid') {
            setValidationState('idle');
          }
        }, 2000);
      }
    } else {
      setValidationState('idle');
    }
  }, [verificationCode, validationState, addTimeout, logDebugEvent]);

  // iOS-specific input handling - FIXED to prevent phantom backspace
  const handleInputChangeiOS = useCallback((value: string, index: number) => {
    logDebugEvent('INPUT_CHANGE_START', {
      rawValue: value,
      index,
      currentCode: [...code],
      isProcessing
    });
    
    if (isProcessing) {
      logDebugEvent('INPUT_BLOCKED_PROCESSING', { value, index });
      return;
    }
    
    // Clean input - only digits
    const cleanValue = value.replace(/\D/g, '');
    
    logDebugEvent('INPUT_CLEANED', {
      originalValue: value,
      cleanedValue: cleanValue,
      length: cleanValue.length,
      index
    });
    
    // Handle iOS auto-complete (full 6-digit code)
    if (cleanValue.length === 6 && index === 0) {
      logDebugEvent('AUTO_COMPLETE_DETECTED', {
        fullCode: cleanValue,
        index
      });
      
      const digits = cleanValue.split('');
      logDebugEvent('AUTO_COMPLETE_SETTING_CODE', {
        digits,
        previousCode: [...code]
      });
      
      setCode(digits);
      validateCode(cleanValue);
      
      // Focus last input briefly then blur for completion
      addTimeout(() => {
        logDebugEvent('AUTO_COMPLETE_FOCUS_LAST', { index: 5 });
        inputsRef.current[5]?.focus();
        addTimeout(() => {
          logDebugEvent('AUTO_COMPLETE_BLUR_LAST', { index: 5 });
          inputsRef.current[5]?.blur();
        }, 300);
      }, 150);
      return;
    }
    
    // Handle paste of multiple digits (but not full auto-complete)
    if (cleanValue.length > 1 && cleanValue.length < 6) {
      logDebugEvent('MULTI_DIGIT_PASTE', {
        value: cleanValue,
        length: cleanValue.length,
        startIndex: index
      });
      
      const newCode = [...code];
      const digits = cleanValue.split('');
      
      // Fill starting from current index
      let fillIndex = index;
      digits.forEach((digit) => {
        if (fillIndex < 6) {
          logDebugEvent('FILLING_DIGIT', {
            digit,
            position: fillIndex,
            previousValue: newCode[fillIndex]
          });
          newCode[fillIndex] = digit;
          fillIndex++;
        }
      });
      
      logDebugEvent('MULTI_DIGIT_SETTING_CODE', {
        newCode,
        previousCode: [...code]
      });
      
      setCode(newCode);
      validateCode(newCode.join(''));
      
      // Focus next available position - NO AUTO ADVANCE TO PREVENT PHANTOM BACKSPACE
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        logDebugEvent('MULTI_DIGIT_FOCUS_NEXT', { nextIndex });
        // Longer delay to prevent iOS quirks
        addTimeout(() => inputsRef.current[nextIndex]?.focus(), 200);
      }
      return;
    }
    
    // Handle single digit input (normal typing) - ENHANCED VERSION
    if (cleanValue.length <= 1) {
      logDebugEvent('SINGLE_DIGIT_INPUT', {
        digit: cleanValue,
        index,
        isEmpty: cleanValue === '',
        previousValue: code[index]
      });
      
      const newCode = [...code];
      const previousValue = newCode[index];
      newCode[index] = cleanValue;
      
      // CRITICAL: Track this input to prevent phantom backspace
      if (cleanValue !== '') {
        recentInputRef.current = {
          timestamp: Date.now(),
          index,
          value: cleanValue
        };
        
        logDebugEvent('RECENT_INPUT_TRACKED', {
          trackedInput: recentInputRef.current
        });
      }
      
      logDebugEvent('SINGLE_DIGIT_SETTING_CODE', {
        newCode,
        previousCode: [...code],
        changedIndex: index,
        previousValue,
        newValue: cleanValue
      });
      
      setCode(newCode);
      
      // Only validate if we have some digits
      if (newCode.some(digit => digit !== '')) {
        logDebugEvent('VALIDATING_CODE', { codeToValidate: newCode.join('') });
        validateCode(newCode.join(''));
      }
      
      // iOS: Manual navigation in keyPress handler instead of auto-advance
      logDebugEvent('iOS_AUTO_ADVANCE_DISABLED', { 
        reason: 'Preventing phantom backspace - manual navigation in keyPress',
        index, 
        digit: cleanValue 
      });
    }
    
    logDebugEvent('INPUT_CHANGE_END', {
      finalValue: cleanValue,
      index,
      resultingCode: [...code]
    });
  }, [code, isProcessing, validateCode, addTimeout, logDebugEvent]);

  // Android input handling (original logic)
  const handleInputChangeAndroid = useCallback((value: string, index: number) => {
    if (isProcessing) return;
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length > 1) {
      // Handle paste of multiple digits
      const digits = cleanValue.slice(0, 6).split('');
      const newCode = Array(6).fill('');
      
      digits.forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      
      setCode(newCode);
      validateCode(newCode.join(''));
      
      // Focus management for paste
      const focusIndex = Math.min(digits.length - 1, 5);
      addTimeout(() => {
        inputsRef.current[focusIndex]?.focus();
      }, 80);
    } else {
      // Handle single character input
      const newCode = [...code];
      newCode[index] = cleanValue;
      setCode(newCode);
      
      validateCode(newCode.join(''));
      
      // Auto-advance to next input
      if (cleanValue && index < 5) {
        addTimeout(() => {
          inputsRef.current[index + 1]?.focus();
        }, 80);
      }
    }
  }, [code, isProcessing, validateCode, addTimeout]);

  // Platform-specific input handler
  const handleInputChange = Platform.OS === 'ios' ? handleInputChangeiOS : handleInputChangeAndroid;

  // iOS-specific backspace handling - FIXED to ignore phantom backspaces
  const handleKeyPressiOS = useCallback((e: any, index: number) => {
    logDebugEvent('KEY_PRESS', {
      key: e.nativeEvent.key,
      index,
      currentValue: code[index],
      currentCode: [...code]
    });
    
    if (e.nativeEvent.key === 'Backspace') {
      logDebugEvent('BACKSPACE_DETECTED', {
        index,
        currentValue: code[index],
        hasContent: code[index] !== ''
      });
      
      // ENHANCED PHANTOM BACKSPACE DETECTION V3
      const now = Date.now();
      const recentInput = recentInputRef.current;
      
      // Multi-condition phantom backspace detection
      const isPhantomBackspace = 
        recentInput !== null && 
        recentInput.index === index && 
        (now - recentInput.timestamp) < 500; // Within 500ms of input
      
      // Additional check: if we have a complete code and get immediate backspace
      const isPhantomOnCompleteCode = 
        recentInput !== null &&
        recentInput.index === index &&
        (now - recentInput.timestamp) < 100 && // Very quick phantom (like your 12ms case)
        code.every(digit => digit !== ''); // Code is complete
      
      if (isPhantomBackspace || isPhantomOnCompleteCode) {
        const reason = isPhantomOnCompleteCode 
          ? 'iOS phantom backspace on complete code - too quick after input'
          : 'iOS phantom backspace detected - too soon after input';
          
        logDebugEvent('PHANTOM_BACKSPACE_IGNORED', {
          index,
          reason,
          recentInput: recentInput,
          timeDiff: now - recentInput.timestamp,
          currentFieldValue: code[index],
          codeState: code,
          isCompleteCode: code.every(digit => digit !== '')
        });
        
        // Clear the tracked input since we handled the phantom backspace
        recentInputRef.current = null;
        return; // IGNORE phantom backspace
      }
      
      // Clear recent input tracking for legitimate backspaces
      if (recentInput && (now - recentInput.timestamp) > 1000) {
        recentInputRef.current = null;
      }
      
      const newCode = [...code];
      
      if (code[index] !== '') {
        // Current field has content - just clear it
        logDebugEvent('BACKSPACE_CLEAR_CURRENT', {
          index,
          clearingValue: code[index]
        });
        
        newCode[index] = '';
        setCode(newCode);
        setValidationState('idle');
        
        logDebugEvent('BACKSPACE_CURRENT_CLEARED', {
          index,
          newCode: [...newCode]
        });
      } else if (index > 0) {
        // Current field empty - clear previous field and move back
        logDebugEvent('BACKSPACE_CLEAR_PREVIOUS', {
          currentIndex: index,
          previousIndex: index - 1,
          previousValue: code[index - 1]
        });
        
        newCode[index - 1] = '';
        setCode(newCode);
        setValidationState('idle');
        
        logDebugEvent('BACKSPACE_PREVIOUS_CLEARED', {
          clearedIndex: index - 1,
          newCode: [...newCode]
        });
        
        // Move focus to previous input with longer delay for iOS
        addTimeout(() => {
          logDebugEvent('BACKSPACE_FOCUS_PREVIOUS', {
            focusIndex: index - 1
          });
          inputsRef.current[index - 1]?.focus();
        }, 100);
      }
    }
    
    // Handle manual navigation for iOS (since auto-advance is disabled)
    if (e.nativeEvent.key >= '0' && e.nativeEvent.key <= '9') {
      const wasEmpty = code[index] === '';
      const newDigit = e.nativeEvent.key;
      
      logDebugEvent('MANUAL_NAVIGATION_CHECK', {
        key: newDigit,
        index,
        wasEmpty,
        shouldAdvance: wasEmpty && index < 5
      });
      
      // Handle overflow to next field if current field has content
      if (!wasEmpty) {
        logDebugEvent('MANUAL_DIGIT_OVERFLOW', {
          reason: 'Field had content - moving new digit to next available field',
          currentIndex: index,
          currentValue: code[index],
          newDigit: newDigit
        });
        
        // Find next available empty field
        let targetIndex = -1;
        for (let i = index + 1; i < 6; i++) {
          if (code[i] === '') {
            targetIndex = i;
            break;
          }
        }
        
        if (targetIndex !== -1) {
          // Place new digit in next available field
          const newCode = [...code];
          newCode[targetIndex] = newDigit;
          
          // Track the input for phantom backspace protection
          recentInputRef.current = {
            timestamp: Date.now(),
            index: targetIndex,
            value: newDigit
          };
          
          logDebugEvent('RECENT_INPUT_TRACKED', {
            trackedInput: recentInputRef.current
          });
          
          logDebugEvent('MANUAL_OVERFLOW_SETTING_CODE', {
            newCode,
            previousCode: [...code],
            targetIndex,
            newValue: newDigit,
            originalIndex: index,
            originalValue: code[index]
          });
          
          setCode(newCode);
          validateCode(newCode.join(''));
          
          // Move focus to the field where we placed the digit
          addTimeout(() => {
            logDebugEvent('MANUAL_OVERFLOW_FOCUS', {
              fromIndex: index,
              toIndex: targetIndex
            });
            inputsRef.current[targetIndex]?.focus();
          }, 150);
        } else {
          // No available fields - just ignore the input
          logDebugEvent('MANUAL_OVERFLOW_IGNORED', {
            reason: 'No available empty fields to place new digit',
            currentIndex: index,
            newDigit: newDigit
          });
        }
        
        return; // Prevent default handling
      }
      
      // Only navigate if the field was empty (new input, not replacement)
      if (wasEmpty && index < 5) {
        addTimeout(() => {
          logDebugEvent('MANUAL_ADVANCE_EXECUTED', {
            fromIndex: index,
            toIndex: index + 1
          });
          inputsRef.current[index + 1]?.focus();
        }, 150);
      }
    }
  }, [code, addTimeout, logDebugEvent, validateCode]);

  // Android backspace handling (original)
  const handleKeyPressAndroid = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      // Clear previous field and move focus
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      setValidationState('idle');
      
      addTimeout(() => {
        inputsRef.current[index - 1]?.focus();
      }, 50);
    }
  }, [code, addTimeout]);

  // Platform-specific keypress handler
  const handleKeyPress = Platform.OS === 'ios' ? handleKeyPressiOS : handleKeyPressAndroid;

  // Format timer display
  const formatTime = useCallback(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [timer]);

  // Handle navigation to next screen
  const handleNext = useCallback(() => {
    if (validationState === 'valid') {
      setShowRegister(true);
    }
  }, [validationState]);

  // Handle code resend - Simplified cross-platform approach
  const handleResendCode = useCallback(() => {
    // Clear existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    // Reset state
    setTimer(300);
    setCode(Array(6).fill(''));
    setValidationState('idle');
    setIsProcessing(false);
    
    // Simple focus with platform-specific delay
    const focusDelay = Platform.OS === 'ios' ? 200 : 100;
    addTimeout(() => {
      inputsRef.current[0]?.focus();
    }, focusDelay);
  }, [addTimeout]);

  // iOS-specific clipboard handling - Simplified and robust
  const handlePasteFromClipboardiOS = useCallback(async () => {
    if (isProcessing) return;
    
    try {
      const clipboardContent = await Clipboard.getString();
      const cleanContent = clipboardContent.replace(/\D/g, '');
      
      if (cleanContent.length === 6) {
        // Perfect 6-digit code
        const digits = cleanContent.split('');
        setCode(digits);
        validateCode(cleanContent);
        
        // Focus last input briefly
        addTimeout(() => {
          inputsRef.current[5]?.focus();
          addTimeout(() => inputsRef.current[5]?.blur(), 200);
        }, 100);
      } else if (cleanContent.length > 0 && cleanContent.length < 6) {
        // Partial code - fill from beginning
        const newCode = Array(6).fill('');
        const digits = cleanContent.split('');
        
        digits.forEach((digit, i) => {
          newCode[i] = digit;
        });
        
        setCode(newCode);
        
        // Focus next empty position
        const nextIndex = Math.min(digits.length, 5);
        addTimeout(() => {
          inputsRef.current[nextIndex]?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Clipboard paste failed:', error);
    }
  }, [isProcessing, validateCode, addTimeout]);

  // Android clipboard handling (original)
  const handlePasteFromClipboardAndroid = useCallback(async () => {
    if (isProcessing) return;
    
    try {
      const clipboardContent = await Clipboard.getString();
      const cleanContent = clipboardContent.replace(/\D/g, '');
      
      if (cleanContent.length === 6) {
        const newCode = cleanContent.split('');
        setCode(newCode);
        validateCode(cleanContent);
        
        // Focus last input
        addTimeout(() => {
          inputsRef.current[5]?.focus();
        }, 150);
      }
    } catch (error) {
      console.error('Clipboard access failed:', error);
    }
  }, [isProcessing, validateCode, addTimeout]);

  // Platform-specific clipboard handler
  const handlePasteFromClipboard = Platform.OS === 'ios' ? handlePasteFromClipboardiOS : handlePasteFromClipboardAndroid;

  // iOS DEBUG - Export debug logs
  const exportDebugLogs = useCallback(() => {
    if (Platform.OS === 'ios') {
      console.log('🔍 ===== iOS OTP DEBUG REPORT =====');
      console.log('Total events:', debugLog.current.length);
      console.log('Current code state:', code);
      console.log('Current validation state:', validationState);
      console.log('\n📋 Event Log:');
      
      debugLog.current.forEach((entry, i) => {
        console.log(`${i + 1}. [${entry.timestamp}] ${entry.event}`);
        console.log('   Details:', entry.details);
        console.log('   Code State:', entry.codeState);
        console.log('   ---');
      });
      

      
      // Copy to clipboard for easy sharing
      Clipboard.setString(JSON.stringify({
        currentCode: code,
        validationState,
        events: debugLog.current,
        timestamp: new Date().toISOString()
      }, null, 2));
      
      console.log('📋 Debug logs copied to clipboard');
    }
  }, [code, validationState]);

  // iOS DEBUG - Clear debug logs
  const clearDebugLogs = useCallback(() => {
    if (Platform.OS === 'ios') {
      debugLog.current = [];
      console.log('🧹 Debug logs cleared');
    }
  }, []);

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
                    key={`code-input-${index}`}
                    ref={(ref) => { inputsRef.current[index] = ref; }}
                    style={[
                      styles.codeInput,
                      validationState === 'invalid' && styles.codeInputError,
                      validationState === 'expired' && styles.codeInputError,
                      validationState === 'valid' && styles.codeInputSuccess,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleInputChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    maxLength={Platform.OS === 'ios' ? (index === 0 ? 6 : 1) : 6}
                    keyboardType="numeric"
                    textAlign="center"
                    autoCorrect={false}
                    autoComplete="off"
                    autoCapitalize="none"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    editable={!isProcessing}
                    {...(Platform.OS === 'ios' && {
                      onFocus: () => logDebugEvent('INPUT_FOCUSED', { index, currentValue: digit }),
                      onBlur: () => logDebugEvent('INPUT_BLURRED', { index, currentValue: digit }),
                      onSelectionChange: (e) => logDebugEvent('SELECTION_CHANGED', { 
                        index, 
                        selection: e.nativeEvent.selection,
                        currentValue: digit 
                      }),
                      selectTextOnFocus: false,
                      clearTextOnFocus: false,
                      contextMenuHidden: true,
                      textContentType: index === 0 ? "oneTimeCode" : "none",
                      spellCheck: false,
                      smartInsertDelete: false,
                      enablesReturnKeyAutomatically: false,
                      keyboardAppearance: 'default',
                      dataDetectorTypes: 'none'
                    })}
                    {...(Platform.OS === 'android' && {
                      selectTextOnFocus: false,
                      clearTextOnFocus: false,
                      contextMenuHidden: false
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

              {/* iOS DEBUG BUTTONS - Solo visible en iOS durante desarrollo */}
              {Platform.OS === 'ios' && __DEV__ && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>🔍 iOS OTP Debug</Text>
                  <View style={styles.debugButtons}>
                    <Button
                      title="Export Logs"
                      variant="ghost"
                      size="sm"
                      onPress={exportDebugLogs}
                      style={styles.debugButton}
                    />
                    <Button
                      title="Clear Logs"
                      variant="ghost"
                      size="sm"
                      onPress={clearDebugLogs}
                      style={styles.debugButton}
                    />
                  </View>
                  <Text style={styles.debugInfo}>
                    Events: {debugLog.current.length} | Code: "{code.join('')}" | State: {validationState}
                  </Text>
                </View>
              )}

              {/* Status Messages */}
              {validationState === 'invalid' && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={20} color={Theme.colors.error[500]} />
                  <Text style={styles.errorText}>
                    Invalid verification code
                  </Text>
                </View>
              )}

              {validationState === 'expired' && (
                <View style={styles.errorContainer}>
                  <Icon name="time" size={20} color={Theme.colors.error[500]} />
                  <Text style={styles.errorText}>
                    Code has expired
                  </Text>
                </View>
              )}

              {validationState === 'valid' && (
                <View style={styles.successContainer}>
                  <Icon name="checkmark-circle" size={20} color={Theme.colors.success[500]} />
                  <Text style={styles.successText}>
                    Code verified successfully!
                  </Text>
                </View>
              )}

              {/* Timer */}
              {validationState !== 'valid' && timer > 0 && (
                <View style={styles.timerContainer}>
                  <Icon name="time-outline" size={16} color={Theme.colors.text.tertiary} />
                  <Text style={styles.timerText}>
                    Code expires in {formatTime()}
                  </Text>
                </View>
              )}

              {/* Resend Code */}
              {(timer === 0 || validationState === 'expired') && (
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
                  disabled={validationState !== 'valid'}
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
      android: Theme.spacing['4xl'],
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

  // Debug styles - Solo para desarrollo iOS
  debugContainer: {
    backgroundColor: Theme.colors.background.secondary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginVertical: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
  },

  debugTitle: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },

  debugButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },

  debugButton: {
    flex: 1,
    paddingHorizontal: Theme.spacing.sm,
  },

  debugInfo: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
});

export default VerifyCode;
