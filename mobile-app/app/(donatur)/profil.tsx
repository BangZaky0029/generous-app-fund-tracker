import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Image,
  Modal, Dimensions, Alert
} from 'react-native';
import {
  ShieldCheck, LogOut, ChevronRight, Heart,
  Award, Calendar, Receipt, TrendingUp, Camera,
  Edit2, Save, X, Target, Info
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors } from '@/constants/theme';
import { uploadToStorage } from '@/lib/upload';
import { fetchActiveCampaigns } from '@/services/campaignService';
import { Campaign } from '@/constants/types';

const { width, height } = Dimensions.get('window');

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProfilDonatur() {
  const { user, signOut, updateProfile } = useAuthContext();
  const { showAlert } = useFundTrackerContext();

  const [userStats, setUserStats] = useState({
    totalDonated: 0,
    count: 0,
    joinedDate: '...',
  });
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickDonationVisible, setIsQuickDonationVisible] = useState(false);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user?.profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUserStats();
    loadActiveCampaigns();
  }, [user]);

  const loadActiveCampaigns = async () => {
    try {
      const data = await fetchActiveCampaigns();
      setActiveCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // 1. Hitung total donasi confirmed user ini berdasarkan donator_id
      const { data: donations, error } = await supabase
        .from('donations')
        .select('amount, created_at, campaign_id')
        .eq('donator_id', user.id)
        .eq('status', 'confirmed');

      if (!error && donations) {
        const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);

        // Hitung UNIQ campaign_id untuk statistik "KAMPANYE"
        const uniqueCampaigns = new Set(donations.map(d => d.campaign_id).filter(Boolean)).size;

        // Ambil join date (dari data profil atau donasi pertama)
        const joined = user.profile?.updated_at
          ? new Date(user.profile.updated_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
          : 'Jan 2024';

        setUserStats({
          totalDonated: total,
          count: uniqueCampaigns,
          joinedDate: joined
        });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUpdating(true);
      try {
        const uploadedUrl = await uploadToStorage(result.assets[0].uri, 'avatars', 'profiles');
        if (uploadedUrl) {
          await updateProfile(tempName, uploadedUrl);
          showAlert('Sukses', 'Foto profil berhasil diperbarui.', 'success');
        }
      } catch (err) {
        showAlert('Gagal', 'Terjadi kesalahan saat mengunggah foto.', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile(tempName);
      setIsEditing(false);
      showAlert('Berhasil', 'Nama profil diperbarui.', 'success');
    } catch (err) {
      showAlert('Gagal', 'Gagal memperbarui nama.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin mengakhiri sesi kontribusi Anda?',
      'warning',
      signOut
    );
  };

  const getTier = (amount: number) => {
    if (amount >= 5000000) return { name: 'Platinum Contributor', color: '#e5e7eb' };
    if (amount >= 1000000) return { name: 'Gold Contributor', color: '#facc15' };
    if (amount >= 500000) return { name: 'Silver Contributor', color: '#94a3b8' };
    return { name: 'Bronze Contributor', color: '#b45309' };
  };

  const tier = getTier(userStats.totalDonated);
  const fullName = user?.profile?.full_name || 'Donatur Generous';
  const initial = fullName.substring(0, 1).toUpperCase();

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#69f6b8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.profileCard}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={isUpdating}>
              <View style={styles.avatar}>
                {user?.profile?.avatar_url ? (
                  <Image source={{ uri: user.profile.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{initial}</Text>
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#fff" />
              </View>
              {isUpdating && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator size="small" color="#69f6b8" />
                </View>
              )}
            </TouchableOpacity>

            {isEditing ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#475569"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.saveBtn}>
                  <Save size={18} color="#69f6b8" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayRow}>
                <Text style={styles.userName}>{fullName}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit2 size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.tierBadge, { borderColor: tier.color + '40' }]}>
              <Award size={14} color={tier.color} />
              <Text style={[styles.tierText, { color: tier.color }]}>{tier.name}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard variant="elevated" style={styles.statBoxLarge}>
            <View>
              <Text style={styles.statLabel}>TOTAL DONASi YANG DISALURKAN</Text>
              <Text style={styles.statValue}>{formatRp(userStats.totalDonated)}</Text>
            </View>
            <TrendingUp size={24} color="#69f6b8" />
          </GlassCard>

          <View style={styles.statBoxRow}>
            <GlassCard style={[styles.statBoxSmall, { flex: 1 }]}>
              <Text style={styles.statLabel}>KAMPANYE</Text>
              <Text style={styles.statValueSmall}>{userStats.count} Wadah</Text>
              <Heart size={16} color="#69f6b8" style={styles.statIndicator} />
            </GlassCard>
            <GlassCard style={[styles.statBoxSmall, { flex: 1 }]}>
              <Text style={styles.statLabel}>BERGABUNG</Text>
              <Text style={styles.statValueSmall}>{userStats.joinedDate}</Text>
              <Calendar size={16} color="#64748b" style={styles.statIndicator} />
            </GlassCard>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsQuickDonationVisible(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <Heart size={20} color="#69f6b8" fill="#69f6b8" />
              </View>
              <View>
                <Text style={styles.menuTextMain}>Donasi Cepat</Text>
                <Text style={styles.menuTextSub}>Pilih kampanye aktif & bantu sesama</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(donatur)/laporan')}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <Receipt size={20} color="#64748b" />
              </View>
              <Text style={styles.menuTextMain}>Riwayat Donasi Saya</Text>
            </View>
            <ChevronRight size={20} color="#334155" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 12 }]} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <LogOut size={20} color="#ef4444" />
              </View>
              <Text style={[styles.menuTextMain, { color: '#ef4444' }]}>Keluar Akun</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generous App v2.0.4 Premium</Text>
          <Text style={styles.footerSub}>Connected to Real-time Ledger System</Text>
        </View>
      </ScrollView>

      {/* QUICK DONATION MODAL */}
      <Modal
        visible={isQuickDonationVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQuickDonationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            onPress={() => setIsQuickDonationVisible(false)}
          />
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Heart size={24} color="#69f6b8" fill="#69f6b8" />
              <Text style={styles.modalTitle}>Mau Bantu Siapa?</Text>
              <TouchableOpacity onPress={() => setIsQuickDonationVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.campaignList} showsVerticalScrollIndicator={false}>
              {activeCampaigns.map(camp => (
                <TouchableOpacity
                  key={camp.id}
                  style={styles.campItem}
                  onPress={() => {
                    setIsQuickDonationVisible(false);
                    router.push({
                      pathname: '/(donatur)/donation-form',
                      params: { campaignId: camp.id, campaignTitle: camp.title }
                    });
                  }}
                >
                  <Image source={{ uri: camp.poster_url || '' }} style={styles.campItemImg} />
                  <View style={styles.campItemInfo}>
                    <Text style={styles.campItemTitle} numberOfLines={1}>{camp.title}</Text>
                    <View style={styles.campItemSub}>
                      <Target size={10} color="#64748b" />
                      <Text style={styles.campItemCategory}>{camp.category}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#334155" />
                </TouchableOpacity>
              ))}
              {activeCampaigns.length === 0 && (
                <View style={styles.emptyCampaign}>
                  <Info size={40} color="#1e293b" />
                  <Text style={styles.emptyCampaignText}>Tidak ada kampanye aktif saat ini.</Text>
                </View>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060e20' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 32 },
  profileCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(105, 246, 184, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#69f6b8',
    overflow: 'hidden'
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText: { color: '#69f6b8', fontSize: 40, fontWeight: '900' },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#69f6b8',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0f172a',
    zIndex: 10,
  },
  nameDisplayRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  editNameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  nameInput: { color: '#fff', fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#69f6b8', paddingBottom: 4, textAlign: 'center', minWidth: 200 },
  saveBtn: { backgroundColor: 'rgba(105, 246, 184, 0.1)', padding: 8, borderRadius: 10 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tierText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  statsGrid: { gap: 12, marginBottom: 40 },
  statBoxLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(105, 246, 184, 0.05)'
  },
  statBoxRow: { flexDirection: 'row', gap: 12 },
  statBoxSmall: { padding: 20, position: 'relative' },
  statLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  statValue: { color: '#69f6b8', fontSize: 28, fontWeight: '900' },
  statValueSmall: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statIndicator: { position: 'absolute', right: 16, top: 16, opacity: 0.3 },
  menuContainer: { gap: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 12, marginLeft: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuTextMain: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  menuTextSub: { color: '#475569', fontSize: 11, marginTop: 2 },
  footer: { marginTop: 40, alignItems: 'center', gap: 6 },
  footerText: { color: '#1e293b', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  footerSub: { color: '#0f172a', fontSize: 10, fontWeight: '800' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1, marginLeft: 12 },
  campaignList: { gap: 12 },
  campItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  campItemImg: { width: 60, height: 60, borderRadius: 14, resizeMode: 'cover' },
  campItemInfo: { flex: 1, gap: 4 },
  campItemTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  campItemSub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  campItemCategory: { color: '#64748b', fontSize: 11, fontWeight: 'bold' },
  emptyCampaign: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyCampaignText: { color: '#475569', fontSize: 14, textAlign: 'center' }
});
