import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/Theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeArea = true,
  edges = ['top', 'bottom'],
}) => {
  const Container = safeArea ? SafeAreaView : View;

  if (scrollable) {
    return (
      <Container style={[styles.container, style]} edges={edges}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container style={[styles.container, style]} edges={edges}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </Container>
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
