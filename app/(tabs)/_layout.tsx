import { HapticTab } from '@/components/HapticTab';
import { Theme } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '@/store/hooks'
import { Alert } from 'react-native'; 
import { useRouter } from 'expo-router'; 

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const userId = useAppSelector((state: any) => state.auth.userId);
  const isGuest = userId === 'GUEST_USER';

  const handleGuestRestriction = (e: any) => {
    if (isGuest) {
      e.preventDefault();

      Alert.alert(
        "Access Restricted",
        "You need to be signed in to access this feature. Would you like to log in now?",
        [
          { text: "Later", style: "cancel" },
          { 
            text: "Sign In", 
            onPress: async () => {
              router.replace('/login'); 
            } 
          }
        ]
      );
    }
  };

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Theme.colors.primary[800],
        // tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.8)',

        tabBarActiveTintColor: Theme.colors.primary[50],
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: Platform.OS === 'android' ? true : undefined,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: Theme.colors.primary[500],
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            overflow: 'hidden',
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 0,
            paddingTop: 5,
            ...Theme.shadows.lg,
          },
          android: {
            backgroundColor: Theme.colors.primary[500],
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            overflow: 'hidden',
            borderTopWidth: 0,
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            elevation: 12,
          },
        }),
        tabBarLabelStyle: Platform.select({
          ios: {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.text.inverse,
            marginBottom: 0,
            fontWeight: Theme.typography.fontWeight.medium,
          },
          android: {
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.text.inverse,
            marginBottom: 5,
            fontWeight: Theme.typography.fontWeight.medium,
          },
        }),
        tabBarIconStyle: Platform.select({
          ios: {
            marginTop: 0,
          },
          android: {
            marginTop: 5,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Icon name="notifications" size={30} color={color} />,
        }}
        listeners={{ tabPress: handleGuestRestriction }} 
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <Icon name="event-note" size={30} color={color} />,
        }}
        listeners={{ tabPress: handleGuestRestriction }} 
      />
      
    
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => <Icon name="paid" size={30} color={color} />,
        }}
        listeners={{ tabPress: handleGuestRestriction }} 
      />

      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <Icon name="support-agent" size={30} color={color} />,
        }}
      />
 
    </Tabs>
  );
}