import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2, Heart, User, MessageCircle, Wallet } from 'lucide-react-native';

import { createDonation } from '@/services/donationService';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppRadius, AppSpacing } from '@/constants/theme';

export default function DonationFormScreen() {
  const { user } = useAuthContext();
  const { refetch, showAlert } = useFundTrackerContext();
  const { campaignId, campaignTitle } = useLocalSearchParams();

  const [donatorName, setDonatorName] = useState(user?.profile?.full_name || '');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
          showAlert('Izin Ditolak', 'Izin kamera diperlukan untuk upload bukti.', 'error');
          return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      setProofUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!amount || (parseFloat(amount) || 0) <= 0) {
      showAlert('Data Tidak Valid', 'Nominal donasi harus diisi.', 'warning');
      return;
    }
    if (!proofUri) {
      showAlert('Bukti Diperlukan', 'Mohon upload bukti transfer agar admin dapat memverifikasi donasi Anda.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonation({
        donator_name: isAnonymous ? 'Hamba Allah' : (donatorName.trim() || 'Kontributor'),
        amount: amount,
        message: message.trim() || 'Bismillah, semoga berkah.',
        campaign_id: campaignId as string,
        receiptLocalUri: proofUri,
        status: 'pending' // Default status for donatur-initiated donations
      });

      await refetch();

      showAlert(
        '✅ Donasi Terkirim!',
        'Terima kasih! Donasi Anda sedang diproses oleh admin untuk verifikasi.',
        'success',
        () => router.replace('/(donatur)/dashboard')
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim donasi';
      showAlert('Gagal', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PRESET_AMOUNTS = ['10000', '25000', '50000', '100000', '200000', '500000'];

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
                <Text style={styles.title}>Kirim Donasi</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{campaignTitle || 'Wadah Donasi'}</Text>
            </View>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
        >
          {/* ===== NOMINAL SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
               <Wallet size={18} color={AppColors.accent.emerald} />
               <Text style={styles.sectionTitle}>Nominal Donasi</Text>
            </View>
            
            <View style={styles.amountInputRow}>
               <Text style={styles.rpLabel}>Rp</Text>
               <TextInput
                 value={amount}
                 onChangeText={setAmount}
                 placeholder="0"
                 placeholderTextColor="#475569"
                 keyboardType="numeric"
                 style={styles.amountInput}
               />
            </View>

            <View style={styles.presetRow}>
               {PRESET_AMOUNTS.map(amt => (
                 <TouchableOpacity 
                    key={amt} 
                    style={[styles.presetBtn, amount === amt && styles.presetBtnActive]}
                    onPress={() => setAmount(amt)}
                 >
                    <Text style={[styles.presetText, amount === amt && styles.presetTextActive]}>
                       {parseInt(amt) / 1000}k
                    </Text>
                 </TouchableOpacity>
               ))}
            </View>
          </GlassCard>

          {/* ===== IDENTITY SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Nama Donatur</Text>
              </View>
              <TextInput
                value={donatorName}
                onChangeText={setDonatorName}
                placeholder="cth: Budi Setiawan"
                placeholderTextColor="#475569"
                editable={!isAnonymous}
                style={[styles.input, isAnonymous && styles.inputDisabled]}
              />
              <TouchableOpacity 
                style={styles.anonRow}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                 <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                    {isAnonymous && <Heart size={10} color="#002919" fill="#002919" />}
                 </View>
                 <Text style={styles.anonLabel}>Sembunyikan nama saya (Hamba Allah)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MessageCircle size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Doa / Dukungan</Text>
              </View>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Tuliskan doa atau pesan dukungan Anda..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
              />
            </View>
          </GlassCard>

          {/* ===== PROOF SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={16} color={AppColors.accent.electric} />
              <Text style={styles.sectionTitle}>Upload Bukti Transfer</Text>
            </View>
            
            <Text style={styles.infoText}>
               Silahkan transfer ke rekening **BCA 123456789 a.n Yayasan Generous** kemudian upload buktinya di sini.
            </Text>

            {proofUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: proofUri }} style={styles.previewImage} />
                <TouchableOpacity 
                   style={styles.removeImageBtn} 
                   onPress={() => setProofUri(null)}
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
                  <Text style={styles.uploadBtnText}>Camera</Text>
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

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#002919" />
            ) : (
              <View style={styles.btnContent}>
                 <Heart size={20} color="#002919" fill="#002919" />
                 <Text style={styles.submitText}>Kirim Donasi Sekarang</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  scroll: { padding: 24, gap: 16 },
  section: { padding: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, paddingHorizontal: 20, height: 70, borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)', marginTop: 8 },
  rpLabel: { color: '#69f6b8', fontSize: 20, fontWeight: '900', marginRight: 12 },
  amountInput: { flex: 1, color: '#fff', fontSize: 24, fontWeight: 'bold' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  presetBtnActive: { backgroundColor: 'rgba(105, 246, 184, 0.1)', borderColor: '#69f6b8' },
  presetText: { color: '#64748b', fontSize: 13, fontWeight: 'bold' },
  presetTextActive: { color: '#69f6b8' },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inputLabel: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  input: { backgroundColor: '#060e20', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15 },
  inputDisabled: { opacity: 0.5 },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#69f6b8', borderColor: '#69f6b8' },
  anonLabel: { color: '#94a3b8', fontSize: 13 },
  infoText: { color: '#64748b', fontSize: 12, lineHeight: 18, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, fontStyle: 'italic' },
  submitBtn: { backgroundColor: '#69f6b8', borderRadius: 20, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.6 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  submitText: { color: '#002919', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { position: 'relative', marginTop: 8, borderRadius: 16, overflow: 'hidden', height: 200 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  uploadButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', borderRadius: 16, paddingVertical: 14 },
  uploadBtnText: { color: '#38bdf8', fontSize: 13, fontWeight: 'bold' },
});
