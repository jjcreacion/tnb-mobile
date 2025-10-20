import * as React from 'react';
import {
    Keyboard,
    StyleProp,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';

interface KeyboardDismissWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** If true, only dismisses keyboard when tapping on this wrapper, not its children */
  dismissOnWrapperOnly?: boolean;
}

/**
 * KeyboardDismissWrapper - Componente para ocultar el teclado al tocar fuera de campos de texto
 * 
 * Características:
 * - No interfiere con otros componentes interactivos
 * - Funciona solo cuando el teclado está visible
 * - Se puede deshabilitar cuando sea necesario
 * - Soporte para modo dismissOnWrapperOnly para casos específicos
 * 
 * Uso:
 * <KeyboardDismissWrapper>
 *   <YourScreenContent />
 * </KeyboardDismissWrapper>
 */
export const KeyboardDismissWrapper: React.FC<KeyboardDismissWrapperProps> = ({
  children,
  style,
  disabled = false,
  dismissOnWrapperOnly = false,
}) => {
  const handlePress = () => {
    if (!disabled) {
      Keyboard.dismiss();
    }
  };

  if (disabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[{ flex: 1 }, style]}>
        {dismissOnWrapperOnly ? (
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={{ flex: 1 }}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        ) : (
          children
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};