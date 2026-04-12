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
  signUp: (email: string, password: string, fullName: string, role?: 'donatur' | 'admin') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState & AuthActions {
  // ... (existing state and fetchProfile)
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log(`[useAuth] Fetching profile for: ${userId}...`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useAuth] Supabase Error fetching profile:', error.message, error.details);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('[useAuth] Network/Unknown Error fetching profile:', err);
      return null;
    }
  }, []);

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
    supabase.auth.getSession().then(({ data }) => {
      updateFromSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateFromSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [updateFromSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: 'donatur' | 'admin' = 'donatur') => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        role: role,
      });
      if (profileError) console.error('[SignUp] Profile create error:', profileError.message);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'generous-app://reset-password',
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    if (!state.user?.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', state.user.id);

    if (error) throw new Error(error.message);
    
    // Refresh local state
    const newProfile = await fetchProfile(state.user.id);
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, profile: newProfile } : null
    }));
  }, [state.user, fetchProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    resetPassword,
    updateProfile,
    signOut,
  };
}
