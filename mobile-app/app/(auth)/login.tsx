import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Wallet, ArrowRight, Fingerprint } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuthContext();
  const [role, setRole] = useState<'donatur' | 'admin'>('donatur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsSubmitting(false);
    }
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
                <Mail size={20} color="#6d758c" />
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#6d758c"
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
                <Lock size={20} color="#6d758c" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6d758c"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#6d758c" /> : <Eye size={20} color="#6d758c" />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#005a3c" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Masuk Sekarang</Text>
                    <ArrowRight size={20} color="#005a3c" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerWrap}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ATAU GUNAKAN</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.biometricWrap}>
                <TouchableOpacity style={styles.biometricBtn}>
                  <Fingerprint size={24} color="#dee5ff" />
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
  root: { flex: 1, backgroundColor: '#0f172a' },
  loadingRoot: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  blob1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(105, 246, 184, 0.05)',
    borderRadius: 150,
  },
  blob2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 150,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#192540',
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.15)',
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
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(25, 37, 64, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.2)',
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
    borderBottomColor: 'rgba(64, 72, 93, 0.3)',
  },
  activeTab: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#69f6b8',
  },
  activeTabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#69f6b8',
  },
  inactiveTab: {
    flex: 1,
    paddingBottom: 16,
  },
  inactiveTabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#6d758c',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d758c',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#69f6b8',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.15)',
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleBtnActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6d758c',
  },
  roleBtnTextActive: {
    color: '#69f6b8',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.15)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#69f6b8',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
    shadowColor: '#69f6b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005a3c',
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(64, 72, 93, 0.3)',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  biometricWrap: {
    alignItems: 'center',
  },
  biometricBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#192540',
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#69f6b8',
  },
});
