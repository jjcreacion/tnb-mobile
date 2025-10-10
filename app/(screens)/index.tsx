import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import styles from '../styles';


export default function HomeScreens() {
  const router = useRouter();

  // Navegación automática a la versión migrada (comentar para usar los botones)
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/loginMigrated' as any);
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

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
