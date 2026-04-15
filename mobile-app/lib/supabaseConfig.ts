import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('[SupabaseConfig] Initializing with:');
console.log('  - URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : '❌ EMPTY (Check .env)');
console.log('  - Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 10)}...` : '❌ EMPTY (Check .env)');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[SupabaseConfig] CRITICAL: Missing environment variables! Check your .env file.');
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