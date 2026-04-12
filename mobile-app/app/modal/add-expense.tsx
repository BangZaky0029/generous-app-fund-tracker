/**
 * Add Expense Modal
 * Form tambah pengeluaran + scan struk (Custom OCR Camera)
 * Admin Only
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, Camera as CameraIcon, Image as ImageIcon, ScanLine,
  CheckCircle, AlertCircle,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

import { createExpense } from '@/services/expenseService';
import { useAuthContext } from '@/context/FundTrackerContext';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { useCamera } from '@/hooks/useCamera';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES, AppShadows } from '@/constants/theme';
import type { ExpenseCategory } from '@/constants/types';

export default function AddExpenseModal() {
  const { user, isAdmin } = useAuthContext();
  const { refetch, showAlert } = useFundTrackerContext();
  const insets = useSafeAreaInsets();

  const {
    isScanning, capturedUri, parsedData, error: ocrError,
    openGallery, processImage, clearCapture,
  } = useCamera();

  const [permission, requestPermission] = useCameraPermissions();
  const [showCustomCamera, setShowCustomCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Logistik');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation for scanner line
  const scanLineY = useSharedValue(0);
  const animatedScanLine = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  useEffect(() => {
    if (showCustomCamera) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(250, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scanLineY.value = 0;
    }
  }, [showCustomCamera]);

  // Auto-fill dari OCR data (Agentic auto-fill!)
  useEffect(() => {
    if (parsedData?.amount && parsedData.amount > 0) {
      setAmount(parsedData.amount.toString());
      showAlert(
        '🤖 Agent Auto-Fill',
        `Nominal terdeteksi: Rp ${parsedData.amount.toLocaleString('id-ID')}. Data telah diisi otomatis.`,
        'success'
      );
    }
  }, [parsedData]);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        showAlert('Izin Ditolak', 'Aplikasi butuh izin kamera untuk memindai struk belanja.', 'error');
        return;
      }
    }
    setShowCustomCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.8 });
      setShowCustomCamera(false);
      if (photo?.uri) {
        await processImage(photo.uri);
      }
    } catch (e) {
      showAlert('Error', 'Gagal membidik gambar dari sensor kamera.', 'error');
      console.error(e);
      setShowCustomCamera(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      showAlert('Akses Ditolak', 'Anda harus memiliki otoritas admin untuk mencatat transaksi.', 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showAlert('Data Tidak Valid', 'Nominal pengeluaran harus diisi dengan angka positif.', 'warning');
      return;
    }
    if (!description.trim()) {
      showAlert('Data Kurang', 'Keterangan transaksi wajib diisi untuk audit.', 'warning');
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

      refetch();

      showAlert(
        '✅ Berhasil!',
        'Aset transaksi telah dicatat dan diverifikasi. Agen sedang menyinkronkan ledger...',
        'success',
        () => router.back()
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal sinkronisasi data';
      showAlert('❌ Sinkronisasi Gagal', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== CUSTOM CAMERA VIEW =====
  if (showCustomCamera) {
    return (
      <View style={styles.cameraRoot}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" ref={cameraRef} />
        <View style={[StyleSheet.absoluteFillObject, styles.cameraOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="box-none">
          {/* Header */}
          <View style={styles.cameraHeader} pointerEvents="box-none">
            <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCustomCamera(false)}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Scan Struk Belanja</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Scan Frame */}
          <View style={styles.scanFrameWrap} pointerEvents="none">
            <View style={styles.scanFrame}>
              <Animated.View style={[styles.scanLine, animatedScanLine]} />
            </View>
            <Text style={styles.scanHint}>Posisikan struk penuh di dalam kotak</Text>
          </View>

          {/* Capture Button */}
          <View style={styles.cameraFooter} pointerEvents="box-none">
            <TouchableOpacity style={styles.captureCircleOuter} onPress={handleCapture}>
              <View style={styles.captureCircleInner} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ===== MAIN FORM VIEW =====
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
                  onPress={handleOpenCamera}
                  disabled={isScanning}
                >
                  <CameraIcon size={18} color={AppColors.accent.electric} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: AppFonts.sizes.lg,
    fontWeight: AppFonts.weights.bold,
  },
  scanFrameWrap: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: AppColors.accent.electric,
    borderRadius: AppRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scanLine: {
    height: 3,
    width: '100%',
    backgroundColor: AppColors.accent.electric,
    shadowColor: AppColors.accent.electric,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  scanHint: {
    color: '#FFF',
    fontSize: AppFonts.sizes.sm,
    marginTop: AppSpacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: 8,
    borderRadius: AppRadius.full,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: AppSpacing['3xl'],
  },
  captureCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
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
