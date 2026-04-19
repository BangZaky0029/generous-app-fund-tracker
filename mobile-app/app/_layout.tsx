import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import 'react-native-reanimated';
import { AppProvider, useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { AppColors } from '@/constants/theme';
import { AlertModal } from '@/components/ui/AlertModal';
import { useNotifications } from '@/hooks/useNotifications';
import { RefreshCw, AlertCircle } from 'lucide-react-native';

// ========== ERROR BOUNDARY COMPONENT ==========

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRestart = () => {
    // Reset state dan paksa reload (Expo Router akan re-sync)
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#ff4757" />
          <Text style={styles.errorTitle}>Oopss! Ada Kendala Teknis</Text>
          <Text style={styles.errorSubtitle}>
            Aplikasi mengalami kesalahan saat memproses data. Hal ini bisa terjadi karena koneksi tidak stabil atau masalah render.
          </Text>
          
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRestart}>
            <RefreshCw size={20} color="#002919" />
            <Text style={styles.retryBtnText}>Muat Ulang Aplikasi</Text>
          </TouchableOpacity>

          {__DEV__ && (
            <View style={styles.devErrorBox}>
              <Text style={styles.devErrorText}>{this.state.error?.message}</Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

// ========== REST OF THE LAYOUT ==========

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

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';
    const inAdminGroup = rootSegment === '(admin)';
    const inDonaturGroup = rootSegment === '(donatur)';

    console.log(`[AuthGate] Segments: [${segments.join(', ')}] | User: ${user ? 'YES' : 'NO'} | Profile: ${user?.profile ? 'YES' : 'NO'} | Admin: ${isAdmin}`);

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      const userRole = user.profile?.role || 'donatur';
      const isActuallyAdmin = userRole === 'admin';

      if (isActuallyAdmin) {
        if (!inAdminGroup) {
          if (!rootSegment || inDonaturGroup || inAuthGroup) {
            router.replace('/(admin)/(tabs)/dashboard');
          }
        }
      } else {
        if (!inDonaturGroup) {
          if (!rootSegment || inAdminGroup || inAuthGroup) {
            router.replace('/(donatur)/(tabs)/dashboard');
          }
        }
      }
    }
  }, [user, isAdmin, isLoading, isVerifying, segments]);

  return null;
}

function NotificationInitializer() {
  const {
    showPermissionModal,
    setShowPermissionModal,
    handleAllowNotifications
  } = useNotifications();

  return (
    <AlertModal
      visible={showPermissionModal}
      title="Aktifkan Notifikasi?"
      message="Dapatkan info donasi terbaru, kabar progres wadah yang Anda bantu, dan laporan transparansi pengeluaran dana secara real-time."
      type="info"
      confirmText="Siap, Aktifkan"
      cancelText="Nanti Saja"
      onClose={() => setShowPermissionModal(false)}
      onConfirm={handleAllowNotifications}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <GlobalErrorBoundary>
        <AppProvider>
          <NotificationInitializer />
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
      </GlobalErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Error Styles
  errorContainer: {
    flex: 1,
    backgroundColor: '#060e20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#69f6b8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 32,
  },
  retryBtnText: {
    color: '#002919',
    fontWeight: 'bold',
    fontSize: 16,
  },
  devErrorBox: {
    marginTop: 40,
    padding: 12,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  devErrorText: {
    color: '#ff4757',
    fontSize: 12,
    fontFamily: 'monospace',
  }
});
