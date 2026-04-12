import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { signUp, showAlert } = useAuthContext();
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
      // Role otomatis menjadi 'donatur' sesuai instruksi arsitek
      await signUp(email.trim().toLowerCase(), password, fullName.trim(), 'donatur');
      showAlert(
        'Pendaftaran Berhasil!', 
        'Selamat datang! Akun Donatur Anda telah dibuat. Silakan login untuk mulai berbagi.', 
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
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color="#94a3b8" />
              <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Daftar Donatur</Text>
            <Text style={styles.subtitle}>Mulai jejak kebaikan Anda hari ini bersama Generous.</Text>

            {/* Form Card */}
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.infoText}>Semua pendaftaran publik akan terdaftar secara otomatis sebagai akun Donatur.</Text>
              </View>

              <Text style={styles.label}>NAMA LENGKAP</Text>
              <View style={styles.inputWrap}>
                <User size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap sesuai KTP"
                  placeholderTextColor="#475569"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>KATA SANDI</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
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
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#002919" />
                ) : (
                  <Text style={styles.submitText}>Buat Akun Donatur</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginHint}>Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginLink}>Masuk Disini</Text>
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
  root: { flex: 1, backgroundColor: '#060e20' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 20, paddingBottom: 40 },
  blob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(105, 246, 184, 0.03)',
    borderRadius: 150,
  },
  blob2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
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
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardInfo: {
    backgroundColor: 'rgba(105, 246, 184, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.1)',
  },
  infoText: {
    color: '#69f6b8',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginHint: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#69f6b8',
  },
});
