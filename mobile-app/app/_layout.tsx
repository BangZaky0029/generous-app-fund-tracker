/**
 * Root Layout — Wrap seluruh app dengan AppProvider
 *
 * CATATAN ARSITEKTUR:
 * - Tidak ada unstable_settings.anchor di sini
 * - Semua auth routing dihandle oleh app/index.tsx (gatekeeper)
 * - AppProvider di sini hanya provide Context, tidak trigger redirect
 */
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AppProvider, useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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

/**
 * AuthGate — Penjaga pintu otomatis
 */
function AuthGate() {
  const { user, isAdmin, isLoading, isVerifying } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Kunci navigasi jika sedang loading atau sedang verifikasi role
    if (isLoading || isVerifying) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inDonaturGroup = segments[0] === '(donatur)';

    console.log(`[AuthGate] Segments: ${segments.join('/')} | User: ${user ? 'YES' : 'NO'} | Admin: ${isAdmin}`);

    if (!user) {
      // Jika tidak ada user dan tidak sedang di folder (auth), lempar ke login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Jika ada user
      if (isAdmin) {
        // Admin tapi tidak di folder admin, lempar ke dashboard admin
        if (!inAdminGroup) {
          router.replace('/(admin)/dashboard');
        }
      } else {
        // Donatur tapi tidak di folder donatur, lempar ke dashboard donatur
        if (!inDonaturGroup) {
          router.replace('/(donatur)/dashboard');
        }
      }
    }
  }, [user, isAdmin, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <AuthGate />
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
