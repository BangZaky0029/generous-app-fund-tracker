import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { signUp, showAlert } = useAuthContext();
  const [role, setRole] = useState<'donatur' | 'admin'>('donatur');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showAlert('Input Tidak Valid', 'Semua kolom harus diisi.', 'warning');
      return;
    }
    if (password.length < 6) {
      showAlert('Password Terlalu Pendek', 'Password minimal 6 karakter.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password, fullName.trim(), role);
      showAlert(
        'Pendaftaran Berhasil!', 
        'Akun Anda telah dibuat. Silakan login untuk melanjutkan.', 
        'success',
        () => router.replace('/(auth)/login')
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pendaftaran gagal';
      showAlert('Gagal Daftar', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background blobs */}
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
            {/* Back Button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#94a3b8" />
              <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>Bergabung sebagai {role === 'admin' ? 'Pengelola' : 'Donatur'} Generous</Text>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.label}>DAFTAR SEBAGAI</Text>
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

              <Text style={styles.label}>NAMA LENGKAP</Text>
              <View style={styles.inputWrap}>
                <User size={20} color="#6d758c" />
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#6d758c"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Mail size={20} color="#6d758c" />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#6d758c"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>KATA SANDI</Text>
              <View style={styles.inputWrap}>
                <Lock size={20} color="#6d758c" />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
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
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#005a3c" />
                ) : (
                  <Text style={styles.submitText}>Daftar Sekarang</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginHint}>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginLink}>Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 20, paddingBottom: 40 },
  blob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 150,
  },
  blob2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(105, 246, 184, 0.05)',
    borderRadius: 150,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    marginTop: 10,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(25, 37, 64, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.2)',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d758c',
    marginBottom: 8,
    letterSpacing: 1.5,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginHint: {
    fontSize: 13,
    color: '#94a3b8',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#69f6b8',
  },
});
