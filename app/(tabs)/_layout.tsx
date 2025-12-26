import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const getTabIcon = (name: IconName, color: string, size: number = 26) => (
    <MaterialCommunityIcons name={name} size={size} color={color} />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0f0f0f' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#2a2a2a' : '#e2e8f0',
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => getTabIcon('home', color),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => getTabIcon('history', color),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Análisis',
          tabBarIcon: ({ color }) => getTabIcon('chart-pie', color),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => getTabIcon('bell-outline', color),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => getTabIcon('cog-outline', color),
        }}
      />
      {/* Hide explore from tabs */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
