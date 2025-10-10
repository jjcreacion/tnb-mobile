import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, useWindowDimensions, View } from 'react-native';
import styles from '../styles';


export default function HomeScreens() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.containerSplash}>
      <View >
        <Text style={styles.textIndex}>TNB</Text>
        <Text style={styles.symbolR}> ®</Text>
      </View>
      <Text style={styles.textWelcome}>Welcome</Text>

      <Image
        source={require('../../assets/images/icon-index.png')}
        style={styles.imageIndex}
      />
    </View>
  );
}