import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons'; 

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors['light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'transparent', 
          borderTopWidth: 0, 
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <FontAwesome name="list-ul" size={24} color={color} />, 
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <FontAwesome name="question-circle" size={24} color={color} />, 
        }}
      />
    </Tabs>
  );
}