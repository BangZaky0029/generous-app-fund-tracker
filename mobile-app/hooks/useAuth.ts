/**
 * useAuth Hook
 * Mengelola state autentikasi dengan Supabase Auth
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import type { AuthUser, Profile } from '@/constants/types';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
};

type AuthActions = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  // Ambil profile dari tabel profiles
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[useAuth] Profile fetch error:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // Update state dari session
  const updateFromSession = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        setState({ user: null, session: null, isLoading: false, isAdmin: false });
        return;
      }

      const profile = await fetchProfile(session.user.id);
      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email ?? null,
        profile,
      };

      setState({
        user: authUser,
        session,
        isLoading: false,
        isAdmin: profile?.role === 'admin',
      });
    },
    [fetchProfile]
  );

  useEffect(() => {
    // Cek session yang sudah ada
    supabase.auth.getSession().then(({ data }) => {
      updateFromSession(data.session);
    });

    // Subscribe ke perubahan auth state
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateFromSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [updateFromSession]);

  // --- Sign In ---
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  // --- Sign Up (register + buat profile) ---
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      // Buat profile dengan role donatur (default)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        role: 'donatur',
      });
      if (profileError) console.error('[SignUp] Profile create error:', profileError.message);
    }
  }, []);

  // --- Sign Out ---
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}
