/**
 * FundTracker Context
 * Global provider untuk Auth + FundTracker
 *
 * POLA ARSITEKTUR:
 * - AppProvider membungkus seluruh app di _layout.tsx
 * - AuthContext selalu aktif (untuk cek session)
 * - FundTrackerContext hanya aktif kalau user sudah login (isAuthenticated)
 *   → mencegah fetch data saat belum ada session
 * - app/index.tsx bertindak sebagai gatekeeper routing
 */
import React, { createContext, useContext, type ReactNode } from 'react';
import { useFundTracker } from '@/hooks/useFundTracker';
import { useAuth } from '@/hooks/useAuth';
import type { FundTrackerState, AuthUser } from '@/constants/types';
import type { Session } from '@supabase/supabase-js';

// ===== FUND TRACKER CONTEXT =====
type FundTrackerContextType = FundTrackerState & {
  refetch: () => void;
};

const EMPTY_FUND_STATE: FundTrackerContextType = {
  totalDonations: 0,
  totalExpenses: 0,
  remainingFunds: 0,
  usagePercentage: 0,
  categories: [],
  recentExpenses: [],
  recentDonations: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  refetch: () => {},
};

const FundTrackerContext = createContext<FundTrackerContextType>(EMPTY_FUND_STATE);

// ===== AUTH CONTEXT =====
type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: 'donatur' | 'admin') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);


// ===== COMBINED PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  // NOTE: Selalu jalankan hook agar struktur pohon Context tidak pernah berganti tipe (mencegah crash navigasi).
  // Data donasi dan pengeluaran bersifat publik untuk dashboard donatur, 
  // sehingga fetch data dapat berjalan dengan aman meski tanpa session.
  const fundTracker = useFundTracker();

  return (
    <AuthContext.Provider value={auth}>
      <FundTrackerContext.Provider value={fundTracker}>
        {children}
      </FundTrackerContext.Provider>
    </AuthContext.Provider>
  );
}

// ===== CUSTOM HOOKS (Consumer) =====
export function useFundTrackerContext(): FundTrackerContextType {
  return useContext(FundTrackerContext);
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext harus digunakan di dalam AppProvider');
  }
  return ctx;
}
