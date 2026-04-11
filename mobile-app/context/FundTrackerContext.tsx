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
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ===== INNER FUND TRACKER PROVIDER =====
// Hanya di-render kalau sudah ada user (tidak fetch data sebelum login)
function FundTrackerProvider({ children }: { children: ReactNode }) {
  const fundTracker = useFundTracker();
  return (
    <FundTrackerContext.Provider value={fundTracker}>
      {children}
    </FundTrackerContext.Provider>
  );
}

// ===== COMBINED PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {/* 
        FundTracker hanya aktif kalau user sudah login.
        Ini mencegah realtime subscription & fetch data saat belum ada session.
        isLoading true = sedang cek session, tunggu dulu.
      */}
      {auth.user ? (
        <FundTrackerProvider>{children}</FundTrackerProvider>
      ) : (
        <FundTrackerContext.Provider value={EMPTY_FUND_STATE}>
          {children}
        </FundTrackerContext.Provider>
      )}
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
