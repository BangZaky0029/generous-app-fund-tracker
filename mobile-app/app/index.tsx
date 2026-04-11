/**
 * App Entry Point — Auth Gatekeeper
 *
 * File ini adalah halaman PERTAMA yang dirender Expo Router.
 * Tugasnya HANYA:
 * 1. Tampilkan splash loading saat cek session
 * 2. Kalau sudah login → redirect ke (tabs)
 * 3. Kalau belum login → redirect ke (auth)/login
 *
 * Dengan cara ini, TIDAK ADA screen yang bisa diakses tanpa auth.
 */
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { AppColors, AppFonts, AppSpacing } from '@/constants/theme';

export default function AppIndex() {
  const { user, isLoading } = useAuthContext();

  // Tampilkan loading saat Supabase cek session dari AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={AppColors.accent.emerald} />
        <Text style={styles.loadingText}>Memuat sesi...</Text>
      </View>
    );
  }

  // Sudah login → masuk dashboard
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Belum login → ke halaman login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.md,
  },
  loadingText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
});
