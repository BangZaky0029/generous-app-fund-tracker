import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Linking
} from 'react-native';
import {
  ArrowLeft, Heart, Share2, Calendar,
  User, TrendingUp, Info, Newspaper
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { getCampaign, fetchCampaignUpdates } from '@/services/campaignService';
import { fetchRecentDonations } from '@/services/donationService';
import { fetchRecentExpenses } from '@/services/expenseService';
import { Campaign, CampaignUpdate, Donation, Expense } from '@/constants/types';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';

const { width } = Dimensions.get('window');

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams();
  const { showAlert } = useFundTrackerContext();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const campaignId = Array.isArray(id) ? id[0] : id;
    if (!campaignId) return;
    setIsLoading(true);
    try {
      const data = await getCampaign(campaignId);
      setCampaign(data);

      const [updateData, recentDonations, recentExpenses] = await Promise.all([
        fetchCampaignUpdates(campaignId),
        fetchRecentDonations(15, campaignId),
        fetchRecentExpenses(15, campaignId),
      ]);

      setUpdates(updateData);

      // Gabungkan transaksi dan hilangkan nama donatur untuk donatur view
      const combined = [
        ...recentDonations.map(d => ({ ...d, type: 'income', display_name: 'Donatur Generous' })),
        ...recentExpenses.map(e => ({ ...e, type: 'expense', display_name: e.category }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(combined);
    } catch (err) {
      showAlert('Error', 'Gagal memuat detail campaign.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#69f6b8" />
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.centerContent}>
        <Text style={{ color: '#fff' }}>Campaign tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#69f6b8', marginTop: 12 }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: campaign.poster_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(6, 14, 32, 0.8)', 'transparent', 'rgba(6, 14, 32, 1)']}
            style={styles.heroOverlay}
          />

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={() => showAlert('Info', 'Fitur bagi-bagi segera hadir!', 'info')}>
            <Share2 size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.mainContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{campaign.category}</Text>
          </View>

          <Text style={styles.title}>{campaign.title}</Text>

          <GlassCard variant="elevated" style={styles.statsCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.amountText}>{formatRp(campaign.current_amount)}</Text>
              <Text style={styles.targetText}>terkumpul dari {formatRp(campaign.target_amount)}</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <TrendingUp size={16} color="#69f6b8" />
                <Text style={styles.statVal}>{Math.round(progress)}%</Text>
                <Text style={styles.statLbl}>Progres</Text>
              </View>
              <View style={styles.statItem}>
                <User size={16} color="#69f6b8" />
                <Text style={styles.statVal}>-</Text>
                <Text style={styles.statLbl}>Donatur</Text>
              </View>
              <View style={styles.statItem}>
                <Calendar size={16} color="#69f6b8" />
                <Text style={styles.statVal}>Aktif</Text>
                <Text style={styles.statLbl}>Status</Text>
              </View>
            </View>
          </GlassCard>

          {/* Story Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={18} color="#64748b" />
              <Text style={styles.sectionTitle}>Cerita Donasi</Text>
            </View>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>

          {/* Transaction History Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color="#64748b" />
              <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            </View>

            {transactions.length === 0 ? (
              <Text style={styles.emptyUpdateText}>Belum ada riwayat transaksi.</Text>
            ) : (
              transactions.slice(0, 10).map((item, idx) => {
                const isIncome = item.type === 'income';
                return (
                  <View key={item.id || idx} style={styles.transactionItem}>
                    <View style={[styles.transIconBox, { backgroundColor: isIncome ? 'rgba(105, 246, 184, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
                      <TrendingUp size={14} color={isIncome ? '#69f6b8' : '#64748b'} />
                    </View>
                    <View style={styles.transInfo}>
                      <Text style={styles.transName}>{item.display_name}</Text>
                      {item.type === 'expense' && (
                        <Text style={styles.transDesc} numberOfLines={1}>{item.description}</Text>
                      )}
                      <Text style={styles.transDate}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={[styles.transAmount, { color: isIncome ? '#69f6b8' : '#fff' }]}>
                      {isIncome ? '+' : '-'}{formatRp(item.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Updates Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Newspaper size={18} color="#64748b" />
              <Text style={styles.sectionTitle}>Update Berita ({updates.length})</Text>
            </View>

            {updates.length === 0 ? (
              <Text style={styles.emptyUpdateText}>Belum ada update berita untuk campaign ini.</Text>
            ) : (
              updates.map((update, idx) => (
                <View key={update.id} style={styles.updateItem}>
                  <View style={styles.timelinePoint} />
                  {idx < updates.length - 1 && <View style={styles.timelineLine} />}

                  <GlassCard style={styles.updateCard}>
                    <Text style={styles.updateDate}>
                      {new Date(update.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                    <Text style={styles.updateTitle}>{update.title}</Text>
                    {update.image_url && (
                      <Image source={{ uri: update.image_url }} style={styles.updateImage} />
                    )}
                    <Text style={styles.updateContent}>{update.content}</Text>
                  </GlassCard>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.donateBtn}
          onPress={() => router.push({
            pathname: '/(donatur)/donation-form',
            params: { campaignId: campaign.id, campaignTitle: campaign.title }
          })}
        >
          <Heart size={20} color="#002919" fill="#002919" />
          <Text style={styles.donateBtnText}>Donasi Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  centerContent: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  heroContainer: { width: '100%', height: 350, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', top: 60, left: 24, width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { position: 'absolute', top: 60, right: 24, width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  mainContent: { paddingHorizontal: 24, marginTop: -40 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(105, 246, 184, 0.1)', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  categoryText: { color: '#69f6b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 20 },
  statsCard: { padding: 20, marginBottom: 32 },
  progressHeader: { marginBottom: 16 },
  amountText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  targetText: { color: '#64748b', fontSize: 12, marginTop: 4 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
  progressBarFill: { height: '100%', backgroundColor: '#69f6b8', borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  statItem: { alignItems: 'center', gap: 4 },
  statVal: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  statLbl: { color: '#64748b', fontSize: 10 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  description: { color: '#94a3b8', fontSize: 14, lineHeight: 24 },
  emptyUpdateText: { color: '#475569', fontSize: 13, fontStyle: 'italic' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  transIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  transInfo: { flex: 1, gap: 2 },
  transName: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  transDesc: { color: '#64748b', fontSize: 11 },
  transDate: { color: '#475569', fontSize: 10 },
  transAmount: { fontSize: 14, fontWeight: 'bold' },
  updateItem: { paddingLeft: 24, position: 'relative', marginBottom: 20 },
  timelinePoint: { position: 'absolute', left: 0, top: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: '#69f6b8', zIndex: 2 },
  timelineLine: { position: 'absolute', left: 5, top: 24, width: 2, bottom: -24, backgroundColor: 'rgba(105, 246, 184, 0.2)' },
  updateCard: { padding: 16 },
  updateDate: { color: '#64748b', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  updateTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  updateImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, resizeMode: 'cover' },
  updateContent: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 24, paddingBottom: 40, backgroundColor: 'rgba(6, 14, 32, 0.9)' },
  donateBtn: { backgroundColor: '#69f6b8', height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  donateBtnText: { color: '#002919', fontSize: 16, fontWeight: 'bold' },
});
