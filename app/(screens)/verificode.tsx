import { Button, KeyboardDismissWrapper } from '@/components/common';
import { Theme } from '@/constants/Theme';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Register from './register';

interface VerifyCodeProps {
  verificationCode: string;
  onBack: () => void;
  email: string;
}

type ValidationState = 'idle' | 'valid' | 'invalid' | 'expired';

// Debug configuration - Enable only when debugging OTP issues
const DEBUG_OTP = __DEV__ && false;

const VerifyCode: React.FC<VerifyCodeProps> = ({ onBack, verificationCode, email }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [timer, setTimer] = useState(300);
  const [showRegister, setShowRegister] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasValidClipboard, setHasValidClipboard] = useState(false);
  const [storedPassword, setStoredPassword] = useState<string>('');
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const validationTimeoutRef = useRef<number | null>(null);
  
  // Track recent input activity to prevent phantom backspaces (iOS)
  const recentInputRef = useRef<{
    timestamp: number;
    index: number;
    value: string;
  } | null>(null);
  
  // Track replacement processing to prevent visual glitch
  const replacementProcessingRef = useRef<{
    index: number;
    timestamp: number;
  } | null>(null);

  // Debug system - Only active when DEBUG_OTP is enabled
  const debugLog = useRef<{
    timestamp: string;
    event: string;
    details: any;
    codeState: string[];
    platform: string;
  }[]>([]);

  const logDebugEvent = useCallback((event: string, details: any) => {
    if (!DEBUG_OTP) return; // Skip logging if debug is disabled

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    const platform = Platform.OS;
    const logEntry = {
      timestamp,
      event,
      details,
      codeState: [...code],
      platform
    };
    debugLog.current.push(logEntry);

    // Keep only last 100 entries
    if (debugLog.current.length > 100) {
      debugLog.current = debugLog.current.slice(-100);
    }

    // Enhanced logging with platform identification
    const platformIcon = platform === 'ios' ? '🍎' : '🤖';
    console.log(`🔍 ${platformIcon} ${platform.toUpperCase()} OTP DEBUG [${timestamp}] ${event}:`, {
      details,
      currentCode: code,
      codeString: code.join(''),
      platform
    });
  }, [code]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      // Clear validation timeout
      if (validationTimeoutRef.current !== null) {
        clearTimeout(validationTimeoutRef.current);
      }
      // Clear iOS tracking
      if (Platform.OS === 'ios') {
        recentInputRef.current = null;
      }
    };
  }, []);

  // Load password from AsyncStorage on mount
  useEffect(() => {
    const loadPassword = async () => {
      try {
        const password = await AsyncStorage.getItem('passwordForSignUp');
        if (password) {
          setStoredPassword(password);
        }
      } catch (error) {
        console.error('Error loading password from AsyncStorage:', error);
      }
    };
    loadPassword();
  }, []);

  // Auto-focus first input on mount - Optimized approach
  useEffect(() => {
    // Use requestAnimationFrame for immediate, smooth focus
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const frame = requestAnimationFrame(() => {
      // Small delay only for iOS to ensure component is ready
      if (Platform.OS === 'ios') {
        timeoutId = setTimeout(() => {
          inputsRef.current[0]?.focus();
        }, 100);
      } else {
        inputsRef.current[0]?.focus();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Monitor code changes for debugging
  useEffect(() => {
    if (DEBUG_OTP) {
      logDebugEvent('CODE_STATE_CHANGED', {
        newCode: [...code],
        codeString: code.join(''),
        emptyCount: code.filter(d => d === '').length,
        filledCount: code.filter(d => d !== '').length,
        platform: Platform.OS
      });
    }
  }, [code, logDebugEvent]);

  // Monitor validation state changes
  useEffect(() => {
    if (DEBUG_OTP) {
      logDebugEvent('VALIDATION_STATE_CHANGED', {
        newValidationState: validationState,
        currentCode: code.join(''),
        verificationCode,
        match: code.join('') === verificationCode
      });
    }
  }, [validationState, code, verificationCode, logDebugEvent]);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (timer > 0 && validationState !== 'valid') {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          const newTimer = prevTimer - 1;
          if (newTimer === 0) {
            setValidationState('expired');
          }
          return newTimer;
        });
      }, 1000);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [validationState]);

  // Helper function to add managed timeouts
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay) as unknown as number;
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  // Check clipboard for valid 6-digit code that matches verification code
  const checkClipboardForValidCode = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // Clean the clipboard content (remove spaces, dashes, etc.)
      const cleanedContent = clipboardContent.replace(/\D/g, '');

      // Check if it's exactly 6 digits AND matches verification code
      const isValid6DigitCode = /^\d{6}$/.test(cleanedContent);
      const isCorrectCode = cleanedContent === verificationCode;
      const shouldShowPasteButton = isValid6DigitCode && isCorrectCode;

      logDebugEvent('CLIPBOARD_CHECK', {
        originalContent: clipboardContent,
        cleanedContent,
        isValid6Digit: isValid6DigitCode,
        isCorrectCode: isCorrectCode,
        shouldShowPasteButton: shouldShowPasteButton,
        expectedCode: verificationCode,
        length: cleanedContent.length,
        platform: Platform.OS
      });

      setHasValidClipboard(shouldShowPasteButton);
      return shouldShowPasteButton;
    } catch (error) {
      logDebugEvent('CLIPBOARD_CHECK_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: Platform.OS
      });
      setHasValidClipboard(false);
      return false;
    }
  }, [logDebugEvent, verificationCode]);

  // Monitor clipboard changes periodically
  useEffect(() => {
    // Initial check
    checkClipboardForValidCode();

    // Check clipboard every 2 seconds when component is focused
    const interval = setInterval(() => {
      checkClipboardForValidCode();
    }, 2000);

    return () => clearInterval(interval);
  }, [checkClipboardForValidCode]);

  // Optimized focus function for immediate response
  const focusInput = useCallback((index: number) => {
    requestAnimationFrame(() => {
      inputsRef.current[index]?.focus();
    });
  }, []);

  // Validate code helper - Only validates when code is complete (6 digits)
  const validateCode = useCallback((codeString: string) => {
    // Cancel any pending validation timeout when user makes changes
    if (validationTimeoutRef.current !== null) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
      logDebugEvent('VALIDATION_TIMEOUT_CANCELLED', {
        reason: 'User made changes to code'
      });
    }

    if (codeString.length === 6) {
      // Code is complete - validate correctness
      if (Platform.OS === 'ios') {
        logDebugEvent('CODE_COMPLETE_DETECTED', {
          reason: 'Code complete - validating',
          codeString
        });
      }

      if (codeString === verificationCode) {
        logDebugEvent('VALIDATION_SUCCESS', {
          codeString,
          verificationCode,
          newState: 'valid'
        });
        setValidationState('valid');
        // Dismiss keyboard immediately
        inputsRef.current.forEach(input => input?.blur());
      } else {
        logDebugEvent('VALIDATION_FAILED', {
          codeString,
          verificationCode,
          match: codeString === verificationCode,
          newState: 'invalid'
        });
        setValidationState('invalid');
        // Keep invalid state - user must edit to clear the error
      }
    } else if (codeString.length < 6) {
      // Code is incomplete - reset to idle immediately
      // This allows user to correct their input
      setValidationState((prevState) => {
        if (prevState !== 'idle') {
          logDebugEvent('VALIDATION_RESET_TO_IDLE', {
            reason: 'Code incomplete - user is editing',
            codeLength: codeString.length
          });
          return 'idle';
        }
        return prevState;
      });
    }
  }, [verificationCode, logDebugEvent]);

  // Smart Auto-Paste: Automatically fill code from clipboard if valid and correct
  // Track if we've already auto-pasted to prevent multiple auto-pastes
  const hasAutoPastedRef = useRef(false);
  const lastClipboardContentRef = useRef<string>('');

  useEffect(() => {
    const attemptSmartAutoPaste = async () => {
      try {
        // Don't auto-paste if code is already filled
        const currentCodeString = code.join('');
        if (currentCodeString.length === 6) {
          logDebugEvent('SMART_AUTO_PASTE_SKIP', {
            reason: 'Code already filled',
            currentCode: currentCodeString
          });
          return;
        }

        // Get clipboard content
        const clipboardContent = await Clipboard.getStringAsync();
        const cleanContent = clipboardContent.replace(/\D/g, '');

        // Skip if we've already auto-pasted this exact content
        if (hasAutoPastedRef.current && lastClipboardContentRef.current === cleanContent) {
          logDebugEvent('SMART_AUTO_PASTE_SKIP', {
            reason: 'Already auto-pasted this content',
            content: cleanContent
          });
          return;
        }

        logDebugEvent('SMART_AUTO_PASTE_ATTEMPT', {
          clipboardContent,
          cleanContent,
          length: cleanContent.length,
          isValid6Digit: cleanContent.length === 6,
          verificationCode: verificationCode,
          platform: Platform.OS,
          hasAutoPasted: hasAutoPastedRef.current,
          lastContent: lastClipboardContentRef.current
        });

        // Only proceed if exactly 6 digits
        if (cleanContent.length !== 6) {
          logDebugEvent('SMART_AUTO_PASTE_SKIP', {
            reason: 'Not exactly 6 digits',
            length: cleanContent.length
          });
          return;
        }

        // Pre-validate: Check if clipboard code matches the verification code
        const isCorrectCode = cleanContent === verificationCode;

        logDebugEvent('SMART_AUTO_PASTE_VALIDATION', {
          clipboardCode: cleanContent,
          expectedCode: verificationCode,
          isCorrect: isCorrectCode,
          comparison: `"${cleanContent}" === "${verificationCode}"`,
          willAutoPaste: isCorrectCode
        });

        // Only auto-paste if the code is correct
        if (!isCorrectCode) {
          logDebugEvent('SMART_AUTO_PASTE_SKIP', {
            reason: 'Clipboard code does not match verification code',
            clipboardCode: cleanContent,
            expectedCode: verificationCode
          });
          return;
        }

        // Code is correct - proceed with auto-paste
        logDebugEvent('SMART_AUTO_PASTE_EXECUTING', {
          code: cleanContent,
          reason: 'Correct 6-digit code found in clipboard - auto-filling',
          willValidateAfter: true
        });

        // Fill the code automatically
        const digits = cleanContent.split('');
        setCode(digits);

        // Mark as auto-pasted
        hasAutoPastedRef.current = true;
        lastClipboardContentRef.current = cleanContent;

        // Validate through the existing validation system
        validateCode(cleanContent);

        // Focus last input briefly for visual feedback
        addTimeout(() => {
          inputsRef.current[5]?.focus();
          addTimeout(() => {
            inputsRef.current[5]?.blur();
          }, 300);
        }, 150);

        logDebugEvent('SMART_AUTO_PASTE_SUCCESS', {
          code: cleanContent,
          timestamp: new Date().toISOString(),
          willShowValidationResult: true
        });
      } catch (error) {
        logDebugEvent('SMART_AUTO_PASTE_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error',
          platform: Platform.OS
        });
      }
    };

    // Attempt auto-paste whenever clipboard validation changes
    // This triggers when hasValidClipboard becomes true
    if (hasValidClipboard && !hasAutoPastedRef.current) {
      logDebugEvent('SMART_AUTO_PASTE_TRIGGER', {
        reason: 'Valid clipboard detected',
        hasValidClipboard,
        hasAutoPasted: hasAutoPastedRef.current
      });
      attemptSmartAutoPaste();
    }
  }, [hasValidClipboard, code, verificationCode, validateCode, addTimeout, logDebugEvent]); // React to clipboard changes

  // Common helper: Handle single digit input with smart navigation
  const handleSingleDigitInput = useCallback((value: string, index: number, platform: 'ios' | 'android') => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 1) {
      const newCode = [...code];
      const previousValue = newCode[index];
      const wasEmpty = previousValue === '';
      
      // Set the new digit
      newCode[index] = cleanValue;
      
      // Track input for iOS phantom backspace protection
      if (platform === 'ios' && cleanValue !== '') {
        recentInputRef.current = {
          timestamp: Date.now(),
          index,
          value: cleanValue
        };
        
        logDebugEvent('RECENT_INPUT_TRACKED', {
          trackedInput: recentInputRef.current
        });
      }
      
      logDebugEvent('SINGLE_DIGIT_PROCESSED', {
        digit: cleanValue,
        index,
        wasEmpty,
        previousValue,
        newValue: cleanValue,
        platform
      });
      
      setCode(newCode);
      
      // Only validate if we have some digits
      if (newCode.some(digit => digit !== '')) {
        validateCode(newCode.join(''));
      }
      
      // Smart navigation: only advance if field was empty
      if (cleanValue && wasEmpty && index < 5) {
        logDebugEvent('SMART_NAVIGATION_EXECUTED', {
          reason: 'Field was empty - advancing to next',
          fromIndex: index,
          toIndex: index + 1,
          platform
        });
        focusInput(index + 1);
      } else if (cleanValue && !wasEmpty) {
        logDebugEvent('SMART_NAVIGATION_SKIPPED', {
          reason: 'Field had content - staying in place',
          index,
          previousValue,
          newValue: cleanValue,
          platform
        });
      }
      
      return true; // Single digit processed
    }
    
    return false; // Not a single digit
  }, [code, focusInput, logDebugEvent, validateCode]);

  // iOS input handling
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
    
    // Check if replacement is being processed for this field to prevent visual glitch
    if (replacementProcessingRef.current?.index === index) {
      const timeDiff = Date.now() - replacementProcessingRef.current.timestamp;
      if (timeDiff < 100) { // Within 100ms of overflow processing
        logDebugEvent('iOS_REPLACEMENT_BLOCKED_DUPLICATE', {
          value,
          index,
          timeDiff,
          reason: 'onChangeText blocked - replacement already processed in onKeyPress',
          platform: 'ios'
        });
        return;
      }
    }
    
    // Clean input - only digits
    const cleanValue = value.replace(/\D/g, '');
    
    // Detect if input likely came from contextual menu (paste operation)
    const isLikelyContextualPaste = value.length > 1 && cleanValue.length > 1;
    
    logDebugEvent('INPUT_CLEANED', {
      originalValue: value,
      cleanedValue: cleanValue,
      length: cleanValue.length,
      index,
      isLikelyContextualPaste,
      inputSource: isLikelyContextualPaste ? 'contextual_menu_paste' : 'keyboard_input'
    });

    // Log contextual menu usage for UX analysis
    if (isLikelyContextualPaste) {
      logDebugEvent('iOS_CONTEXTUAL_MENU_PASTE_DETECTED', {
        originalValue: value,
        cleanedValue: cleanValue,
        fieldIndex: index,
        pasteLength: cleanValue.length,
        likely6DigitCode: cleanValue.length === 6,
        platform: 'ios'
      });
    }
    
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
        // Use optimized focus for better performance
        focusInput(nextIndex);
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
      
      // Track this input to prevent phantom backspace
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
  }, [code, isProcessing, validateCode, addTimeout, logDebugEvent, focusInput]);

  // Android input handling
  const handleInputChangeAndroid = useCallback((value: string, index: number) => {
    logDebugEvent('ANDROID_INPUT_CHANGE_START', {
      rawValue: value,
      index,
      currentCode: [...code],
      isProcessing,
      platform: 'android',
      timestamp: Date.now(),
      triggerSource: 'onChangeText'
    });
    
    if (isProcessing) {
      logDebugEvent('INPUT_BLOCKED_PROCESSING', { value, index, platform: 'android' });
      return;
    }
    
    // Check if replacement is being processed for this field to prevent visual glitch
    if (replacementProcessingRef.current?.index === index) {
      const timeDiff = Date.now() - replacementProcessingRef.current.timestamp;
      if (timeDiff < 100) { // Within 100ms of overflow processing
        logDebugEvent('ANDROID_REPLACEMENT_BLOCKED_DUPLICATE', {
          value,
          index,
          timeDiff,
          reason: 'onChangeText blocked - replacement already processed in onKeyPress',
          platform: 'android'
        });
        return;
      }
    }
    
    // Clean input - only digits
    const cleanValue = value.replace(/\D/g, '');
    
    logDebugEvent('INPUT_CLEANED', {
      originalValue: value,
      cleanedValue: cleanValue,
      length: cleanValue.length,
      index,
      platform: 'android'
    });
    
    // DETECT: Android replacement scenario (field has content + new digit)
    const currentValue = code[index];
    const isAndroidReplacement = cleanValue.length === 2 && 
                                currentValue !== '' && 
                                cleanValue.startsWith(currentValue) &&
                                cleanValue.length === currentValue.length + 1;
    
    if (isAndroidReplacement) {
      // Extract the new digit (last character of cleanValue)
      const newDigit = cleanValue.slice(-1);
      
      logDebugEvent('ANDROID_REPLACEMENT_DETECTED', {
        currentValue,
        newDigit,
        fullValue: cleanValue,
        index,
        platform: 'android'
      });
      
      // Replace current field and advance sequentially
      const newCode = [...code];
      newCode[index] = newDigit;
      
      logDebugEvent('ANDROID_REPLACEMENT_EXECUTED', {
        newCode,
        previousCode: [...code],
        replacedIndex: index,
        newValue: newDigit,
        previousValue: currentValue,
        platform: 'android'
      });
      
      setCode(newCode);
      validateCode(newCode.join(''));
      
      // Move focus to next field sequentially (regardless of content)
      if (index < 5) {
        logDebugEvent('ANDROID_REPLACEMENT_ADVANCE', {
          fromIndex: index,
          toIndex: index + 1,
          platform: 'android'
        });
        
        focusInput(index + 1);
      }
      
      return;
    }
    
    // Handle multi-digit paste (genuine paste operations)
    if (cleanValue.length > 1) {
      logDebugEvent('MULTI_DIGIT_PASTE_ANDROID', {
        value: cleanValue,
        length: cleanValue.length,
        startIndex: index
      });
      
      const digits = cleanValue.slice(0, 6).split('');
      const newCode = Array(6).fill('');
      
      digits.forEach((digit, i) => {
        if (i < 6) {
          logDebugEvent('FILLING_DIGIT_ANDROID', {
            digit,
            position: i,
            previousValue: newCode[i]
          });
          newCode[i] = digit;
        }
      });
      
      logDebugEvent('MULTI_DIGIT_SETTING_CODE_ANDROID', {
        newCode,
        previousCode: [...code]
      });
      
      setCode(newCode);
      validateCode(newCode.join(''));
      
      // Focus next available position with optimization
      const focusIndex = Math.min(digits.length - 1, 5);
      logDebugEvent('MULTI_DIGIT_FOCUS_ANDROID', { focusIndex });
      focusInput(focusIndex);
      return;
    }
    
    // Handle single digit input with smart behavior
    if (cleanValue.length <= 1) {
      const wasEmpty = code[index] === '';
      
      // Use common helper for smart single digit handling
      const processed = handleSingleDigitInput(value, index, 'android');
      
      if (processed) {
        logDebugEvent('ANDROID_SMART_INPUT_PROCESSED', {
          digit: cleanValue,
          index,
          wasEmpty,
          previousValue: code[index]
        });
      }
    }
    
    logDebugEvent('INPUT_CHANGE_END', {
      finalValue: cleanValue,
      index,
      resultingCode: [...code],
      platform: 'android'
    });
  }, [code, isProcessing, validateCode, logDebugEvent, focusInput, handleSingleDigitInput]);

  // Platform-specific input handler
  const handleInputChange = Platform.OS === 'ios' ? handleInputChangeiOS : handleInputChangeAndroid;

  // iOS backspace handling
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
      
      // Phantom backspace detection
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
        
        // Move focus to previous input immediately
        logDebugEvent('BACKSPACE_FOCUS_PREVIOUS', {
          focusIndex: index - 1
        });
        
        // Use optimized focus for immediate response
        focusInput(index - 1);
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
      
      // Replace current field value and advance sequentially
      if (!wasEmpty) {
        // Mark replacement processing to prevent onChangeText interference
        replacementProcessingRef.current = {
          index,
          timestamp: Date.now()
        };
        
        logDebugEvent('MANUAL_DIGIT_REPLACEMENT', {
          reason: 'Field had content - replacing and advancing sequentially',
          currentIndex: index,
          currentValue: code[index],
          newDigit: newDigit,
          processingMarked: true
        });
        
        // Replace current field with new digit
        const newCode = [...code];
        newCode[index] = newDigit;
        
        // Track the input for phantom backspace protection
        recentInputRef.current = {
          timestamp: Date.now(),
          index: index,
          value: newDigit
        };
        
        logDebugEvent('RECENT_INPUT_TRACKED', {
          trackedInput: recentInputRef.current
        });
        
        logDebugEvent('MANUAL_REPLACEMENT_SETTING_CODE', {
          newCode,
          previousCode: [...code],
          replacedIndex: index,
          newValue: newDigit,
          previousValue: code[index]
        });
        
        setCode(newCode);
        validateCode(newCode.join(''));
        
        // Move focus to next field sequentially (regardless of content)
        if (index < 5) {
          logDebugEvent('MANUAL_REPLACEMENT_FOCUS', {
            fromIndex: index,
            toIndex: index + 1
          });
          
          // Use optimized focus for immediate response
          focusInput(index + 1);
        }
        
        // Clear processing marker after a brief moment
        setTimeout(() => {
          replacementProcessingRef.current = null;
        }, 50);
        
        return; // Prevent default handling
      }
      
      // Only navigate if the field was empty (new input, not replacement)
      if (wasEmpty && index < 5) {
        logDebugEvent('MANUAL_ADVANCE_EXECUTED', {
          fromIndex: index,
          toIndex: index + 1
        });
        
        // Use optimized focus for immediate response
        focusInput(index + 1);
      }
    }
  }, [code, logDebugEvent, validateCode, focusInput]);

  // Android keypress handling
  const handleKeyPressAndroid = useCallback((e: any, index: number) => {
    logDebugEvent('ANDROID_KEY_PRESS_START', {
      key: e.nativeEvent.key,
      index,
      currentValue: code[index],
      currentCode: [...code],
      platform: 'android',
      timestamp: Date.now(),
      triggerSource: 'onKeyPress'
    });
    
    if (e.nativeEvent.key === 'Backspace') {
      logDebugEvent('BACKSPACE_DETECTED', {
        index,
        currentValue: code[index],
        hasContent: code[index] !== '',
        platform: 'android'
      });
      
      const newCode = [...code];
      
      if (code[index] !== '') {
        // Current field has content - just clear it
        logDebugEvent('BACKSPACE_CLEAR_CURRENT', {
          index,
          clearingValue: code[index],
          platform: 'android'
        });
        
        newCode[index] = '';
        setCode(newCode);
        setValidationState('idle');
        
        logDebugEvent('BACKSPACE_CURRENT_CLEARED', {
          index,
          newCode: [...newCode],
          platform: 'android'
        });
      } else if (index > 0) {
        // Current field empty - clear previous field and move back
        logDebugEvent('BACKSPACE_CLEAR_PREVIOUS', {
          currentIndex: index,
          previousIndex: index - 1,
          previousValue: code[index - 1],
          platform: 'android'
        });
        
        newCode[index - 1] = '';
        setCode(newCode);
        setValidationState('idle');
        
        logDebugEvent('BACKSPACE_PREVIOUS_CLEARED', {
          clearedIndex: index - 1,
          newCode: [...newCode],
          platform: 'android'
        });
        
        // Move focus to previous input
        logDebugEvent('BACKSPACE_FOCUS_PREVIOUS', {
          focusIndex: index - 1,
          platform: 'android'
        });
        
        focusInput(index - 1);
      }
    }
    
    // Handle digit input with smart overflow behavior (like iOS)
    if (e.nativeEvent.key >= '0' && e.nativeEvent.key <= '9') {
      const wasEmpty = code[index] === '';
      const newDigit = e.nativeEvent.key;
      
      logDebugEvent('ANDROID_DIGIT_KEY_DETECTED', {
        key: newDigit,
        index,
        wasEmpty,
        currentValue: code[index],
        platform: 'android'
      });
      
      // Replace current field value and advance sequentially
      if (!wasEmpty) {
        // Mark replacement processing to prevent onChangeText interference
        replacementProcessingRef.current = {
          index,
          timestamp: Date.now()
        };
        
        logDebugEvent('ANDROID_REPLACEMENT_PROCESSING_START', {
          originalIndex: index,
          newDigit,
          currentValue: code[index],
          platform: 'android',
          processingMarked: true
        });
        
        // Replace current field with new digit
        const newCode = [...code];
        newCode[index] = newDigit;
        
        logDebugEvent('ANDROID_REPLACEMENT_SETTING_CODE', {
          newCode,
          previousCode: [...code],
          replacedIndex: index,
          newValue: newDigit,
          previousValue: code[index],
          platform: 'android'
        });
        
        setCode(newCode);
        validateCode(newCode.join(''));
        
        // Move focus to next field sequentially (regardless of content)
        if (index < 5) {
          logDebugEvent('ANDROID_REPLACEMENT_FOCUS', {
            fromIndex: index,
            toIndex: index + 1,
            platform: 'android'
          });
          
          focusInput(index + 1);
        }
        
        // Clear processing marker after a brief moment
        setTimeout(() => {
          replacementProcessingRef.current = null;
        }, 50);
        
        return; // Prevent default handling
      }
      
      // If field is empty, let the normal onChangeText handle it
      logDebugEvent('ANDROID_NORMAL_INPUT', {
        reason: 'Field was empty - letting onChangeText handle',
        index,
        newDigit,
        platform: 'android'
      });
    }
  }, [code, focusInput, logDebugEvent, validateCode]);

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
    
    // Optimized focus - immediate response
    if (Platform.OS === 'ios') {
      // Small delay only for iOS to ensure state is fully reset
      addTimeout(() => focusInput(0), 50);
    } else {
      // Immediate focus for Android
      focusInput(0);
    }
  }, [addTimeout, focusInput]);

  // iOS clipboard handling
  const handlePasteFromClipboardiOS = useCallback(async () => {
    if (isProcessing) return;

    try {
      const clipboardContent = await Clipboard.getStringAsync();
      const cleanContent = clipboardContent.replace(/\D/g, '');
      
      if (cleanContent.length === 6) {
        // Perfect 6-digit code
        const digits = cleanContent.split('');
        setCode(digits);
        validateCode(cleanContent);
        
        // Focus last input briefly - optimized
        focusInput(5);
        // Brief blur after focus for completion indication
        addTimeout(() => inputsRef.current[5]?.blur(), 150);
      } else if (cleanContent.length > 0 && cleanContent.length < 6) {
        // Partial code - fill from beginning
        const newCode = Array(6).fill('');
        const digits = cleanContent.split('');
        
        digits.forEach((digit, i) => {
          newCode[i] = digit;
        });
        
        setCode(newCode);
        
        // Focus next empty position - optimized
        const nextIndex = Math.min(digits.length, 5);
        focusInput(nextIndex);
      }
    } catch (error) {
      console.error('Clipboard paste failed:', error);
    }
  }, [isProcessing, validateCode, addTimeout, focusInput]);

  // Android clipboard handling (original)
  const handlePasteFromClipboardAndroid = useCallback(async () => {
    if (isProcessing) return;

    try {
      const clipboardContent = await Clipboard.getStringAsync();
      const cleanContent = clipboardContent.replace(/\D/g, '');
      
      if (cleanContent.length === 6) {
        const newCode = cleanContent.split('');
        setCode(newCode);
        validateCode(cleanContent);
        
        // Focus last input - optimized
        focusInput(5);
      }
    } catch (error) {
      console.error('Clipboard access failed:', error);
    }
  }, [isProcessing, validateCode, focusInput]);

  // Platform-specific clipboard handler
  const handlePasteFromClipboard = Platform.OS === 'ios' ? handlePasteFromClipboardiOS : handlePasteFromClipboardAndroid;

  // Export debug logs
  const exportDebugLogs = useCallback(() => {
    const platformIcon = Platform.OS === 'ios' ? '🍎' : '🤖';
    const platformName = Platform.OS.toUpperCase();
    
    console.log(`🔍 ===== ${platformIcon} ${platformName} OTP DEBUG REPORT =====`);
    console.log('Platform:', Platform.OS);
    console.log('Total events:', debugLog.current.length);
    console.log('Current code state:', code);
    console.log('Current validation state:', validationState);
    console.log('\n📋 Event Log:');
    
    debugLog.current.forEach((entry, i) => {
      const entryIcon = entry.platform === 'ios' ? '🍎' : '🤖';
      console.log(`${i + 1}. ${entryIcon} [${entry.timestamp}] ${entry.event}`);
      console.log('   Platform:', entry.platform);
      console.log('   Details:', entry.details);
      console.log('   Code State:', entry.codeState);
      console.log('   ---');
    });
    
    // Enhanced diagnostic info for Android
    if (Platform.OS === 'android') {
      console.log('\n🤖 ===== ANDROID DIAGNOSTIC ANALYSIS =====');
      
      // Analyze input change events
      const inputChangeEvents = debugLog.current.filter(e => 
        e.event.includes('INPUT_CHANGE') || e.event.includes('ANDROID')
      );
      console.log('Android Input Change Events:', inputChangeEvents.length);
      
      // Analyze keypress events
      const keyPressEvents = debugLog.current.filter(e => 
        e.event === 'KEY_PRESS' && e.platform === 'android'
      );
      console.log('Android Key Press Events:', keyPressEvents.length);
      
      // Check for overflow attempts
      const overflowEvents = debugLog.current.filter(e => 
        e.event.includes('OVERFLOW') && e.platform === 'android'
      );
      console.log('Android Overflow Events:', overflowEvents.length);
      
      // Analyze focus events
      const focusEvents = debugLog.current.filter(e => 
        (e.event.includes('FOCUSED') || e.event.includes('BLURRED')) && e.platform === 'android'
      );
      console.log('Android Focus Events:', focusEvents.length);
      
      console.log('\n🔍 Recent Android Events (last 10):');
      const recentAndroidEvents = debugLog.current
        .filter(e => e.platform === 'android')
        .slice(-10);
        
      recentAndroidEvents.forEach((event, i) => {
        console.log(`${i + 1}. [${event.timestamp}] ${event.event}`, event.details);
      });
    }
    
    // Copy to clipboard for easy sharing
    Clipboard.setStringAsync(JSON.stringify({
      platform: Platform.OS,
      currentCode: code,
      validationState,
      events: debugLog.current,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`📋 ${platformName} Debug logs copied to clipboard`);
  }, [code, validationState]);

  // Clear debug logs
  const clearDebugLogs = useCallback(() => {
    debugLog.current = [];
    const platformIcon = Platform.OS === 'ios' ? '🍎' : '🤖';
    console.log(`🧹 ${platformIcon} ${Platform.OS.toUpperCase()} Debug logs cleared`);
  }, []);


  if (showRegister) {
    return <Register />;
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
                <Text style={styles.title}>Verify your identity</Text>
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
                    maxLength={6}
                    keyboardType="numeric"
                    textAlign="center"
                    autoCorrect={false}
                    autoComplete="off"
                    autoCapitalize="none"
                    returnKeyType={validationState === 'valid' ? 'done' : 'next'}
                    blurOnSubmit={validationState === 'valid'}
                    onSubmitEditing={() => {
                      if (validationState === 'valid') {
                        // Dismiss keyboard and trigger continue action
                        inputsRef.current.forEach(input => input?.blur());
                        handleNext();
                      } else if (index < 5) {
                        // Move to next input if not at the end
                        focusInput(index + 1);
                      }
                    }}
                    editable={!isProcessing}
                    {...(Platform.OS === 'ios' && {
                      selectTextOnFocus: false,
                      clearTextOnFocus: false,
                      contextMenuHidden: false,
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

              {/* Paste Button - Show only when clipboard has valid code and fields are not already filled */}
              {hasValidClipboard && code.join('').length < 6 && (
                <View style={styles.pasteContainer}>
                  <Button
                    title="Paste 6-Digit Code"
                    variant="ghost"
                    size="sm"
                    onPress={handlePasteFromClipboard}
                    icon={<Icon name="clipboard-outline" size={16} color={Theme.colors.primary[500]} />}
                    iconPosition="left"
                    style={styles.pasteButton}
                  />
                </View>
              )}

              {/* Debug UI - Only visible when DEBUG_OTP is enabled */}
              {DEBUG_OTP && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>
                    🔍 {Platform.OS === 'ios' ? '🍎 iOS' : '🤖 Android'} OTP Debug
                  </Text>
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
                    Platform: {Platform.OS} | Events: {debugLog.current.length} | Code: "{code.join('')}" | State: {validationState}
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
