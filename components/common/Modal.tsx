import { Theme } from '@/constants/Theme';
import { useNavigationBar } from '@/hooks/useNavigationBar';
import React from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Typography } from './Typography';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'bottom' | 'top';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
  scrollable?: boolean;
  children: React.ReactNode;
  overlayStyle?: any;
  contentStyle?: any;
  /** Custom navigation bar color - defaults to theme navigation bar color */
  navigationBarColor?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getSizeStyles = (size: ModalSize, position: ModalPosition) => {
  const baseStyles = {
    center: {
      sm: { width: screenWidth * 0.8, maxHeight: screenHeight * 0.6 },
      md: { width: screenWidth * 0.85, maxHeight: screenHeight * 0.7 },
      lg: { width: screenWidth * 0.9, maxHeight: screenHeight * 0.8 },
      xl: { width: screenWidth * 0.95, maxHeight: screenHeight * 0.9 },
      full: { width: screenWidth, height: screenHeight },
    },
    bottom: {
      sm: { width: screenWidth, maxHeight: screenHeight * 0.4 },
      md: { width: screenWidth, maxHeight: screenHeight * 0.6 },
      lg: { width: screenWidth, maxHeight: screenHeight * 0.75 },
      xl: { width: screenWidth, maxHeight: screenHeight * 0.9 },
      full: { width: screenWidth, height: screenHeight },
    },
    top: {
      sm: { width: screenWidth, maxHeight: screenHeight * 0.4 },
      md: { width: screenWidth, maxHeight: screenHeight * 0.6 },
      lg: { width: screenWidth, maxHeight: screenHeight * 0.75 },
      xl: { width: screenWidth, maxHeight: screenHeight * 0.9 },
      full: { width: screenWidth, height: screenHeight },
    },
  };

  return baseStyles[position][size];
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  dismissOnBackdrop = true,
  scrollable = false,
  children,
  overlayStyle,
  contentStyle,
  navigationBarColor,
}) => {
  const sizeStyles = getSizeStyles(size, position);
  
  // Configure navigation bar color when modal is visible
  useNavigationBar(navigationBarColor);
  
  const modalContentStyles = [
    styles.modalContent,
    styles[`${position}Position`],
    sizeStyles,
    contentStyle,
  ];

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return children;
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={[styles.overlay, overlayStyle]}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <TouchableOpacity style={modalContentStyles} activeOpacity={1}>
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && (
                  <Typography variant="h4" color="primary" style={styles.title}>
                    {title}
                  </Typography>
                )}
                {showCloseButton && (
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon
                      name="close"
                      size={24}
                      color={Theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>
              {renderContent()}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    ...Theme.shadows.xl,
    overflow: 'hidden',
  },

  centerPosition: {
    // Center positioning is default
  },

  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
  },

  topPosition: {
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: Theme.borderRadius.xl,
    borderBottomRightRadius: Theme.borderRadius.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },

  title: {
    flex: 1,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.secondary,
  },

  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },
});