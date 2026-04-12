import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  ActivityIndicator, TextInput, Modal, StyleSheet
} from 'react-native';
import { 
  User, Mail, Shield, LogOut, Settings, 
  ChevronRight, Edit2, Check, X, Award,
  Database, RefreshCw, BarChart3, Star
} from 'lucide-react-native';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminProfil() {
  const { user, signOut, updateProfile, showAlert } = useAuthContext();
  const { recentExpenses } = useFundTrackerContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullName = user?.profile?.full_name || 'Administrator';
  const email = user?.email || 'admin@fundtracker.com';
  const initial = fullName.substring(0, 1).toUpperCase();

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showAlert('Error', 'Nama harus diisi lengkap, bro.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateProfile(newName);
      setIsEditing(false);
      showAlert('Sukses', 'Profil digital Anda telah diperbarui.', 'success');
    } catch (err) {
      showAlert('Error', 'Gagal memperbarui profil di server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Keluar Sistem',
      'Apakah Anda yakin ingin memutus sesi agen digital Anda?',
      'warning',
      signOut
    );
  };

  const showUnderConstruction = () => {
    showAlert('Coming Soon', 'Modul pengaturan lanjutan sedang dikalibrasi oleh agen AI.', 'info');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account Shield</Text>
          <View style={styles.roleBadge}>
            <Shield size={10} color={AppColors.accent.emerald} />
            <Text style={styles.roleText}>Verified Administrator</Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.heroCard}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#69f6b8', '#00c37b']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </LinearGradient>
              <TouchableOpacity 
                style={styles.editAvatarBtn}
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={12} color="#002919" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <View style={styles.emailRow}>
                <Mail size={12} color="#64748b" />
                <Text style={styles.profileEmail}>{email}</Text>
              </View>
              
              <View style={styles.statusBadge}>
                <Star size={10} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.statusText}>PRO ACCESS</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Admin Stats Dashboard */}
        <Text style={styles.sectionLabel}>System Insights</Text>
        <View style={styles.statsRow}>
          <GlassCard style={styles.statItem}>
            <BarChart3 size={20} color={AppColors.accent.electric} />
            <Text style={styles.statValue}>{recentExpenses.length}</Text>
            <Text style={styles.statLabel}>Total Assets</Text>
          </GlassCard>
          <GlassCard style={styles.statItem}>
            <Database size={20} color={AppColors.accent.blue} />
            <Text style={styles.statValue}>v3.0</Text>
            <Text style={styles.statLabel}>Agent Core</Text>
          </GlassCard>
        </View>

        {/* Settings List */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <GlassCard style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={showUnderConstruction}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Shield size={18} color={AppColors.accent.blue} />
              </View>
              <Text style={styles.settingText}>Security Protocol</Text>
            </View>
            <ChevronRight size={18} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={showUnderConstruction}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(105, 246, 184, 0.1)' }]}>
                <Settings size={18} color={AppColors.accent.emerald} />
              </View>
              <Text style={styles.settingText}>System Configuration</Text>
            </View>
            <ChevronRight size={18} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <LogOut size={18} color={AppColors.accent.red} />
              </View>
              <Text style={[styles.settingText, { color: AppColors.accent.red }]}>Disconnect Session</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* Footer Info */}
        <View style={styles.footer}>
          <RefreshCw size={12} color="#475569" />
          <Text style={styles.footerText}>Node-Edge Realtime Active</Text>
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
          <GlassCard style={styles.editModal}>
            <Text style={styles.modalTitle}>Update Identity</Text>
            <Text style={styles.modalSubtitle}>Ubah nama profil lengkap Anda yang akan tercatat di sistem ledger.</Text>
            
            <View style={styles.inputWrap}>
              <User size={18} color="#64748b" />
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nama Lengkap"
                placeholderTextColor="#475569"
                autoFocus
                selectionColor={AppColors.accent.emerald}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleUpdateName}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#002919" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Update</Text>
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
    backgroundColor: '#060e20',
  },
  scroll: {
    padding: AppSpacing.base,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  roleText: {
    color: AppColors.accent.emerald,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  heroCard: {
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarText: {
    color: '#002919',
    fontSize: 40,
    fontWeight: '900',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  profileEmail: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  statusText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionLabel: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderRadius: 24,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settingsGroup: {
    padding: 0,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.5,
  },
  footerText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 14, 32, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  editModal: {
    padding: 24,
    borderRadius: 32,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: AppColors.accent.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#002919',
    fontSize: 14,
    fontWeight: '900',
  },
});
