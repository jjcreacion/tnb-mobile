import { Redirect } from 'expo-router'
import React, { useEffect } from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import styles from '../styles';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


export default function HomeScreens() {
  //return <Redirect href="/splash">INdex</Redirect>;
 const router = useRouter();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
  <View style={styles.container}>
      <LinearGradient
        colors={['#feb47b', '#ff0303']}
        style={styles.gradient}
      />
      <View style={styles.abstractShape1} />
      <View style={styles.abstractShape2} />

      <Image
        source={require('../../assets/images/icon-tnb.png')}
        style={styles.image}
      />
      <Text style={styles.text}>Welcome</Text>
    </View>
  );

}