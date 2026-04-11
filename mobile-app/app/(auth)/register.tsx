/**
 * Register Screen
 * Pendaftaran akun baru (default role: donatur)
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export default function RegisterScreen() {
  const { signUp } = useAuthContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Semua kolom harus diisi.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password, fullName.trim());
      Alert.alert(
        'Pendaftaran Berhasil!',
        'Silakan periksa email Anda untuk konfirmasi, lalu login.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pendaftaran gagal';
      Alert.alert('Gagal Daftar', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={AppColors.text.secondary} />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>Bergabung sebagai donatur Generous</Text>

        <GlassCard variant="elevated" style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputWrap}>
              <User size={16} color={AppColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nama Lengkap"
                placeholderTextColor={AppColors.text.tertiary}
                style={styles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Mail size={16} color={AppColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={AppColors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Lock size={16} color={AppColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={AppColors.text.tertiary}
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                {showPassword
                  ? <EyeOff size={16} color={AppColors.text.tertiary} />
                  : <Eye size={16} color={AppColors.text.tertiary} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isSubmitting}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.submitText}>Daftar Sekarang</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AppColors.bg.primary },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AppSpacing.base,
    paddingTop: 60,
    paddingBottom: AppSpacing['3xl'],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginBottom: AppSpacing.xl,
  },
  backText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.base,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes['2xl'],
    fontWeight: AppFonts.weights.extrabold,
    marginBottom: 4,
  },
  subtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    marginBottom: AppSpacing.xl,
  },
  formCard: { marginBottom: AppSpacing.xl },
  inputGroup: { marginBottom: AppSpacing.base },
  inputLabel: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bg.primary,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    borderRadius: AppRadius.lg,
    paddingHorizontal: AppSpacing.md,
    height: 48,
  },
  inputIcon: { marginRight: AppSpacing.sm },
  input: { flex: 1, color: AppColors.text.primary, fontSize: AppFonts.sizes.base },
  eyeBtn: { paddingLeft: AppSpacing.sm },
  submitBtn: {
    backgroundColor: AppColors.accent.electric,
    borderRadius: AppRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.base,
    ...AppShadows.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: AppFonts.sizes.md, fontWeight: AppFonts.weights.bold },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: AppSpacing.base },
  loginHint: { color: AppColors.text.secondary, fontSize: AppFonts.sizes.sm },
  loginLink: { color: AppColors.accent.electric, fontSize: AppFonts.sizes.sm, fontWeight: AppFonts.weights.semibold },
});
