/**
 * App Entry Point — Auth Gatekeeper
 * Logic pengalihan sekarang dihandle secara global di app/_layout.tsx (AuthGate)
 */
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';

export default function AppIndex() {
  const { isLoading } = useAuthContext();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#060e20']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Wallet size={48} color="#69f6b8" />
        </View>
        
        <Text style={styles.title}>Generous</Text>
        <Text style={styles.subtitle}>Transparent Ledger System</Text>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#69f6b8" />
          <Text style={styles.loadingText}>Menyinkronkan Sesi...</Text>
        </View>
      </View>
      
      <Text style={styles.version}>v3.0.0-edge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#060e20',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(25, 37, 64, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.1)',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 40,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
