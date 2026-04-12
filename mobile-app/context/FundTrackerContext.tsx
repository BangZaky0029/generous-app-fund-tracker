/**
 * FundTracker Context
 * Global provider untuk Auth + FundTracker
 */
import React, { createContext, useContext, type ReactNode } from 'react';
import { useFundTracker } from '@/hooks/useFundTracker';
import { useAuth } from '@/hooks/useAuth';
import type { FundTrackerState, AuthUser } from '@/constants/types';
import type { Session } from '@supabase/supabase-js';

// ===== CUSTOM TYPES =====
export type AlertConfig = {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onConfirm?: () => void;
};

// ===== FUND TRACKER CONTEXT =====
type FundTrackerContextType = FundTrackerState & {
  refetch: () => void;
  alert: AlertConfig;
  showAlert: (title: string, message: string, type: AlertConfig['type'], onConfirm?: () => void) => void;
  hideAlert: () => void;
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
  alert: { visible: false, title: '', message: '', type: 'info' },
  showAlert: () => {},
  hideAlert: () => {},
};

const FundTrackerContext = createContext<FundTrackerContextType>(EMPTY_FUND_STATE);

// ===== AUTH CONTEXT =====
export type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isVerifying: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: 'donatur' | 'admin') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setIsVerifying: (val: boolean) => void;
  showAlert: (title: string, message: string, type: AlertConfig['type'], onConfirm?: () => void) => void;
  hideAlert: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ===== COMBINED PROVIDER =====
export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const fundTracker = useFundTracker();
  
  const [alert, setAlert] = React.useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = React.useCallback((title: string, message: string, type: AlertConfig['type'] = 'info', onConfirm?: () => void) => {
    setAlert({ visible: true, title, message, type, onConfirm });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  const combinedFundContext = React.useMemo(() => ({
    ...fundTracker,
    alert,
    showAlert,
    hideAlert
  }), [fundTracker, alert, showAlert, hideAlert]);

  return (
    <AuthContext.Provider value={{ ...auth, showAlert, hideAlert }}>
      <FundTrackerContext.Provider value={combinedFundContext}>
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
