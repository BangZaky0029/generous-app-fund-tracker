import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Wallet, ArrowRight, Fingerprint } from 'lucide-react-native';
import { useAuthContext } from '@/context/FundTrackerContext';

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
      // AppIndex handles redirection based on role
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
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#69f6b8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{flexGrow: 1, padding: 24, justifyContent: 'center'}}>
        {/* Abstract Background Elements */}
        <View className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <View className="absolute -bottom-24 -right-24 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl opacity-50" />

        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-xl bg-[rgba(25,37,64,0.6)] border border-[rgba(64,72,93,0.15)] items-center justify-center mb-4 backdrop-blur-2xl">
            <Wallet size={36} color="#69f6b8" />
          </View>
          <Text className="font-headline font-extrabold text-3xl text-on-surface">Transparent Fund Tracker</Text>
          <Text className="text-on-surface-variant mt-2 font-medium">Pantau setiap Rupiah demi dampak nyata.</Text>
        </View>

        {/* Login Form Card */}
        <View className="bg-[rgba(25,37,64,0.6)] border border-[rgba(64,72,93,0.15)] rounded-xl p-8 shadow-2xl backdrop-blur-3xl">
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity className="flex-1 pb-3 border-b-2 border-primary">
              <Text className="text-center text-sm font-bold text-primary">Masuk</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 pb-3 border-b-2 border-transparent" onPress={() => router.push('/(auth)/register')}>
              <Text className="text-center text-sm font-bold text-on-surface-variant">Daftar</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1 mb-2">Masuk Sebagai</Text>
            <View className="flex-row bg-surface-container-lowest rounded-xl p-1.5 border border-[rgba(64,72,93,0.15)]">
              <TouchableOpacity
                onPress={() => setRole('donatur')}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border ${role === 'donatur' ? 'bg-[rgba(105,246,184,0.1)] border-[rgba(105,246,184,0.3)]' : 'border-transparent'}`}
              >
                <Text className={`text-sm font-bold ml-2 ${role === 'donatur' ? 'text-primary' : 'text-on-surface-variant'}`}>Donatur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('admin')}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border ${role === 'admin' ? 'bg-[rgba(105,246,184,0.1)] border-[rgba(105,246,184,0.3)]' : 'border-transparent'}`}
              >
                <Text className={`text-sm font-bold ml-2 ${role === 'admin' ? 'text-primary' : 'text-on-surface-variant'}`}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="space-y-2 mb-6">
            <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1 mb-2">Email</Text>
            <View className="flex-row items-center bg-surface-container-lowest border border-[rgba(64,72,93,0.15)] rounded-lg px-4 h-14">
              <Mail size={20} color="#6d758c" />
              <TextInput
                className="flex-1 text-on-surface ml-3"
                placeholder="nama@email.com"
                placeholderTextColor="#6d758c"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="space-y-2 mb-8">
            <View className="flex-row justify-between items-center px-1 mb-2">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Kata Sandi</Text>
              <Text className="text-[10px] font-bold text-primary">Lupa Sandi?</Text>
            </View>
            <View className="flex-row items-center bg-surface-container-lowest border border-[rgba(64,72,93,0.15)] rounded-lg px-4 h-14">
              <Lock size={20} color="#6d758c" />
              <TextInput
                className="flex-1 text-on-surface ml-3"
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
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            className={`w-full h-14 bg-primary rounded-lg items-center justify-center flex-row shadow-lg ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? <ActivityIndicator size="small" color="#005a3c" /> : (
              <>
                <Text className="text-[#005a3c] font-bold text-lg mr-2">Masuk</Text>
                <ArrowRight size={20} color="#005a3c" />
              </>
            )}
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-center mt-6">
            <View className="flex-1 border-t border-[rgba(64,72,93,0.3)]" />
            <Text className="px-4 text-[10px] uppercase font-bold text-outline">Atau gunakan</Text>
            <View className="flex-1 border-t border-[rgba(64,72,93,0.3)]" />
          </View>

          <View className="flex-row gap-4 mt-6">
             <TouchableOpacity className="flex-1 bg-[rgba(25,37,64,0.6)] border border-[rgba(64,72,93,0.15)] p-4 rounded-lg items-center justify-center">
                 <Fingerprint size={24} color="#dee5ff" />
             </TouchableOpacity>
          </View>

        </View>

        <Text className="text-center mt-8 text-on-surface-variant text-sm">
          Belum memiliki akun? <Text className="text-primary font-bold" onPress={() => router.push('/(auth)/register')}>Daftar Sekarang</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
