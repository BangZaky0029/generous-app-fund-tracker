/**
 * Tabs Layout — Navigation Bar 2026 Dark Theme
 */
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { LayoutDashboard, ShieldCheck, Info } from 'lucide-react-native';
import { AppColors, AppRadius, AppSpacing } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: AppColors.accent.emerald,
        tabBarInactiveTintColor: AppColors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="transparency"
        options={{
          title: 'Transparency',
          tabBarIcon: ({ color, size }) => (
            <ShieldCheck size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Tentang',
          tabBarIcon: ({ color, size }) => (
            <Info size={size ?? 22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: AppColors.bg.tertiary,
    borderTopColor: AppColors.glass.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Platform.select({
      android: {
        elevation: 16,
      },
    }),
  },
  tabBg: {
    flex: 1,
    backgroundColor: AppColors.bg.tertiary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
