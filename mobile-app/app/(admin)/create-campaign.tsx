import { router } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2, Layout, Info, Target, FileText } from 'lucide-react-native';

import { createCampaign } from '@/services/campaignService';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';

export default function CreateCampaignScreen() {
  const { user, isAdmin } = useAuthContext();
  const { refetch, showAlert } = useFundTrackerContext();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
          showAlert('Izin Ditolak', 'Kami butuh izin kamera untuk mengambil foto poster.', 'error');
          return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      setPosterUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      showAlert('Akses Ditolak', 'Hanya Admin yang dapat membuat wadah donasi.', 'error');
      return;
    }
    if (!title || !category || !targetAmount || !description) {
      showAlert('Data Belum Lengkap', 'Mohon isi semua data yang wajib.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        target_amount: parseFloat(targetAmount),
        admin_id: user?.id || '',
        posterLocalUri: posterUri,
      });

      await refetch();

      showAlert(
        '✅ Berhasil!',
        'Wadah donasi baru berhasil dibuat.',
        'success',
        () => router.replace('/(admin)/(tabs)/dashboard')
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      showAlert('Gagal Simpan', msg, 'error');
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
                <Text style={styles.title}>Buat Wadah Donasi</Text>
                <Text style={styles.subtitle}>Edisi Donasi Terbuka</Text>
            </View>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
        >

          {/* ===== POSTER SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={16} color={AppColors.accent.electric} />
              <Text style={styles.sectionTitle}>Poster / Foto Utama</Text>
            </View>
            
            {posterUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: posterUri }} style={styles.previewImage} />
                <TouchableOpacity 
                   style={styles.removeImageBtn} 
                   onPress={() => setPosterUri(null)}
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
              <View style={styles.labelRow}>
                <Layout size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Judul Campaign</Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="cth: Donasi Peduli Gempa Cianjur"
                placeholderTextColor="#475569"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Info size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Kategori</Text>
              </View>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="cth: Bencana Alam / Pendidikan"
                placeholderTextColor="#475569"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Target size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Target Dana (Rp)</Text>
              </View>
              <TextInput
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Narasi / Berita Utama</Text>
              </View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tuliskan berita atau cerita lengkap di sini..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={6}
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
              <Text style={styles.submitText}>Publikasikan Wadah Donasi</Text>
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
  backBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  headerInfo: { flex: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: AppColors.accent.emerald, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  scroll: { padding: 24, gap: 16 },
  section: { padding: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', flex: 1 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inputLabel: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  input: { backgroundColor: '#060e20', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15 },
  multilineInput: { height: 150, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#69f6b8', borderRadius: 18, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#002919', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { position: 'relative', marginTop: 8, borderRadius: 16, overflow: 'hidden', height: 180, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  uploadButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.3)', borderRadius: 16, paddingVertical: 14 },
  uploadBtnText: { color: AppColors.accent.emerald, fontSize: 13, fontWeight: 'bold' },
});
