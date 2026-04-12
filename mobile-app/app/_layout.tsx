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
import { AppProvider, useFundTrackerContext } from '@/context/FundTrackerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppColors } from '@/constants/theme';
import { AlertModal } from '@/components/ui/AlertModal';

function GlobalAlert() {
  const { alert, hideAlert } = useFundTrackerContext();
  return (
    <AlertModal
      visible={alert.visible}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      onClose={hideAlert}
      onConfirm={alert.onConfirm ? () => {
        alert.onConfirm?.();
        hideAlert();
      } : undefined}
    />
  );
}

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
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(donatur)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />
          <Stack.Screen
            name="modal/add-expense"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <GlobalAlert />
        <StatusBar style="light" backgroundColor={AppColors.bg.primary} />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
