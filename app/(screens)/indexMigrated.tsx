import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';

// Theme System Components
import { Typography } from '../../components/common/Typography';
import { MigratedStyles } from '../../constants/MigratedStyles';
import { Theme } from '../../constants/Theme';

export default function HomeScreensMigrated() {
  const router = useRouter();

  // Navegación automática a la versión migrada (comentar para usar los botones)
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/loginMigrated' as any);
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={MigratedStyles.containerSplash}>
      <View style={{ position: 'relative' }}>
        <Typography 
          variant="h1" 
          style={{ 
            fontSize: 50, 
            fontWeight: 'bold',
            position: 'relative',
            color: Theme.colors.text.primary 
          }}
        >
          TNB
        </Typography>
        <Typography 
          variant="caption" 
          style={{ 
            fontSize: 20, 
            position: 'absolute',
            top: 10, 
            right: -20,
            color: Theme.colors.text.secondary
          }}
        >
          {' ®'}
        </Typography>
      </View>
      
      <Typography 
        variant="h2" 
        style={{ 
          fontSize: 25, 
          color: Theme.colors.error[500], 
          fontWeight: '600', 
          marginTop: -10,
          marginBottom: 30
        }}
      >
        Welcome
      </Typography>

      <Image
        source={require('../../assets/images/icon-index.png')}
        style={MigratedStyles.imageIndex}
      />
    </View>
  );
}