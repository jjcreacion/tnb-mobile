import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';

const RegisterComplete: React.FC = () => {
  const confettiRef = useRef<ConfettiCannon>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const slideUpAnimation = useRef(new Animated.Value(50)).current;
  const router = useRouter();

  useEffect(() => {
    // Start confetti animation - mantiene exactamente como está
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    // Pulse animation for the checkmark icon (mejorada)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in and slide up animation for content
    Animated.parallel([
      Animated.timing(fadeInAnimation, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnimation, {
        toValue: 0,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnimation, fadeInAnimation, slideUpAnimation]);

  const goToMainLayout = () => {
    console.log('Going to login...');
    router.push('/login');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor={Theme.colors.background.primary} />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {/* Confetti Animation - mantiene exactamente como está */}
        <ConfettiCannon
          count={100}
          origin={{ x: 0, y: 0 }}
          autoStart={false}
          ref={confettiRef}
          fadeOut
        />

        <View style={styles.content}>
          {/* Success Icon with Pulse Animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          >
            <View style={styles.iconBackground}>
              <Ionicons name="checkmark-circle" size={100} color={Theme.colors.success[500]} />
            </View>
          </Animated.View>

          {/* Success Message with Fade In and Slide Up */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: fadeInAnimation,
                transform: [{ translateY: slideUpAnimation }],
              },
            ]}
          >
            <Typography variant="h1" style={styles.title} color="primary">
              Welcome to TNB!
            </Typography>

            <Typography variant="h3" style={styles.subtitle} color="secondary">
              Your account has been created successfully
            </Typography>

            <View style={styles.divider} />

            <Typography variant="body" style={styles.description} color="secondary">
              You're all set! Sign in to start exploring and enjoying all the features we have for
              you.
            </Typography>
          </Animated.View>

          {/* Action Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeInAnimation,
                transform: [{ translateY: slideUpAnimation }],
              },
            ]}
          >
            <Button
              title="Go to Login"
              variant="primary"
              size="lg"
              fullWidth
              onPress={goToMainLayout}
              icon={<Ionicons name="arrow-forward" size={20} color={Theme.colors.text.inverse} />}
              iconPosition="right"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: Theme.spacing['2xl'],
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Theme.colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.lg,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing['3xl'],
  },
  title: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.bold,
  },
  subtitle: {
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
    fontSize: Theme.typography.fontSize.lg,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 2,
    marginVertical: Theme.spacing.lg,
  },
  description: {
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeight.lg,
    maxWidth: 320,
    fontSize: Theme.typography.fontSize.base,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
});

export default RegisterComplete;
