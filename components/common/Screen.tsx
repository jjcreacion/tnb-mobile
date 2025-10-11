import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/Theme';
import { KeyboardDismissWrapper } from './KeyboardDismissWrapper';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Disable keyboard dismiss functionality when tapping outside inputs */
  disableKeyboardDismiss?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeArea = true,
  edges = ['top', 'bottom'],
  disableKeyboardDismiss = false,
}) => {
  const Container = safeArea ? SafeAreaView : View;

  const screenContent = scrollable ? (
    <Container style={[styles.container, style]} edges={edges}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Container>
  ) : (
    <Container style={[styles.container, style]} edges={edges}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </Container>
  );

  // Wrap with KeyboardDismissWrapper unless disabled
  if (disableKeyboardDismiss) {
    return screenContent;
  }

  return (
    <KeyboardDismissWrapper style={{ flex: 1 }}>
      {screenContent}
    </KeyboardDismissWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },

  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.base,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.base,
    paddingBottom: Theme.spacing.xl,
  },
});
