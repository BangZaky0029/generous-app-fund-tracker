import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { 
  Eye, EyeOff, Lock, Mail, Wallet, 
  ArrowRight, Fingerprint, Smartphone,
  ShieldAlert
} from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabaseConfig';

export default function LoginScreen() {
  const { signIn, signOut, isLoading, setIsVerifying, showAlert } = useAuthContext();
  const [role, setRole] = useState<'donatur' | 'admin'>('donatur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Input Tidak Valid', 'Email dan password harus diisi.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setIsVerifying(true); // LOCK NAVIGATION
    try {
      // 1. Sign In ke Supabase
      await signIn(email.trim().toLowerCase(), password);
      
      // 2. Verifikasi Role secara manual untuk keamanan di pintu masuk
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
         const { data: p, error: pErr } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', user.id)
           .single();

         if (p && p.role !== role) {
            // Mismatch Role!
            await signOut();
            showAlert(
              'Akses Ditolak', 
              `Maaf, akun ini terdaftar sebagai ${p.role.toUpperCase()}. Silakan pilih role yang sesuai pada menu di atas.`, 
              'error'
            );
            setIsSubmitting(false);
            setIsVerifying(false); // UNLOCK
            return;
         }
      }

      // Jika lolos, biarkan AuthGate yang menghandle redirect ke /
      // router.replace('/') // AuthGate akan melakukan ini otomatis
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      showAlert('Login Gagal', message, 'error');
      setIsSubmitting(false);
      setIsVerifying(false); // UNLOCK
    } finally {
      // Kita buka lock hanya jika proses berhenti di sini (error/mismatch).
      // Jika berhasil, AuthGate akan memindahkan layar saat isVerifying(false) dipanggil.
      setIsVerifying(false);
    }
  };

  const showComingSoon = (name: string) => {
    showAlert(
      'Coming Soon',
      `Fitur login via ${name} sedang dalam tahap kalibrasi agen AI. Tunggu update versi selanjutnya ya!`,
      'info'
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#69f6b8" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Background Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView 
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Wallet size={36} color="#69f6b8" />
              </View>
              <Text style={styles.brandTitle}>Generous</Text>
              <Text style={styles.brandSubtitle}>Transparent Fund Tracker</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.activeTab}>
                  <Text style={styles.activeTabText}>Masuk</Text>
                </View>
                <TouchableOpacity 
                  style={styles.inactiveTab} 
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.inactiveTabText}>Daftar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>MASUK SEBAGAI</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity 
                  onPress={() => setRole('donatur')}
                  style={[styles.roleBtn, role === 'donatur' && styles.roleBtnActive]}
                >
                  <Text style={[styles.roleBtnText, role === 'donatur' && styles.roleBtnTextActive]}>Donatur</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setRole('admin')}
                  style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
                >
                  <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}>KATA SANDI</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotText}>Lupa Sandi?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#002919" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Masuk Sekarang</Text>
                    <ArrowRight size={20} color="#002919" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerWrap}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ATAU GUNAKAN</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity 
                  style={styles.socialBtn}
                  onPress={() => showComingSoon('Google')}
                >
                   <AntDesign name="google" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.socialBtn}
                  onPress={() => showComingSoon('Biometric')}
                >
                  <Fingerprint size={22} color="#69f6b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Belum memiliki akun? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Daftar Sekarang</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  blob1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(105, 246, 184, 0.03)',
    borderRadius: 150,
  },
  blob2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    borderRadius: 150,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#69f6b8',
  },
  activeTabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#69f6b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inactiveTab: {
    flex: 1,
    paddingBottom: 16,
  },
  inactiveTabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#69f6b8',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#060e20',
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleBtnActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  roleBtnTextActive: {
    color: '#69f6b8',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060e20',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#69f6b8',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
    shadowColor: '#69f6b8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#002919',
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 2,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#060e20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#69f6b8',
  },
});
