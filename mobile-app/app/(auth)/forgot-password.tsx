import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { router } from 'expo-router';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Silakan masukkan alamat email yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      Alert.alert(
        'Email Terkirim!',
        'Instruksi pemulihan kata sandi telah dikirim ke Gmail Anda. Silakan periksa kotak masuk atau folder spam.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim email';
      Alert.alert('Error', message);
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

            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Send size={32} color="#69f6b8" />
              </View>
              <Text style={styles.title}>Lupa Kata Sandi?</Text>
              <Text style={styles.subtitle}>
                Jangan khawatir! Masukkan email Anda di bawah ini dan kami akan mengirimkan instruksi untuk mengatur ulang sandi Anda.
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.label}>ALAMAT EMAIL</Text>
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

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                onPress={handleReset}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#005a3c" />
                ) : (
                  <>
                    <Text style={styles.submitText}>Kirim Instruksi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
               <Text style={styles.footerText}>Ingat sandi Anda? </Text>
               <TouchableOpacity onPress={() => router.back()}>
                 <Text style={styles.footerLink}>Masuk Kembali</Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  header: { alignItems: 'center', marginBottom: 40 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#192540',
    borderWidth: 1,
    borderColor: 'rgba(64, 72, 93, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
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
