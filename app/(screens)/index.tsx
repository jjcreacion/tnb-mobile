import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Platform, StatusBar, Text, View } from 'react-native';

// Theme System Components
import { MigratedStyles } from '../../constants/MigratedStyles';
import { Theme } from '../../constants/Theme';
import { useNavigationBar } from '../../hooks/useNavigationBar';

export default function HomeScreens() {
  const router = useRouter();
  
  // Configure white navigation bar for splash screen
  useNavigationBar(Theme.colors.navigation.barSplash);

  useEffect(() => {
    // Hide status bar only on Android for splash screen
    if (Platform.OS === 'android') {
      StatusBar.setHidden(true);
    }

    // Clean up: restore status bar visibility when component unmounts (Android only)
    return () => {
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={MigratedStyles.containerSplash}>
      <View>
        <Text style={MigratedStyles.textIndex}>
          TNB
        </Text>
        <Text style={MigratedStyles.symbolR}>
          {' ®'}
        </Text>
      </View>
      
      <Text style={MigratedStyles.textWelcome}>
        Welcome
      </Text>

      <Image
        source={require('../../assets/images/icon-index.png')}
        style={MigratedStyles.imageIndex}
      />
    </View>
  );
}