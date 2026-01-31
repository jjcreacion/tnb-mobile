import { Theme } from '@/constants/Theme';
import { useAuthRehydration } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { persistor, store } from '@/store';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

/**
 * Componente interno que maneja la lógica de navegación
 * Se ejecuta después de que Redux haya hidratado el estado
 */
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Recupera el estado de autenticación desde AsyncStorage
  const isHydrated = useAuthRehydration();

  useEffect(() => {
    if (loaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isHydrated]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(Theme.colors.navigation.bar);
      
      try {
        Notifications.setNotificationChannelAsync('default', {
            name: 'Default Notifications',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: Theme.colors.primary[500],
        });
      } catch (error) {
         console.warn("Could not set Android notification channel:", error);
      }
    }
  }, []);

  // Mientras se están cargando las fuentes o hidratando el estado, mostrar pantalla de carga
  if (!loaded || !isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={Theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider value={DefaultTheme}>
            <RootLayoutContent />
            <StatusBar style="light" backgroundColor={Theme.colors.primary[500]} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}