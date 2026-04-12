import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('[SupabaseConfig] URL initialized:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : 'EMPTY');
console.log('[SupabaseConfig] Anon Key initialized:', SUPABASE_ANON_KEY ? 'YES' : 'EMPTY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[SupabaseConfig] CRITICAL: Missing environment variables!');
  // Jangan throw error keras agar aplikasi tidak crash total, biarkan ditangani oleh pemanggil
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export realtime client secara langsung untuk useFundTracker hook
export const AppRealtime = supabase.realtime;