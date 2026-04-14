import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  ArrowLeft, PlusCircle, Receipt, TrendingUp, 
  TrendingDown, Newspaper, ChevronRight, Info,
  History, DollarSign, Wallet
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { getCampaign, fetchCampaignUpdates } from '@/services/campaignService';
import { fetchTotalDonations, fetchRecentDonations } from '@/services/donationService';
import { fetchExpensesByCategory, fetchRecentExpenses } from '@/services/expenseService';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import type { Campaign, CampaignUpdate, Donation, Expense } from '@/constants/types';

// Helper Formatter
const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CampaignManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refetch: refetchGlobal } = useFundTrackerContext();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [campData, updatesData, totalIn, expensesByCat, recentDonations, recentExpenses] = await Promise.all([
        getCampaign(id),
        fetchCampaignUpdates(id),
        fetchTotalDonations(id),
        fetchExpensesByCategory(id),
        fetchRecentDonations(10, id),
        fetchRecentExpenses(10, id),
      ]);

      const totalOut = Object.values(expensesByCat).reduce((sum, val) => sum + val, 0);

      setCampaign(campData);
      setUpdates(updatesData);
      setStats({
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
      });

      // Gabungkan dan urutkan transaksi
      const combined = [
        ...recentDonations.map(d => ({ 
          ...d, 
          type: 'income',
          receipt_url: d.payment_proof_url // Normalize field name
        })),
        ...recentExpenses.map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentTransactions(combined.slice(0, 10));
    } catch (error) {
      console.error('[CampaignManage] Load Error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    refetchGlobal(); // Juga refresh global context
    loadData();
  };

  if (isLoading || !campaign) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={AppColors.accent.emerald} />
        <Text style={styles.loadingText}>Memuat Kontrol Panel...</Text>
      </View>
    );
  }

  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.navInfo}>
          <Text style={styles.navTitle} numberOfLines={1}>{campaign.title}</Text>
          <Text style={styles.navSubtitle}>KONTROL PANEL ADMIN</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.accent.emerald} />
        }
      >
        {/* Tiered Stats Section (Overhauled) */}
        <View style={styles.statsContainer}>
          <GlassCard variant="elevated" style={styles.mainSaldoCard}>
            <View style={styles.saldoHeader}>
              <View style={styles.statIconBoxMain}>
                 <Wallet size={24} color={AppColors.accent.emerald} />
              </View>
              <View>
                <Text style={styles.statLabelMain}>SALDO TERSEDIA</Text>
                <Text style={styles.statValueMain}>{formatRp(stats.balance)}</Text>
              </View>
            </View>
            
            <View style={styles.progressBarWrap}>
                <View style={[styles.progressBarFull]}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.progressRowText}>
                  <Text style={styles.progressLabelText}>Progress: {Math.round(progress)}%</Text>
                  <Text style={styles.targetTotalText}>Target: {formatRp(campaign.target_amount)}</Text>
                </View>
            </View>
          </GlassCard>
          
          <View style={styles.secondaryStatsRow}>
             <GlassCard style={styles.secondaryStatBox}>
                <View style={styles.miniIconBoxIn}>
                  <TrendingUp size={16} color={AppColors.accent.emerald} />
                </View>
                <View>
                   <Text style={styles.miniLabel}>Total Masuk</Text>
                   <Text style={styles.miniValue}>{formatRp(stats.totalIn)}</Text>
                </View>
             </GlassCard>
             <GlassCard style={styles.secondaryStatBox}>
                <View style={styles.miniIconBoxOut}>
                  <TrendingDown size={16} color={AppColors.accent.red} />
                </View>
                <View>
                   <Text style={styles.miniLabel}>Penyaluran</Text>
                   <Text style={styles.miniValue}>{formatRp(stats.totalOut)}</Text>
                </View>
             </GlassCard>
          </View>
        </View>

        {/* Action Center - More Space & Descriptions */}
        <Text style={styles.sectionLabel}>PUSAT KENDALI TRANSAKSI</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push({
              pathname: '/(admin)/add-donation',
              params: { campaignId: campaign.id, campaignTitle: campaign.title }
            })}
          >
            <LinearGradient colors={['#10b981', '#059669']} style={styles.actionIconLarge}>
              <PlusCircle size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Kas Masuk</Text>
              <Text style={styles.actionSub}>Catat donasi baru</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push({
              pathname: '/(admin)/add-expense',
              params: { campaignId: campaign.id, campaignTitle: campaign.title }
            })}
          >
            <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.actionIconLarge}>
              <TrendingDown size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Pengeluaran</Text>
              <Text style={styles.actionSub}>Input biaya keluar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { width: '100%' }]}
            onPress={() => router.push({
              pathname: '/(admin)/add-campaign-update',
              params: { campaignId: campaign.id, campaignTitle: campaign.title }
            })}
          >
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.actionIconLarge}>
              <Newspaper size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Update Berita Kampanye</Text>
              <Text style={styles.actionSub}>Bagikan progres terkini kepada donatur</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Updates Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Berita Terbaru</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(admin)/add-campaign-update', params: { campaignId: campaign.id, campaignTitle: campaign.title } })}>
                <Text style={styles.viewAllBtn}>Lihat Semua</Text>
            </TouchableOpacity>
        </View>
        
        {updates.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Info size={24} color={AppColors.text.tertiary} />
            <Text style={styles.emptyText}>Belum ada update berita untuk wadah ini.</Text>
          </GlassCard>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.updateScroll}>
            {updates.slice(0, 5).map((update) => (
              <GlassCard key={update.id} style={styles.updateCard}>
                {update.image_url && (
                    <Image source={{ uri: update.image_url }} style={styles.updateImg} />
                )}
                <View style={styles.updateContent}>
                   <Text style={styles.updateCardTitle} numberOfLines={1}>{update.title}</Text>
                   <Text style={styles.updateCardDate}>{new Date(update.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        )}

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Ledger</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(admin)/(tabs)/manajemen-bukti' })}>
                <Text style={styles.viewAllBtn}>Telusuri</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.historyList}>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyTextCenter}>Belum ada transaksi.</Text>
          ) : (
            recentTransactions.map((item, idx) => {
              const isIncome = item.type === 'income';
              return (
                <TouchableOpacity 
                  key={item.id || idx} 
                  style={styles.historyCard}
                  onPress={() => item.receipt_url && router.push({ pathname: '/(admin)/(tabs)/manajemen-bukti', params: { search: item.description || item.donator_name } })}
                >
                  <View style={[styles.iconWrap, { backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)' }]}>
                    {isIncome ? <TrendingUp size={18} color={AppColors.accent.emerald} /> : <Receipt size={18} color={AppColors.accent.red} />}
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {isIncome ? `Donasi: ${item.donator_name}` : item.description}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                    </Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: isIncome ? AppColors.accent.emerald : '#fff' }]}>
                    {isIncome ? '+' : '-'}{formatRp(item.amount)}
                  </Text>
                </TouchableOpacity>
              )
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: AppColors.text.tertiary, fontSize: 13, fontWeight: 'bold' },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  navInfo: { flex: 1 },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  navSubtitle: { color: AppColors.accent.emerald, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  scroll: { padding: 24 },
  
  // STATS STYLES
  statsContainer: { gap: 12, marginBottom: 32 },
  mainSaldoCard: { padding: 24, gap: 16 },
  saldoHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statIconBoxMain: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' },
  statLabelMain: { color: AppColors.text.tertiary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  statValueMain: { color: '#fff', fontSize: 28, fontWeight: '900' },
  progressBarWrap: { marginTop: 8, gap: 8 },
  progressBarFull: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: AppColors.accent.emerald },
  progressRowText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabelText: { color: AppColors.accent.emerald, fontSize: 10, fontWeight: 'bold' },
  targetTotalText: { color: AppColors.text.tertiary, fontSize: 10, fontWeight: 'bold' },
  
  secondaryStatsRow: { flexDirection: 'row', gap: 12 },
  secondaryStatBox: { flex: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniIconBoxIn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' },
  miniIconBoxOut: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(244, 63, 94, 0.1)', alignItems: 'center', justifyContent: 'center' },
  miniLabel: { color: AppColors.text.tertiary, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  miniValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  
  // ACTION CENTER
  sectionLabel: { color: AppColors.text.tertiary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  actionCard: { width: '48%', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', gap: 12 },
  actionIconLarge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { gap: 2 },
  actionTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  actionSub: { color: AppColors.text.tertiary, fontSize: 10 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  viewAllBtn: { color: AppColors.accent.emerald, fontSize: 12, fontWeight: 'bold' },
  emptyCard: { padding: 32, alignItems: 'center', gap: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emptyText: { color: AppColors.text.tertiary, fontSize: 13, textAlign: 'center' },
  updateScroll: { marginBottom: 32 },
  updateCard: { width: 220, marginRight: 16, overflow: 'hidden', padding: 0 },
  updateImg: { width: '100%', height: 110, resizeMode: 'cover' },
  updateContent: { padding: 12, gap: 4 },
  updateCardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  updateCardDate: { color: AppColors.text.tertiary, fontSize: 11 },
  historyList: { gap: 12 },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(15, 23, 42, 0.3)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', gap: 16 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyInfo: { flex: 1, gap: 2 },
  historyTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  historyDate: { color: AppColors.text.tertiary, fontSize: 11 },
  historyAmount: { fontSize: 16, fontWeight: '900' },
  emptyTextCenter: { color: AppColors.text.tertiary, textAlign: 'center', paddingVertical: 40 }
});
