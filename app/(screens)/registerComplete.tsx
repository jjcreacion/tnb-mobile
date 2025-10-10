import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';


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
    router.push('/loginMigrated');
    onClose();
    IsVerify();
  };
  
  return (
    <View style={styles.container}>
      <ConfettiCannon
        count={100}
        origin={{ x: 0, y: 0 }}
        autoStart={false}
        ref={confettiRef}
      />

      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        <Ionicons name="checkmark-circle-outline" size={80} color="green" />
      </Animated.View>

      <Text style={styles.message1}>
        Welcome to the Family TNB
      </Text>
      <Text style={styles.message2}>
        Sign Up Successful!
      </Text>

       <TouchableOpacity style={styles.button} onPress={goToMainLayout}> 
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message1: {
    marginTop: 20,
    fontSize: 30, 
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  message2: {
    marginTop: 8,
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  button: { 
    marginTop: 20,
    backgroundColor: '#ff0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterComplete;