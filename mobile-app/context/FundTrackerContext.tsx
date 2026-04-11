/**
 * FundTracker Context
 * Global provider yang mem-inject state dari useFundTracker
 * dan useAuth ke seluruh komponen tree
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

const FundTrackerContext = createContext<FundTrackerContextType | null>(null);

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

// ===== COMBINED PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const fundTracker = useFundTracker();
  const auth = useAuth();

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
  const ctx = useContext(FundTrackerContext);
  if (!ctx) {
    throw new Error('useFundTrackerContext harus digunakan di dalam AppProvider');
  }
  return ctx;
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext harus digunakan di dalam AppProvider');
  }
  return ctx;
}
