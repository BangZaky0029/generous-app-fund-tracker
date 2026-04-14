/**
 * Add Expense Screen (Internal to Tabs)
 * Form tambah pengeluaran - Data diterima dari Scanner Utama atau Input Manual
 */
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ScanLine, ArrowLeft } from 'lucide-react-native';

import { createExpense } from '@/services/expenseService';
import { useAuthContext } from '@/context/FundTrackerContext';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES } from '@/constants/theme';
import type { ExpenseCategory } from '@/constants/types';

export default function AddExpenseScreen() {
  const { user, isAdmin } = useAuthContext();
  const fundData = useFundTrackerContext();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Logistik');
  const [description, setDescription] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const processedUriRef = useRef<string | null>(null);

  // Logic Reset Form saat masuk manual (Clean Start)
  useFocusEffect(
    useCallback(() => {
      // Jika masuk ke layar ini TANPA membawa parameter foto baru dari kamera
      if (!params.capturedUri) {
        setAmount('');
        setDescription('');
        setCapturedUri(null);
        processedUriRef.current = null;
      }
    }, [params.capturedUri])
  );

  // Fill data dari params (Scanner & Campaign Context)
  useEffect(() => {
    const newUri = params.capturedUri as string | undefined;
    
    if (newUri && newUri !== processedUriRef.current) {
      if (params.amount) setAmount(params.amount as string);
      if (params.description) setDescription(params.description as string);
      if (params.category) setCategory(params.category as ExpenseCategory);
      setCapturedUri(newUri);
      processedUriRef.current = newUri;
    }

    if (params.campaignId) {
      setCampaignId(params.campaignId as string);
    }
    if (params.campaignTitle) {
      setCampaignTitle(params.campaignTitle as string);
    }
  }, [params.capturedUri, params.amount, params.description, params.category, params.campaignId, params.campaignTitle]);

  const handleSubmit = async () => {
    if (!isAdmin || !user?.id) {
      fundData.showAlert('Akses Ditolak', 'Hanya Admin yang dapat mencatat pengeluaran.', 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      fundData.showAlert('Data Tidak Valid', 'Nominal pengeluaran harus diisi dan lebih dari 0.', 'warning');
      return;
    }
    if (!description.trim()) {
      fundData.showAlert('Data Kurang', 'Keterangan transaksi wajib diisi.', 'warning');
      return;
    }
    if (!campaignId) {
      fundData.showAlert('Data Kurang', 'Silahkan pilih wadah donasi terlebih dahulu.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        admin_id: user.id,
        campaign_id: campaignId,
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        receiptLocalUri: capturedUri,
      });

      await fundData.refetch();

      fundData.showAlert(
        '✅ Berhasil!',
        'Pengeluaran berhasil diverifikasi dan dicatat.',
        'success',
        () => router.back()
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan';
      fundData.showAlert('Gagal Simpan', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={AppColors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Simpan Pengeluaran</Text>
            <Text style={styles.subtitle}>Verifikasi Data Transaksi</Text>
            {campaignTitle && (
              <View style={styles.contextBadge}>
                <Text style={styles.contextLabel}>WADAH:</Text>
                <Text style={styles.contextValue} numberOfLines={1}>{campaignTitle}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.scanToggleBtn} 
            onPress={() => router.push({
              pathname: '/(admin)/validasi-kamera',
              params: { mode: 'scan', returnTo: '/(admin)/add-expense' }
            })}
          >
            <ScanLine size={20} color="#69f6b8" />
            <Text style={styles.scanToggleText}>Auto Scan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          {/* ===== CAMPAIGN PICKER (If missing) ===== */}
          {!params.campaignId && (
            <GlassCard variant="elevated" style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pilih Wadah Donasi</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.campaignList}>
                  {fundData.activeCampaigns.map((camp: any) => (
                    <TouchableOpacity
                      key={camp.id}
                      onPress={() => {
                        setCampaignId(camp.id);
                        setCampaignTitle(camp.title);
                      }}
                      style={[
                        styles.campChip,
                        campaignId === camp.id && styles.campChipActive
                      ]}
                    >
                      <Text style={[
                        styles.campChipText,
                        campaignId === camp.id && styles.campChipTextActive
                      ]}>{camp.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </GlassCard>
          )}

          {/* ===== BUKTI SECTION ===== */}
          {capturedUri && (
            <GlassCard variant="elevated" style={styles.section}>
              <View style={styles.sectionHeader}>
                <ScanLine size={16} color={AppColors.accent.electric} />
                <Text style={styles.sectionTitle}>Bukti Terdeteksi</Text>
                <TouchableOpacity onPress={() => setCapturedUri(null)}>
                  <X size={16} color={AppColors.text.tertiary} />
                </TouchableOpacity>
              </View>
              <View style={styles.previewWrap}>
                <Image source={{ uri: capturedUri }} style={styles.preview} />
              </View>
            </GlassCard>
          )}

          {/* ===== FORM SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal (Rp)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={AppColors.text.tertiary}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => setCategory(cat.name)}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryChip,
                        isActive && {
                          backgroundColor: `${cat.color}30`,
                          borderColor: cat.color,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && { color: cat.color, fontWeight: 'bold' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Masukkan keterangan..."
                placeholderTextColor={AppColors.text.tertiary}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
              />
            </View>
          </GlassCard>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.submitText}>Konfirmasi Penyaluran</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060e20',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: AppColors.accent.emerald,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contextBadge: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  contextLabel: {
    color: AppColors.accent.emerald,
    fontSize: 8,
    fontWeight: '900',
  },
  contextValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 150,
  },
  campaignList: {
    marginTop: 8,
  },
  campChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginRight: 8,
  },
  campChipActive: {
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    borderColor: '#69f6b8',
  },
  campChipText: {
    color: '#64748b',
    fontSize: 13,
  },
  campChipTextActive: {
    color: '#69f6b8',
    fontWeight: 'bold',
  },
  scanToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  scanToggleText: {
    color: '#69f6b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  previewWrap: {
    marginTop: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  categoryChipText: {
    color: '#64748b',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#69f6b8',
    borderRadius: 18,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: '#002919',
    fontSize: 16,
    fontWeight: '900',
  },
});
