import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#88fad1',
        tabBarInactiveTintColor: '#ffffff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fe4944',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: 'hidden',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ?  70: 90, 
          marginTop: Platform.OS === 'ios' ?  30: 0, 
        },
        tabBarLabelStyle: {
          fontSize: 12, 
          color: '#ffffff', 
        },
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
          tabBarIcon: ({ color }) => <Icon name="history" size={30} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color }) => <Icon name="history" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => <Icon name="attach-money" size={30} color={color} />,
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