import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A6230C',
        tabBarInactiveTintColor: '#ffffff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#fe4944',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 0,
            paddingTop: 5,
          },
          android: {
            backgroundColor: '#fe4944',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: 'hidden',
            borderTopWidth: 0,
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
          },
        }),
        tabBarLabelStyle: Platform.select({
          ios: {
            fontSize: 12,
            color: '#ffffff',
            marginBottom: 0,
          },
          android: {
            fontSize: 12,
            color: '#ffffff',
            marginBottom: 5,
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
        ...Platform.select({
          ios: {
            shadowColor: 'gray',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          },
          android: {
            elevation: 10,
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
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <Icon name="event-note" size={30} color={color} />,
        }}
      />
      
    
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => <Icon name="paid" size={30} color={color} />,
        }}
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