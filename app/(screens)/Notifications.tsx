import { Theme } from '@/constants/Theme';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import { toggleSmsNotifications } from '@/store/slices/userSlice'; 
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// --- 1. Definición de la Interfaz y Componente de Toggle ---

interface NotificationToggleProps {
  label: string;
  isEnabled: boolean;
  onToggle: (newValue: boolean) => void;
  iconName: keyof typeof FontAwesome.glyphMap;
  // 💡 NUEVA PROPIEDAD: Deshabilita el Switch durante la carga de Redux/API.
  isDisabled: boolean; 
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ 
  label, 
  isEnabled, 
  onToggle, 
  iconName, 
  isDisabled 
}) => (
  <View style={notificationStyles.toggleRow}>
    <View style={notificationStyles.toggleIconText}>
      <FontAwesome name={iconName} size={20} color={Theme.colors.primary[500]} style={notificationStyles.toggleIcon} />
      <Text style={notificationStyles.toggleText}>{label}</Text>
    </View>
    <Switch
      trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[400] }}
      thumbColor={isEnabled ? Theme.colors.primary[500] : Theme.colors.neutral[500]}
      onValueChange={onToggle}
      value={isEnabled}
      // 💡 Se aplica la propiedad 'disabled'
      disabled={isDisabled} 
    />
  </View>
);

// --- 2. Componente Principal ---
const NotificationsScreen = () => {
  const router = useRouter();
  
  // Redux Hooks
  const dispatch = useAppDispatch(); 
  
  // Obtener el valor del Store y el estado de carga
  const smsNotificationsValue = useAppSelector((state) => state.user.userData?.smsNotifications);
  const loadingToggle = useAppSelector((state) => state.user.loading); // <-- Estado de carga

  // Coerción a booleano: garantiza que el Switch reciba un valor booleano
  const isEmailEnabledFromStore = !!smsNotificationsValue;

  // Estado local para Push (si no está gestionado por Redux)
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  
  const handlePushToggle = (newValue: boolean) => {
    setIsPushEnabled(newValue);
    // Lógica para actualizar Push Notifications si fuera necesario
  };
  
  const handleEmailToggle = (newValue: boolean) => {
    // Llama al Thunk para actualizar en la Base de Datos y Redux
    dispatch(toggleSmsNotifications(newValue)); 
  };

  return (
    <View style={styles.fullContainer}> 
      <StatusBar 
        style="light" 
        backgroundColor={Theme.colors.primary[500]} 
      />
      
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}> 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={24} color={Theme.colors.text.inverse} /> 
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Manage your preferences for receiving updates.</Text>
        
        <View style={notificationStyles.settingsContainer}>
          
          {/* Push Notifications */}
          <NotificationToggle
            label="Push Notifications"
            isEnabled={isPushEnabled}
            onToggle={handlePushToggle}
            iconName="bell"
            // No deshabilitamos este si no usa el mismo thunk de carga
            isDisabled={false} 
          />
          
          <View style={notificationStyles.separator} />

          {/* Email/SMS Notifications */}
          <NotificationToggle
            label="Email/SMS Notifications"
            isEnabled={isEmailEnabledFromStore}
            onToggle={handleEmailToggle} 
            iconName="envelope"
            // 💡 Se deshabilita mientras el thunk está pendiente (loadingToggle = true)
            isDisabled={loadingToggle} 
          />
          
        </View>
        
        {/* Indicador de carga opcional */}
        {loadingToggle && <Text style={{ marginTop: 10, color: Theme.colors.primary[500] }}>Actualizando...</Text>}
        <Text style={{ marginTop: 10 }}>Estado actual: {String(smsNotificationsValue)}</Text>
        
      </ScrollView>
    </View>
  );
};

// --- 3. Estilos (Se mantienen igual) ---

const notificationStyles = StyleSheet.create({
  settingsContainer: {
    width: '100%',
    marginTop: Theme.spacing.lg, 
    padding: Theme.spacing.base, 
    backgroundColor: Theme.colors.background.primary, 
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
  },
  toggleIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: Theme.spacing.base,
  },
  toggleText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.primary,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Theme.colors.border.light,
    marginVertical: Theme.spacing.xs,
  },
});

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary, 
  },
  scrollContent: {
    flex: 1,
  },
  headerSafeArea: {
    backgroundColor: Theme.colors.primary[500],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.lg, 
  },
  backButtonText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.medium,
    color: Theme.colors.text.inverse,
  },
  content: {
    padding: Theme.spacing.base, 
    alignItems: 'center',
    paddingBottom: Theme.spacing.xl, 
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs, 
    paddingHorizontal: Theme.spacing.base,
  },
});

export default NotificationsScreen;