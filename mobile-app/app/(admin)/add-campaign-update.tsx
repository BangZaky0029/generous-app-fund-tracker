import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2, Type, FileText, Newspaper } from 'lucide-react-native';

import { addCampaignUpdate } from '@/services/campaignService';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppSpacing } from '@/constants/theme';

export default function AddCampaignUpdateScreen() {
  const { isAdmin } = useAuthContext();
  const { refetch, showAlert } = useFundTrackerContext();
  const { campaignId, campaignTitle } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
          showAlert('Izin Ditolak', 'Izin kamera diperlukan.', 'error');
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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      showAlert('Akses Ditolak', 'Hanya Admin yang dapat memposting update.', 'error');
      return;
    }
    if (!title || !content || !campaignId) {
      showAlert('Data Belum Lengkap', 'Mohon isi judul dan konten update.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCampaignUpdate({
        campaign_id: campaignId as string,
        title: title.trim(),
        content: content.trim(),
        imageLocalUri: imageUri,
      });

      await refetch();

      showAlert(
        '✅ Update Terposting!',
        'Berita terbaru berhasil ditambahkan ke wadah donasi.',
        'success',
        () => router.back()
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memposting update';
      showAlert('Gagal', msg, 'error');
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
                <Text style={styles.title} numberOfLines={1}>Update Berita</Text>
                <Text style={styles.subtitle}>{campaignTitle || 'Wadah Donasi'}</Text>
            </View>
        </View>

        <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
        >
          {/* ===== INTRO ===== */}
          <GlassCard variant="elevated" style={styles.section}>
             <View style={styles.sectionHeader}>
               <Newspaper size={20} color={AppColors.accent.electric} />
               <Text style={styles.sectionTitle}>Kabar Terbaru</Text>
             </View>
             <Text style={styles.sectionSubtitle}>
               Bagikan progres penyaluran dana atau kondisi terbaru di lokasi untuk menjaga transparansi kepada donatur.
             </Text>
          </GlassCard>

          {/* ===== IMAGE SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Camera size={16} color={AppColors.accent.emerald} />
              <Text style={styles.sectionTitle}>Foto Dokumentasi (Pilihan)</Text>
            </View>
            
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity 
                   style={styles.removeImageBtn} 
                   onPress={() => setImageUri(null)}
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
                  <Camera size={20} color={AppColors.accent.emerald} />
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

          {/* ===== FORM SECTION ===== */}
          <GlassCard variant="elevated" style={styles.section}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Type size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Judul Update / Berita</Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="cth: Penyaluran Sembako Tahap 1"
                placeholderTextColor="#475569"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={14} color="#64748b" />
                <Text style={styles.inputLabel}>Isi Berita</Text>
              </View>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Ceritakan detail perkembangan di sini..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={8}
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
              <Text style={styles.submitText}>Posting Update Sekarang</Text>
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
  backBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  scroll: { padding: 24, gap: 16 },
  section: { padding: 20, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  sectionSubtitle: { color: '#64748b', fontSize: 13, lineHeight: 20 },
  inputGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inputLabel: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  input: { backgroundColor: '#060e20', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15 },
  multilineInput: { height: 180, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#69f6b8', borderRadius: 18, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#002919', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { position: 'relative', marginTop: 8, borderRadius: 16, overflow: 'hidden', height: 200 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  uploadButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.3)', borderRadius: 16, paddingVertical: 14 },
  uploadBtnText: { color: AppColors.accent.emerald, fontSize: 13, fontWeight: 'bold' },
});
