import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { colors } from '../../../src/theme/colors';
import { useAlerts } from '../../../src/context/AlertsContext';

export default function TabsLayout() {
  const { totalAlertasAtivos } = useAlerts();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Visão geral',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="aparelhos"
        options={{
          title: 'Aparelhos',
          tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
          tabBarBadge: totalAlertasAtivos > 0 ? totalAlertasAtivos : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger },
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Config.',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: 'rgba(10,20,32,0.7)',
    height: 84,
    paddingTop: 8,
  },
});
