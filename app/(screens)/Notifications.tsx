import { Theme } from '@/constants/Theme';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import { toggleSmsNotifications } from '@/store/slices/userSlice'; 
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Importar React y los hooks necesarios
import React, { useState, useEffect, useMemo } from 'react'; 
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


interface NotificationToggleProps {
  label: string;
  isEnabled: boolean;
  onToggle: (newValue: boolean) => void;
  iconName: keyof typeof FontAwesome.glyphMap;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ 
  label, 
  isEnabled, 
  onToggle, 
  iconName, 
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
  const loadingToggle = useAppSelector((state) => state.user.loading); 

  // Coerción a booleano del valor de Redux (la verdad del servidor)
  const isEmailEnabledFromStore = !!smsNotificationsValue;

  // ✨ 1. ESTADO LOCAL TEMPORAL/OPTIMISTA
  // Usamos useMemo para obtener el valor inicial de Redux de forma segura
  const initialSmsValue = useMemo(() => isEmailEnabledFromStore, []);
  
  // Usamos ese valor inicial de Redux para inicializar el estado local
  const [isSmsEnabledOptimistic, setIsSmsEnabledOptimistic] = useState(initialSmsValue);
  
  // ✨ 2. EFECTO DE RESINCRONIZACIÓN POST-CARGA
  // Esto es vital para revertir el estado local si la llamada falla
  useEffect(() => {
    // Si la carga ha terminado (loadingToggle es false)
    // Y el valor optimista no coincide con la "verdad" de Redux
    if (!loadingToggle && isSmsEnabledOptimistic !== isEmailEnabledFromStore) {
        // Esto significa que la API falló o Redux se actualizó a un valor diferente
        // Revertimos o sincronizamos el estado optimista con el valor de Redux
        setIsSmsEnabledOptimistic(isEmailEnabledFromStore);
    }
    // Si el valor del store cambia externamente (ej: otro componente lo modificó)
    // también sincronizamos el valor optimista.
  }, [isEmailEnabledFromStore, loadingToggle]); 


  // Estado local para Push (si no está gestionado por Redux)
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  
  const handlePushToggle = (newValue: boolean) => {
    setIsPushEnabled(newValue);
  };
  
  const handleEmailToggle = (newValue: boolean) => {
    // 💡 Paso Optimista: El Switch se mueve al instante
    setIsSmsEnabledOptimistic(newValue); 

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
          />
          
          <View style={notificationStyles.separator} />

          {/* Email/SMS Notifications */}
          <NotificationToggle
            label="Email/SMS Notifications"
            // 💡 Usamos el estado optimista para controlar el Switch
            isEnabled={isSmsEnabledOptimistic} 
            onToggle={handleEmailToggle} 
            iconName="envelope"
           />
          
        </View>
        
         
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