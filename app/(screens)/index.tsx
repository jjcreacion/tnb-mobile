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

      {/* Botones temporales para comparar versiones */}
      {/* 
      <View style={{ position: 'absolute', bottom: 100, alignSelf: 'center', gap: 10 }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#E63946', padding: 15, borderRadius: 10 }}
          onPress={() => router.push('/login' as any)}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Login Original</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#2A9D8F', padding: 15, borderRadius: 10 }}
          onPress={() => router.push('/loginMigrated' as any)}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Login Migrated</Text>
        </TouchableOpacity>
      </View>
      */}
    </View>
  );
}
