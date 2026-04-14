/**
 * Add Donation Screen (Internal to Tabs)
 * Form tambah dana masuk (Donasi)
 */
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { X, ArrowDownCircle, ArrowLeft, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';

import { createDonation } from '@/services/donationService';
import { useAuthContext } from '@/context/FundTrackerContext';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export default function AddDonationScreen() {
  const { user, isAdmin } = useAuthContext();
  const fundData = useFundTrackerContext();
  const params = useLocalSearchParams();
  const [donatorName, setDonatorName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
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
        setDonatorName('');
        setAmount('');
        setMessage('');
        setCapturedUri(null);
        processedUriRef.current = null;
      }
    }, [params.capturedUri])
  );

  // Tangkap data dari params (termasuk Campaign Context)
  useEffect(() => {
    const newUri = params.capturedUri as string | undefined;
    if (newUri && newUri !== processedUriRef.current) {
      setCapturedUri(newUri);
      processedUriRef.current = newUri;
    }
    
    if (params.campaignId) {
      setCampaignId(params.campaignId as string);
    }
    if (params.campaignTitle) {
      setCampaignTitle(params.campaignTitle as string);
    }
  }, [params.capturedUri, params.campaignId, params.campaignTitle]);

  const handlePickImage = async (useCamera: boolean) => {
    if (useCamera) {
      // Navigasi ke Kamera Kustom kita
      router.push({
        pathname: '/(admin)/validasi-kamera',
        params: { 
          mode: 'photo', 
          returnTo: '/(admin)/add-donation' 
        }
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setCapturedUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      fundData.showAlert('Akses Ditolak', 'Hanya Admin yang dapat mencatat dana masuk.', 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      fundData.showAlert('Data Tidak Valid', 'Nominal dana masuk harus diisi dan lebih dari 0.', 'warning');
      return;
    }

    if (!campaignId) {
      fundData.showAlert('Data Kurang', 'Silahkan pilih wadah donasi terlebih dahulu.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonation({
        donator_name: donatorName.trim() || 'Hamba Allah',
        amount: amount,
        message: message.trim() || '-',
        campaign_id: campaignId,
        receiptLocalUri: capturedUri,
      });

      await fundData.refetch();

      fundData.showAlert(
        '✅ Berhasil!',
        'Dana masuk berhasil dicatat. Bukti transaksi telah aman di server.',
        'success',
        () => router.back()
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal simpan';
      fundData.showAlert('Gagal', msg, 'error');
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
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
                <Text style={styles.title}>Catat Dana Masuk</Text>
                <Text style={styles.subtitle}>Sinkronisasi Ledger Kas</Text>
            </View>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
        >

          {/* ===== INFO SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <ArrowDownCircle size={20} color={AppColors.accent.emerald} />
              <Text style={styles.sectionTitle}>Penerimaan Dana</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Gunakan formulir ini untuk mencatat uang kas, sumbangan, atau donasi yang masuk agar saldo sistem bertambah secara realtime.
            </Text>
            
            {campaignTitle && (
              <View style={styles.contextBadge}>
                <Text style={styles.contextLabel}>WADAH:</Text>
                <Text style={styles.contextValue}>{campaignTitle}</Text>
              </View>
            )}
          </GlassCard>

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

          {/* ===== PROOF SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={16} color={AppColors.accent.electric} />
              <Text style={styles.sectionTitle}>Bukti Transaksi (Pilihan)</Text>
            </View>
            
            {capturedUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: capturedUri }} style={styles.previewImage} />
                <TouchableOpacity 
                   style={styles.removeImageBtn} 
                   onPress={() => setCapturedUri(null)}
                >
                  <Trash2 size={20} color={AppColors.accent.red} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtonsRow}>
                <TouchableOpacity 
                  style={styles.uploadBtn} 
                  onPress={() => handlePickImage(true)}
                >
                  <Camera size={20} color={AppColors.accent.electric} />
                  <Text style={styles.uploadBtnText}>Ambil Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.uploadBtn, { borderColor: 'rgba(56, 189, 248, 0.3)' }]} 
                  onPress={() => handlePickImage(false)}
                >
                  <ImageIcon size={20} color={AppColors.accent.blue} />
                  <Text style={[styles.uploadBtnText, { color: AppColors.accent.blue }]}>Galeri</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>

          {/* ===== FORM SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Penyetor / Donatur</Text>
              <TextInput
                value={donatorName}
                onChangeText={setDonatorName}
                placeholder="cth: Hamba Allah / Budi"
                placeholderTextColor="#475569"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal Masuk (Rp)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Keterangan / Pesan</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Masukkan catatan jika ada..."
                placeholderTextColor="#475569"
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
              <ActivityIndicator size="small" color="#002919" />
            ) : (
              <Text style={styles.submitText}>Konfirmasi Dana Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 140 }} />
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
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: AppColors.accent.emerald,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  sectionSubtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
  },
  contextBadge: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  contextLabel: {
    color: AppColors.accent.emerald,
    fontSize: 10,
    fontWeight: '900',
  },
  contextValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
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
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#060e20',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#69f6b8',
    borderRadius: 18,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#69f6b8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: {
    color: '#002919',
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
  previewContainer: {
    position: 'relative',
    marginTop: AppSpacing.sm,
    borderRadius: AppRadius.lg,
    overflow: 'hidden',
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: AppSpacing.md,
    marginTop: AppSpacing.sm,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.3)',
    borderRadius: AppRadius.lg,
    paddingVertical: 14,
  },
  uploadBtnText: {
    color: AppColors.accent.emerald,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
