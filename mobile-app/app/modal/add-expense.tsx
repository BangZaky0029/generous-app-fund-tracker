/**
 * Add Expense Modal
 * Form tambah pengeluaran + scan struk (OCR)
 * Admin Only
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, Camera, Image as ImageIcon, ScanLine,
  CheckCircle, AlertCircle,
} from 'lucide-react-native';
import { createExpense } from '@/services/expenseService';
import { useAuthContext } from '@/context/FundTrackerContext';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { useCamera } from '@/hooks/useCamera';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES, AppShadows } from '@/constants/theme';
import type { ExpenseCategory } from '@/constants/types';

export default function AddExpenseModal() {
  const { user, isAdmin } = useAuthContext();
  const { refetch } = useFundTrackerContext();
  const {
    isScanning, capturedUri, parsedData, error: ocrError,
    openCamera, openGallery, clearCapture,
  } = useCamera();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Logistik');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill dari OCR data (Agentic auto-fill!)
  useEffect(() => {
    if (parsedData?.amount && parsedData.amount > 0) {
      setAmount(parsedData.amount.toString());
      Alert.alert(
        '🤖 Agent Auto-Fill',
        `Nominal terdeteksi: Rp ${parsedData.amount.toLocaleString('id-ID')}. Form telah diisi otomatis!`,
        [{ text: 'Oke!' }]
      );
    }
  }, [parsedData]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Anda harus login sebagai admin.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Nominal harus diisi dan lebih dari 0.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Keterangan harus diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        admin_id: user.id,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        receiptLocalUri: capturedUri,
      });

      // Trigger refetch di context (realtime juga akan trigger otomatis)
      refetch();

      Alert.alert(
        '✅ Berhasil!',
        'Pengeluaran berhasil dicatat. Agentic Core sedang memperbarui dashboard...',
        [{ text: 'Oke', onPress: () => router.back() }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan';
      Alert.alert('❌ Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tambah Pengeluaran</Text>
            <Text style={styles.subtitle}>Admin · {user?.profile?.full_name ?? '—'}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X size={20} color={AppColors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ===== SCAN STRUK SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <ScanLine size={16} color={AppColors.accent.electric} />
              <Text style={styles.sectionTitle}>Scan Struk (OCR)</Text>
              <View style={styles.agentBadge}>
                <Text style={styles.agentBadgeText}>🤖 Auto-fill</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Foto struk → AI ekstrak nominal otomatis
            </Text>

            {/* Captured Image Preview */}
            {capturedUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: capturedUri }} style={styles.preview} />
                <TouchableOpacity style={styles.clearBtn} onPress={clearCapture}>
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.captureButtons}>
                <TouchableOpacity
                  style={[styles.captureBtn, { flex: 1 }]}
                  onPress={openCamera}
                  disabled={isScanning}
                >
                  <Camera size={18} color={AppColors.accent.electric} />
                  <Text style={styles.captureBtnText}>Kamera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.captureBtn, { flex: 1 }]}
                  onPress={openGallery}
                  disabled={isScanning}
                >
                  <ImageIcon size={18} color={AppColors.accent.blue} />
                  <Text style={[styles.captureBtnText, { color: AppColors.accent.blue }]}>Galeri</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* OCR Status */}
            {isScanning && (
              <View style={styles.ocrStatus}>
                <ActivityIndicator size="small" color={AppColors.accent.electric} />
                <Text style={styles.ocrStatusText}>AI sedang membaca struk...</Text>
              </View>
            )}
            {parsedData && !isScanning && (
              <View style={styles.ocrSuccess}>
                <CheckCircle size={14} color={AppColors.accent.emerald} />
                <Text style={styles.ocrSuccessText}>
                  Terdeteksi: Rp {parsedData.amount?.toLocaleString('id-ID') ?? '—'}
                </Text>
              </View>
            )}
            {ocrError && (
              <View style={styles.ocrError}>
                <AlertCircle size={14} color={AppColors.accent.red} />
                <Text style={styles.ocrErrorText}>OCR gagal. Isi manual.</Text>
              </View>
            )}
          </GlassCard>

          {/* ===== FORM SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            {/* Nominal */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal (Rp)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="Contoh: 50000"
                placeholderTextColor={AppColors.text.tertiary}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Kategori */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => setCategory(cat.name)}
                      style={[
                        styles.categoryChip,
                        isActive && {
                          backgroundColor: `${cat.color}20`,
                          borderColor: `${cat.color}60`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && { color: cat.color, fontWeight: AppFonts.weights.bold },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Keterangan */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Deskripsi pengeluaran..."
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
              <Text style={styles.submitText}>💾 Simpan Pengeluaran</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: AppSpacing['2xl'] }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: AppColors.glass.bg,
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
  agentBadge: {
    backgroundColor: `${AppColors.accent.electric}20`,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 2,
    borderRadius: AppRadius.full,
  },
  agentBadgeText: {
    color: AppColors.accent.electric,
    fontSize: 10,
    fontWeight: AppFonts.weights.semibold,
  },
  sectionSubtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
  },
  previewWrap: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: AppSpacing.sm,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: AppRadius.lg,
    resizeMode: 'cover',
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtons: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.sm,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppSpacing.sm,
    paddingVertical: AppSpacing.md,
    borderRadius: AppRadius.lg,
    borderWidth: 1,
    borderColor: `${AppColors.accent.electric}40`,
    backgroundColor: `${AppColors.accent.electric}10`,
  },
  captureBtnText: {
    color: AppColors.accent.electric,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  ocrStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.sm,
  },
  ocrStatusText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
  },
  ocrSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.sm,
    backgroundColor: `${AppColors.accent.emerald}10`,
    padding: AppSpacing.sm,
    borderRadius: AppRadius.md,
  },
  ocrSuccessText: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.semibold,
  },
  ocrError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.sm,
    backgroundColor: `${AppColors.accent.red}10`,
    padding: AppSpacing.sm,
    borderRadius: AppRadius.md,
  },
  ocrErrorText: {
    color: AppColors.accent.red,
    fontSize: AppFonts.sizes.xs,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  input: {
    backgroundColor: AppColors.bg.primary,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  categoryChip: {
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    backgroundColor: AppColors.glass.bg,
  },
  categoryChipText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
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
  submitText: {
    color: '#fff',
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
});
