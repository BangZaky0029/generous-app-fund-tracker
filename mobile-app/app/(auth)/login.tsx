/**
 * Login Screen
 * Glassmorphism auth form — Dark Mode 2026
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuthContext();
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
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      Alert.alert('Login Gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.accent.emerald} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Sparkles size={32} color={AppColors.accent.emerald} />
          </View>
          <Text style={styles.appName}>Generous</Text>
          <Text style={styles.tagline}>Transparent Fund Tracker</Text>
        </View>

        {/* Form Card */}
        <GlassCard variant="elevated" style={styles.formCard}>
          <Text style={styles.formTitle}>Masuk ke Akun</Text>
          <Text style={styles.formSubtitle}>Kelola dana dengan transparansi penuh</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Mail size={16} color={AppColors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
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
                placeholder="••••••••"
                placeholderTextColor={AppColors.text.tertiary}
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                {showPassword
                  ? <EyeOff size={16} color={AppColors.text.tertiary} />
                  : <Eye size={16} color={AppColors.text.tertiary} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.submitText}>Masuk</Text>}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Daftar</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Footer */}
        <Text style={styles.footer}>
          🤖 Powered by Agentic Core — Real-time tracking
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.bg.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: AppSpacing.base,
    paddingTop: 80,
    paddingBottom: AppSpacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: AppSpacing['2xl'],
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: AppRadius['2xl'],
    backgroundColor: `${AppColors.accent.emerald}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppSpacing.md,
    borderWidth: 1,
    borderColor: `${AppColors.accent.emerald}30`,
    ...AppShadows.emerald,
  },
  appName: {
    color: AppColors.text.white,
    fontSize: AppFonts.sizes['3xl'],
    fontWeight: AppFonts.weights.extrabold,
    letterSpacing: -0.5,
  },
  tagline: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    marginTop: 4,
  },
  formCard: {
    marginBottom: AppSpacing.xl,
  },
  formTitle: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.xl,
    fontWeight: AppFonts.weights.bold,
    marginBottom: 4,
  },
  formSubtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    marginBottom: AppSpacing.xl,
  },
  inputGroup: {
    marginBottom: AppSpacing.base,
  },
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
  inputIcon: {
    marginRight: AppSpacing.sm,
  },
  input: {
    flex: 1,
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
  },
  eyeBtn: {
    paddingLeft: AppSpacing.sm,
  },
  submitBtn: {
    backgroundColor: AppColors.accent.emerald,
    borderRadius: AppRadius.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.base,
    ...AppShadows.emerald,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: AppSpacing.base,
  },
  registerHint: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
  registerLink: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.semibold,
  },
  footer: {
    textAlign: 'center',
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
  },
});
