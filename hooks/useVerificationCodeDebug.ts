import { useEffect, useRef, useCallback } from 'react';

interface DebugOptions {
  enabled: boolean;
  logStateChanges: boolean;
  logInputEvents: boolean;
  logFocusEvents: boolean;
}

export const useVerificationCodeDebug = (
  code: string[],
  options: DebugOptions = {
    enabled: __DEV__,
    logStateChanges: true,
    logInputEvents: true,
    logFocusEvents: true,
  }
) => {
  const previousCode = useRef<string[]>([]);
  
  const debugLog = useCallback((message: string, data?: any) => {
    if (options.enabled) {
      console.debug(`[VerifyCode Debug] ${message}`, data || '');
    }
  }, [options.enabled]);

  useEffect(() => {
    if (options.enabled && options.logStateChanges) {
      const changes: string[] = [];
      code.forEach((digit, index) => {
        if (previousCode.current[index] !== digit) {
          changes.push(`[${index}]: "${previousCode.current[index] || ''}" → "${digit}"`);
        }
      });
      
      if (changes.length > 0) {
        debugLog('State change detected:', changes.join(', '));
        debugLog('Full code state:', code);
      }
      
      previousCode.current = [...code];
    }
  }, [code, options.enabled, options.logStateChanges, debugLog]);

  const logInput = (index: number, oldValue: string, newValue: string, action: string) => {
    if (options.enabled && options.logInputEvents) {
      debugLog(`Input ${action}`, {
        index,
        oldValue: `"${oldValue}"`,
        newValue: `"${newValue}"`,
        timestamp: Date.now()
      });
    }
  };

  const logFocus = (index: number, action: 'focus' | 'blur') => {
    if (options.enabled && options.logFocusEvents) {
      debugLog(`Focus ${action}`, { index, timestamp: Date.now() });
    }
  };

  const validateCodeIntegrity = (): boolean => {
    const hasValidStructure = Array.isArray(code) && code.length === 6;
    const hasValidDigits = code.every(digit => typeof digit === 'string' && digit.length <= 1);
    const hasValidContent = code.every(digit => digit === '' || /^\d$/.test(digit));
    
    const isValid = hasValidStructure && hasValidDigits && hasValidContent;
    
    if (options.enabled && !isValid) {
      debugLog('Code integrity violation:', {
        hasValidStructure,
        hasValidDigits,
        hasValidContent,
        code
      });
    }
    
    return isValid;
  };

  return {
    debugLog,
    logInput,
    logFocus,
    validateCodeIntegrity
  };
};