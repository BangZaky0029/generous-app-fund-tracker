/**
 * Root Layout — Wrap seluruh app dengan AppProvider
 *
 * CATATAN ARSITEKTUR:
 * - Tidak ada unstable_settings.anchor di sini
 * - Semua auth routing dihandle oleh app/index.tsx (gatekeeper)
 * - AppProvider di sini hanya provide Context, tidak trigger redirect
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProvider } from '@/context/FundTrackerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppColors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: AppColors.bg.primary },
            animation: 'fade',
          }}
        >
          {/* Gatekeeper — halaman pertama yang dirender */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Tab screens — hanya bisa diakses kalau sudah login */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Auth screens */}
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />

          {/* Modal — form tambah expense */}
          <Stack.Screen
            name="modal/add-expense"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style="light" backgroundColor={AppColors.bg.primary} />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
