import { View, Text, Image, useWindowDimensions } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles';

export default function SplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/(tabs)');
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ff0303', '#feb47b']}
        style={styles.gradient}
      />
      <View style={styles.abstractShape1} />
      <View style={styles.abstractShape2} />

      <Image
        source={require('../../assets/images/icon-tnb.png')}
        style={styles.image}
      />
      <Text style={styles.text}>LOADING...</Text>
    </View>
  );
}
