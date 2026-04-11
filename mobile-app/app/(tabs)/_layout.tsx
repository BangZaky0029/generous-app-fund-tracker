/**
 * Tabs Layout — Navigation Bar 2026 Light Theme (Fintech Style)
 */
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { LayoutDashboard, ShieldCheck, Info, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/FundTrackerContext';
import { AppColors, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuthContext();

  const tabHeight = 60 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            { height: tabHeight, paddingBottom: insets.bottom }
          ],
          tabBarActiveTintColor: AppColors.accent.electric,
          tabBarInactiveTintColor: AppColors.text.tertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => <View style={styles.tabBg} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Beranda',
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard size={size ?? 24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="transparency"
          options={{
            title: 'Transaksi',
            tabBarIcon: ({ color, size }) => (
              <View style={isAdmin ? styles.offsetIcon : {}}>
                <ShieldCheck size={size ?? 24} color={color} strokeWidth={2.5} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Tentang',
            tabBarIcon: ({ color, size }) => (
              <Info size={size ?? 24} color={color} strokeWidth={2.5} />
            ),
          }}
        />
      </Tabs>

      {/* Floating Center Camera Button (Admin Only) */}
      {isAdmin && (
        <View style={[styles.fabContainer, { bottom: insets.bottom + 10 }]} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => router.push('/modal/add-expense')}
            activeOpacity={0.8}
          >
            <Camera size={26} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: AppColors.bg.secondary,
    borderTopColor: AppColors.glass.border,
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 10,
    shadowColor: AppColors.text.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabBg: {
    flex: 1,
    backgroundColor: AppColors.bg.secondary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  offsetIcon: {
    // Memberi jarak sedikit agar tidak tertutupi FAB kamera yang melayang
    marginRight: Platform.OS === 'ios' ? 40 : 30,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.accent.electric,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: AppColors.bg.secondary, // Efek menembus tab bar
    ...AppShadows.md,
    shadowColor: AppColors.accent.electric,
  },
});
