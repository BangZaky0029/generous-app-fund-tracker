import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, TextInput, Modal, StyleSheet
} from 'react-native';
import { 
  User, Mail, Shield, LogOut, Settings, 
  ChevronRight, Edit2, Check, X, Award,
  Database, RefreshCw, BarChart3
} from 'lucide-react-native';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminProfil() {
  const { user, signOut, updateProfile } = useAuthContext();
  const { totalExpenses, totalDonations, recentExpenses } = useFundTrackerContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = user?.profile?.full_name || 'Administrator';
  const email = user?.email || 'admin@fundtracker.com';
  const initial = fullName.substring(0, 1).toUpperCase();

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateProfile(newName);
      setIsEditing(false);
      Alert.alert('Sukses', 'Profil berhasil diperbarui');
    } catch (err) {
      Alert.alert('Error', 'Gagal memperbarui profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar Aplikasi',
      'Apakah Anda yakin ingin keluar dari sistem?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manajemen Profil</Text>
          <Text style={styles.headerSubtitle}>Role: Admin Utama</Text>
        </View>

        {/* Hero Card */}
        <GlassCard variant="elevated" style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(105, 246, 184, 0.1)', 'rgba(99, 102, 241, 0.05)']}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[AppColors.accent.emerald, '#00c37b']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
            <TouchableOpacity 
              style={styles.editAvatarBtn}
              onPress={() => setIsEditing(true)}
            >
              <Edit2 size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{fullName}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Edit2 size={16} color={AppColors.accent.electric} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
            <View style={styles.emailRow}>
              <Mail size={14} color={AppColors.text.tertiary} />
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
            
            <View style={styles.badge}>
              <Award size={12} color={AppColors.accent.emerald} />
              <Text style={styles.badgeText}>Verified Admin</Text>
            </View>
          </View>
        </GlassCard>

        {/* Admin Stats Dashboard */}
        <Text style={styles.sectionLabel}>Ringkasan Aktivitas</Text>
        <View style={styles.statsRow}>
          <GlassCard style={styles.statItem}>
            <BarChart3 size={20} color={AppColors.accent.electric} />
            <Text style={styles.statValue}>{recentExpenses.length}</Text>
            <Text style={styles.statLabel}>Bukti Discan</Text>
          </GlassCard>
          <GlassCard style={styles.statItem}>
            <Database size={20} color={AppColors.accent.blue} />
            <Text style={styles.statValue}>v2.4</Text>
            <Text style={styles.statLabel}>Versi Sistem</Text>
          </GlassCard>
        </View>

        {/* Settings List */}
        <Text style={styles.sectionLabel}>Pengaturan & Keamanan</Text>
        <GlassCard variant="elevated" style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Shield size={20} color={AppColors.accent.blue} />
              </View>
              <Text style={styles.settingText}>Keamanan Akun</Text>
            </View>
            <ChevronRight size={18} color={AppColors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(105, 246, 184, 0.1)' }]}>
                <Settings size={20} color={AppColors.accent.emerald} />
              </View>
              <Text style={styles.settingText}>Pengaturan Aplikasi</Text>
            </View>
            <ChevronRight size={18} color={AppColors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <LogOut size={20} color={AppColors.accent.red} />
              </View>
              <Text style={[styles.settingText, { color: AppColors.accent.red }]}>Keluar Aplikasi</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* Footer Info */}
        <View style={styles.footer}>
          <RefreshCw size={12} color={AppColors.text.tertiary} />
          <Text style={styles.footerText}>Terhubung ke Supabase Realtime Engine</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard variant="elevated" style={styles.editModal}>
            <Text style={styles.modalTitle}>Ubah Nama Profil</Text>
            <Text style={styles.modalSubtitle}>Nama ini akan terlihat pada setiap riwayat transaksi yang Anda tangani.</Text>
            
            <View style={styles.inputWrap}>
              <User size={18} color={AppColors.text.tertiary} />
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Masukkan Nama Lengkap"
                placeholderTextColor={AppColors.text.tertiary}
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <X size={18} color={AppColors.text.secondary} />
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleUpdateName}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Check size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Simpan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  scroll: {
    padding: AppSpacing.base,
  },
  header: {
    marginBottom: AppSpacing.xl,
    marginTop: AppSpacing.md,
  },
  headerTitle: {
    color: AppColors.text.primary,
    fontSize: 28,
    fontWeight: AppFonts.weights.bold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: AppColors.accent.emerald,
    fontSize: 14,
    fontWeight: AppFonts.weights.medium,
    marginTop: 4,
  },
  heroCard: {
    padding: AppSpacing.xl,
    alignItems: 'center',
    marginBottom: AppSpacing.xl,
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: AppSpacing.md,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(25, 37, 64, 0.8)',
    ...AppShadows.emerald,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: AppFonts.weights.bold,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: AppColors.accent.electric,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.bg.secondary,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    color: AppColors.text.primary,
    fontSize: 22,
    fontWeight: AppFonts.weights.bold,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  profileEmail: {
    color: AppColors.text.tertiary,
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  badgeText: {
    color: AppColors.accent.emerald,
    fontSize: 12,
    fontWeight: AppFonts.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    color: AppColors.text.tertiary,
    fontSize: 12,
    fontWeight: AppFonts.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: AppSpacing.md,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: AppSpacing.md,
    marginBottom: AppSpacing.xl,
  },
  statItem: {
    flex: 1,
    padding: AppSpacing.md,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: AppColors.text.primary,
    fontSize: 20,
    fontWeight: AppFonts.weights.bold,
  },
  statLabel: {
    color: AppColors.text.tertiary,
    fontSize: 11,
    fontWeight: AppFonts.weights.medium,
  },
  settingsGroup: {
    padding: 0,
    marginBottom: AppSpacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: AppSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.glass.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    color: AppColors.text.primary,
    fontSize: 15,
    fontWeight: AppFonts.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: AppSpacing.md,
    opacity: 0.5,
  },
  footerText: {
    color: AppColors.text.tertiary,
    fontSize: 10,
    fontWeight: AppFonts.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 14, 32, 0.85)',
    justifyContent: 'center',
    padding: AppSpacing.xl,
  },
  editModal: {
    padding: AppSpacing.xl,
  },
  modalTitle: {
    color: AppColors.text.primary,
    fontSize: 20,
    fontWeight: AppFonts.weights.bold,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: AppColors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bg.primary,
    borderRadius: AppRadius.lg,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    color: AppColors.text.primary,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: AppRadius.lg,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
  },
  cancelBtnText: {
    color: AppColors.text.secondary,
    fontSize: 15,
    fontWeight: AppFonts.weights.bold,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: AppRadius.lg,
    backgroundColor: AppColors.accent.emerald,
    ...AppShadows.emerald,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: AppFonts.weights.bold,
  },
});
