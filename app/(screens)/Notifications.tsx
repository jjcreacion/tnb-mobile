import { Theme } from '@/constants/Theme';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSmsNotifications, setSmsNotificationsStatus, loadUserData } from '@/store/slices/userSlice';
import { updateDevicePreferences, setNotificationsEnabledStatus } from '@/store/slices/deviceSlice'; // <-- ¡IMPORTACIÓN ACTUALIZADA!
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react'; 
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


interface NotificationToggleProps {
  label: string;
  isEnabled: boolean;
  onToggle: (newValue: boolean) => void;
  iconName: keyof typeof FontAwesome.glyphMap;
  disabled?: boolean; 
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  label,
  isEnabled,
  onToggle,
  iconName,
  disabled = false,
}) => (
  <View style={notificationStyles.toggleRow}>
    <View style={notificationStyles.toggleIconText}>
      <FontAwesome 
        name={iconName} 
        size={20} 
        color={disabled ? Theme.colors.neutral[500] : Theme.colors.primary[500]} 
        style={notificationStyles.toggleIcon} 
      />
      <Text style={[
        notificationStyles.toggleText, 
        disabled && { color: Theme.colors.text.secondary } 
      ]}>
        {label}
      </Text>
    </View>
    <Switch
      trackColor={{ false: Theme.colors.neutral[300], true: Theme.colors.primary[400] }}
      thumbColor={isEnabled ? Theme.colors.primary[500] : Theme.colors.neutral[500]}
      onValueChange={onToggle}
      value={isEnabled}
      disabled={disabled} 
    />
  </View>
);

const NotificationsScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUserData())
  }, [dispatch])

  const pushNotificationsEnabled = useAppSelector((state) => state.device.notificationsEnabled); // <-- Lectura del estado global
  const isDeviceLoading = useAppSelector((state) => state.device.loading); // <-- Lectura del estado de carga

  const smsNotificationsValue = useAppSelector((state) => state.user.userData?.smsNotifications);
  
  const [isEmailEnabled, setIsEmailEnabled] = useState(smsNotificationsValue);


  const handlePushToggle = (newValue: boolean) => {
    dispatch(setNotificationsEnabledStatus(newValue)); 
    dispatch(updateDevicePreferences(newValue)); 
  };

  const handleEmailToggle = (newValue: boolean) => {
    setIsEmailEnabled(newValue);
    dispatch(setSmsNotificationsStatus(newValue));
    dispatch(toggleSmsNotifications(newValue))
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
          
          <NotificationToggle
            label="Push Notifications"
            isEnabled={pushNotificationsEnabled}
            onToggle={handlePushToggle}
            iconName="bell"
          />
          
          <View style={notificationStyles.separator} />

          <NotificationToggle
            label="Email/SMS Notifications"
            isEnabled={isEmailEnabled} 
            onToggle={handleEmailToggle}
            iconName="envelope"
           />
          
        </View>
        
      </ScrollView>
    </View>
  );
};

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