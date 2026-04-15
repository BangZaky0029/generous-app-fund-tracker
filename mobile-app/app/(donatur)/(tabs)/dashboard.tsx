import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { TrendingUp, Heart, ShieldCheck, Receipt, Bot, ChevronRight, Activity } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationBell } from '@/components/ui/NotificationBell';

// Helper Formatter
const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DonaturDashboard() {
  const { user } = useAuthContext();
  const fundData = useFundTrackerContext();

  const fullName = user?.profile?.full_name || 'Donatur';
  const initals = fullName.substring(0, 2).toUpperCase();

  if (fundData.isLoading) {
     return (
       <View style={styles.loadingRoot}>
         <ActivityIndicator size="large" color="#69f6b8" />
         <Text style={styles.loadingText}>Menghubungkan ke Ledger Publik...</Text>
       </View>
     );
  }

  return (
    <ScrollView 
      style={styles.root} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
             {user?.profile?.avatar_url ? (
               <Image source={{ uri: user.profile.avatar_url }} style={styles.avatarImg} />
             ) : (
               <Text style={styles.avatarText}>{initals}</Text>
             )}
          </View>
          <View>
            <Text style={styles.headerRole}>Kontributor Aktif</Text>
            <Text style={styles.headerName}>{fullName}</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Wadah Donasi Section */}
       <View style={styles.campaignListSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Heart size={20} color="#69f6b8" />
              <Text style={styles.sectionTitle}>Wadah Donasi</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.campaignScroll}
          >
            {fundData.activeCampaigns.length === 0 ? (
              <View style={styles.emptyCampaign}>
                <Text style={styles.emptyText}>Belum ada wadah aktif.</Text>
              </View>
            ) : (
              fundData.activeCampaigns.map((camp: any) => {
                const target = camp.target_amount || 1;
                const confirmedProgress = (camp.current_amount / target) * 100;
                const expenseProgress = ((camp.expense_amount || 0) / target) * 100;
                const pendingProgress = (camp.pending_amount / target) * 100;
                
                // Visual Floor
                const visualConfirmed = camp.current_amount > 0 ? Math.max(confirmedProgress, 2) : 0;
                const visualExpense = (camp.expense_amount || 0) > 0 ? Math.max(expenseProgress, 2) : 0;
                const visualPending = camp.pending_amount > 0 ? Math.max(pendingProgress, 2) : 0;
                
                const totalPercent = confirmedProgress + pendingProgress;
                const displayPercent = totalPercent > 0 && totalPercent < 1 ? "<1" : Math.round(totalPercent);

                return (
                  <TouchableOpacity 
                    key={camp.id} 
                    style={styles.campaignCard}
                    onPress={() => router.push({
                      pathname: '/(donatur)/campaign-detail',
                      params: { id: camp.id }
                    })}
                  >
                    <Image 
                      source={{ uri: camp.poster_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop' }} 
                      style={styles.campaignPoster} 
                    />
                    <View style={styles.campaignInfo}>
                       <Text style={styles.campaignTitle} numberOfLines={2}>{camp.title}</Text>
                       <Text style={styles.campaignCat}>{camp.category}</Text>
                       
                        <View style={styles.campProgressRow}>
                           <View style={styles.campProgressBarDual}>
                              {/* Upper: Confirmed */}
                              <View style={styles.campBarItem}>
                                 <View style={styles.campBarBg}>
                                    <View style={[styles.campProgressBarFill, { width: `${Math.min(visualConfirmed, 100)}%` }]} />
                                 </View>
                                 <Text style={styles.campBarLabel}>VERIFIED</Text>
                              </View>
                              
                              {/* Middle: Disbursed/Spent */}
                              <View style={styles.campBarItem}>
                                 <View style={styles.campBarBg}>
                                    <View style={[styles.campProgressBarFill, { width: `${Math.min(visualExpense, 100)}%`, backgroundColor: '#ff4757' }]} />
                                 </View>
                                 <Text style={styles.campBarLabelExpense}>DISBURSED</Text>
                              </View>
                           </View>
                           <Text style={styles.campProgressText}>{displayPercent}%</Text>
                        </View>

                        {/* Social Proof: Total Donors & Top Hero */}
                        <View style={styles.socialStats}>
                           <View style={styles.socialItem}>
                              <Text style={styles.socialLabel}>🚀 {camp.total_donors || 0} Donatur</Text>
                           </View>
                           <View style={styles.socialItem}>
                              <Text style={styles.socialHero} numberOfLines={1}>👑 {camp.top_donator_name || '-'}</Text>
                           </View>
                        </View>
                     </View>
                  </TouchableOpacity>
                )
              })
            )}
          </ScrollView>
       </View>

      {/* Aktivitas Terkini */}
      <View style={styles.activitySection}>
         <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={20} color="#69f6b8" />
              <Text style={styles.sectionTitle}>Aktivitas Terkini</Text>
            </View>
         </View>
         
         <View style={{ gap: 12 }}>
             {fundData.recentDonations.length === 0 && fundData.recentExpenses.length === 0 ? (
                 <Text style={styles.emptyText}>Belum ada riwayat tercatat.</Text>
             ) : (
                <>
                  {[
                    ...fundData.recentDonations.slice(0, 3).map(d => ({ 
                      ...d, 
                      type: 'income',
                      receipt_url: d.payment_proof_url // Normalize field name
                    })),
                    ...fundData.recentExpenses.slice(0, 3).map(e => ({ ...e, type: 'expense' }))
                  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                   .slice(0, 5)
                   .map((item: any, idx) => {
                     const isIncome = item.type === 'income';
                     return (
                        <View key={item.id || idx} style={styles.activityCard}>
                           <View style={[styles.iconBox, { backgroundColor: isIncome ? 'rgba(105, 246, 184, 0.1)' : 'rgba(255, 255, 255, 0.05)' }]}>
                             {isIncome ? <Heart size={18} color="#69f6b8" /> : <Receipt size={18} color="#94a3b8" />}
                           </View>
                           <View style={{ flex: 1, gap: 2 }}>
                               <Text style={styles.activityName} numberOfLines={1}>
                                    {isIncome ? `${item.donator_name || 'Hamba Allah'}` : (item.description || item.category)}
                               </Text>
                               <Text style={styles.activityMeta}>
                                    {item.campaigns?.title || 'Umum'} • {isIncome ? 'Dana Masuk' : `Laporan: ${item.category}`}
                               </Text>
                           </View>
                           <View style={{ alignItems: 'flex-end' }}>
                              <Text style={[styles.activityAmount, { color: isIncome ? '#69f6b8' : '#fff' }]}>
                                  {isIncome ? '+' : '-'}{formatRp(item.amount)}
                              </Text>
                              {item.receipt_url && <Text style={styles.proofBadge}>Bukti ✓</Text>}
                           </View>
                        </View>
                     );
                   })
                  }
                </>
             )}
         </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  scrollContent: { padding: 24, paddingTop: 60 },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 13 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(105, 246, 184, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarText: { color: '#69f6b8', fontWeight: 'bold' },
  headerRole: { color: '#64748b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  notifBtn: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 14 },
  verifiedText: { color: '#69f6b8', fontSize: 11, fontWeight: 'bold' },
  transparencyCard: { 
    backgroundColor: '#0f172a', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#69f6b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statsList: { gap: 20 },
  statInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { fontSize: 14, color: '#94a3b8' },
  statValuePrimary: { fontSize: 20, color: '#69f6b8', fontWeight: 'bold' },
  statMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statMetaText: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  activitySection: { backgroundColor: 'rgba(25,37,64,0.3)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  viewAllText: { color: '#69f6b8', fontSize: 12, fontWeight: 'bold' },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  activityMeta: { color: '#64748b', fontSize: 11 },
  activityAmount: { fontSize: 14, fontWeight: 'bold' },
  proofBadge: { color: '#69f6b8', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  emptyText: { color: '#64748b', textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  campaignListSection: { marginBottom: 32 },
  campaignScroll: { gap: 16, paddingRight: 40 },
  campaignCard: { width: 220, backgroundColor: '#0f172a', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  campaignPoster: { width: '100%', height: 120, resizeMode: 'cover' },
  campaignInfo: { padding: 12, gap: 4 },
  campaignTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', height: 40 },
  campaignCat: { color: '#69f6b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  campProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  campProgressBarDual: { flex: 1, gap: 6 },
  campBarItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  campBarBg: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1.5, overflow: 'hidden' },
  campBarLabel: { color: '#69f6b8', fontSize: 6, fontWeight: '900', width: 45 },
  campBarLabelExpense: { color: '#ff4757', fontSize: 6, fontWeight: '900', width: 45 },
  campBarLabelPending: { color: '#facc15', fontSize: 6, fontWeight: '900', width: 45 },
  campProgressBarFill: { height: '100%', backgroundColor: '#06b77f', borderRadius: 1.5 },
  socialStats: { flexDirection: 'row', gap: 6, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.02)' },
  socialItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6 },
  socialLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '800' },
  socialHero: { color: '#69f6b8', fontSize: 9, fontWeight: '900' },
  campProgressBarFillPendingLine: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 1.5,
  },
  campProgressText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(250, 204, 21, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  pendingBadgeText: { color: '#facc15', fontSize: 11, fontWeight: 'bold' },
  emptyCampaign: { width: 300, padding: 40, alignItems: 'center', justifyContent: 'center' },
});
