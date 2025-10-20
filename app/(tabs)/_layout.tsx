import { HapticTab } from '@/components/HapticTab';
import { Theme } from '@/constants/Theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.text.inverse,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: Theme.colors.primary[500],
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            borderTopWidth: 0,
            height: 85,
            paddingBottom: 0,
            paddingTop: 8,
            position: 'absolute',
            ...Theme.shadows.lg,
          },
          android: {
            backgroundColor: Theme.colors.primary[500],
            borderTopLeftRadius: Theme.borderRadius.xl,
            borderTopRightRadius: Theme.borderRadius.xl,
            borderTopWidth: 0,
            height: 65 + insets.bottom,
            paddingBottom: Math.max(insets.bottom - 5, 8),
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            ...Theme.shadows.lg,
          },
        }),
        tabBarLabelStyle: {
          fontSize: Theme.typography.fontSize.xs,
          fontWeight: Theme.typography.fontWeight.medium,
          marginBottom: Platform.OS === 'ios' ? 2 : 4,
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 2 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home'}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'notifications' : 'notifications-none'}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'event-note' : 'event-note'}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'paid' : 'paid'}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'support-agent' : 'support-agent'}
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
