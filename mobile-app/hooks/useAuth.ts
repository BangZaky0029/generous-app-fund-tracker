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
  isVerifying: boolean;
  isAdmin: boolean;
};

type AuthActions = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: 'donatur' | 'admin') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName: string, avatarUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setIsVerifying: (val: boolean) => void;
};

export function useAuth(): AuthState & AuthActions {
  // ... (existing state and fetchProfile)
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isVerifying: false,
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
      // Safety timeout to ensure loading state doesn't hang forever
      const timeoutId = setTimeout(() => {
        setState(prev => prev.isLoading ? { ...prev, isLoading: false } : prev);
      }, 5000);

      if (!session?.user) {
        console.log('[useAuth] No session found, clearing state');
        setState({ user: null, session: null, isLoading: false, isVerifying: false, isAdmin: false });
        clearTimeout(timeoutId);
        return;
      }

      try {
        const profile = await fetchProfile(session.user.id);
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? null,
          profile,
        };

        setState(prev => ({
          ...prev,
          user: authUser,
          session,
          isLoading: false,
          isAdmin: profile?.role === 'admin',
        }));
      } catch (err) {
        console.error('[useAuth] Error in updateFromSession:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        clearTimeout(timeoutId);
      }
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
    console.log(`[useAuth] Attempting signIn for: ${email}...`);
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[useAuth] SignIn error:', error.message);
        throw new Error(error.message);
      }
      console.log('[useAuth] SignIn success');
    } catch (err) {
      console.error('[useAuth] SignIn unexpected error:', err);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: 'donatur' | 'admin' = 'donatur') => {
    console.log(`[useAuth] Attempting signUp for: ${email}...`);
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('[useAuth] SignUp Auth Error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('[useAuth] Auth Success, creating profile...');
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          role: role,
        });

        if (profileError) {
          console.error('[useAuth] Profile creation error:', profileError.message);
          // Kita tidak throw error di sini agar user tetap bisa login nanti jika auth-nya sudah berhasil
          // Tapi kita log untuk debug.
        } else {
          console.log('[useAuth] Profile created successfully');
        }
      } else {
        console.warn('[useAuth] SignUp success but no user returned (might need confirmation)');
      }
    } catch (err) {
      console.error('[useAuth] SignUp unexpected error:', err);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    console.log(`[useAuth] Requesting password reset for: ${email}...`);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'generous-app://reset-password',
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateProfile = useCallback(async (fullName: string, avatarUrl?: string) => {
    if (!state.user?.id) return;
    
    const payload: any = { full_name: fullName.trim() };
    if (avatarUrl) payload.avatar_url = avatarUrl;
    
    const { error } = await supabase
      .from('profiles')
      .update(payload)
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
    console.log('[useAuth] User initiated signOut');
    
    try {
      // 1. Matikan sesi di server
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[useAuth] Supabase SignOut error:', err);
    } finally {
      // 2. Bersihkan state lokal APAPUN yang terjadi di server
      // Kita set isLoading true sebentar untuk trigger transisi di AuthGate
      setState({ user: null, session: null, isLoading: false, isVerifying: false, isAdmin: false });
      console.log('[useAuth] Local state cleared, redirect should follow');
    }
  }, []);

  const setIsVerifying = useCallback((val: boolean) => {
    setState(prev => ({ ...prev, isVerifying: val }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    resetPassword,
    updateProfile,
    signOut,
    setIsVerifying,
  };
}
