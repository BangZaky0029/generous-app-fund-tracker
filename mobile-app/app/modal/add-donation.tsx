/**
 * Add Donation Modal
 * Form tambah dana masuk (Donasi)
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowDownCircle } from 'lucide-react-native';

import { createDonation } from '@/services/donationService';
import { useAuthContext } from '@/context/FundTrackerContext';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export default function AddDonationModal() {
  const { user, isAdmin } = useAuthContext();
  const { refetch, activeCampaigns } = useFundTrackerContext();
  const insets = useSafeAreaInsets();

  const [donatorName, setDonatorName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAdmin) {
      Alert.alert('Error', 'Hanya Admin yang dapat mencatat dana masuk.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Nominal dana masuk harus diisi dan lebih dari 0.');
      return;
    }
    if (!campaignId) {
      Alert.alert('Peringatan', 'Harap pilih wadah tujuan donasi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonation({
        campaign_id: campaignId,
        donator_name: donatorName.trim() || 'Hamba Allah',
        amount: amount,
        message: message.trim() || '-',
      });

      // Refetch context agar dashboard update
      await refetch();

      Alert.alert(
        '✅ Berhasil!',
        'Dana masuk berhasil dicatat. Keseluruhan sistem telah diupdate.',
        [{ text: 'Selesai', onPress: () => router.back() }]
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      Alert.alert('❌ Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Catat Kas / Donasi Masuk</Text>
            <Text style={styles.subtitle}>Admin · {user?.profile?.full_name ?? '—'}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color={AppColors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ===== INFO SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <ArrowDownCircle size={20} color={AppColors.accent.emerald} />
              <Text style={styles.sectionTitle}>Detail Penerimaan Uang</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Catat uang kas, sumbangan, atau donasi yang masuk ke rekening bendahara/kas agar saldo sistem bertambah.
            </Text>
          </GlassCard>

          {/* ===== FORM SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            {/* Pilih Wadah Penerima */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Wadah Penerima *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.campaignList}
                contentContainerStyle={{ gap: 8 }}
              >
                {activeCampaigns.map((camp: any) => {
                  const isActive = campaignId === camp.id;
                  return (
                    <TouchableOpacity
                      key={camp.id}
                      onPress={() => setCampaignId(camp.id)}
                      style={[
                        styles.campChip,
                        isActive && styles.campChipActive
                      ]}
                    >
                      <View style={[styles.statusIndicator, { backgroundColor: isActive ? '#69f6b8' : 'rgba(255,255,255,0.2)' }]} />
                      <Text style={[
                        styles.campChipText,
                        isActive && styles.campChipTextActive
                      ]}>
                        {camp.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Nama Donatur */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Penyetor</Text>
              <TextInput
                value={donatorName}
                onChangeText={setDonatorName}
                placeholder="cth: Budi / Angkatan 2024"
                placeholderTextColor={AppColors.text.tertiary}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            {/* Nominal */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal Masuk (Rp) *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Contoh: 150000"
                placeholderTextColor={AppColors.text.tertiary}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Keterangan */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan / Pesan</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="cth: Uang kas bulan ini..."
                placeholderTextColor={AppColors.text.tertiary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
              />
            </View>
          </GlassCard>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>✅ Tambah Saldo Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: AppSpacing['2xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.base,
    paddingVertical: AppSpacing.md,
    backgroundColor: AppColors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.glass.border,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.lg,
    fontWeight: AppFonts.weights.bold,
  },
  subtitle: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.glass.border,
  },
  scroll: {
    padding: AppSpacing.base,
    gap: AppSpacing.md,
  },
  section: {
    gap: AppSpacing.sm,
    padding: AppSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  sectionTitle: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.semibold,
    flex: 1,
  },
  sectionSubtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    marginTop: AppSpacing.xs,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 6,
    marginTop: AppSpacing.sm,
  },
  inputLabel: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  input: {
    backgroundColor: AppColors.bg.tertiary,
    borderWidth: 1,
    borderColor: AppColors.glass.borderStrong,
    borderRadius: AppRadius.lg,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: AppColors.accent.emerald,
    borderRadius: AppRadius.xl,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: AppSpacing.md,
    ...AppShadows.emerald,
  },
  submitBtnDisabled: { opacity: 0.6 },
  
  // Campaign Picker Styles
  campaignList: {
    marginTop: 4,
  },
  campChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  campChipActive: {
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    borderColor: '#69f6b8',
    borderWidth: 1.5,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  campChipText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  campChipTextActive: {
    color: '#69f6b8',
    fontWeight: 'bold',
  },

  submitText: {
    color: '#fff',
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
});
