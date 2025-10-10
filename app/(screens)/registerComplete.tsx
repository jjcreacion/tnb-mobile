import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

// Theme System Components
import { MigratedStyles } from '../../constants/MigratedStyles';


interface RegisterCompleteProps {
  isVisible: boolean;
  onClose: () => void;
  IsVerify: () => void;
}
const RegisterComplete: React.FC<RegisterCompleteProps> = ({ isVisible, onClose, IsVerify}) => {

  const confettiRef = useRef<ConfettiCannon>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const router = useRouter(); 

  useEffect(() => {
    if (confettiRef.current) {
      confettiRef.current.start();
    }

    Animated.loop(
        Animated.timing(pulseAnimation, {
          toValue: 1, 
          duration: 1500, 
          easing: Easing.ease, 
          useNativeDriver: true,
        })
      ).start();
    }, [pulseAnimation]);

  const goToMainLayout = () => {
    console.log('Ir a principal'); 
    router.push('/login');
    onClose();
    IsVerify();
  };
  
  return (
    <View style={MigratedStyles.registerCompleteContainer}>
      <ConfettiCannon
        count={100}
        origin={{ x: 0, y: 0 }}
        autoStart={false}
        ref={confettiRef}
      />

      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <Ionicons name="checkmark-circle-outline" size={80} color="green" />
      </Animated.View>

      <Text style={MigratedStyles.registerCompleteMessage1}>
        Welcome to the Family TNB
      </Text>
      <Text style={MigratedStyles.registerCompleteMessage2}>
        Sign Up Successful!
      </Text>

       <TouchableOpacity style={MigratedStyles.registerCompleteButton} onPress={goToMainLayout}> 
        <Text style={MigratedStyles.registerCompleteButtonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterComplete;