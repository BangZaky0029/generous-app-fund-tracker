import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Bell, TrendingUp, Heart, ShieldCheck, Receipt, Bot, ChevronRight, Activity } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
             <Text style={styles.avatarText}>{initals}</Text>
          </View>
          <View>
            <Text style={styles.headerRole}>Kontributor Aktif</Text>
            <Text style={styles.headerName}>{fullName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroCard}>
         <View style={styles.heroBlur} />
         <Text style={styles.heroLabel}>Total Dana Terkumpul</Text>
         <Text style={styles.heroBalance}>{formatRp(fundData.totalDonations)}</Text>
         
         <View style={styles.badgeRow}>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={14} color="#69f6b8" />
              <Text style={styles.verifiedText}>Dana Tervalidasi Agen</Text>
            </View>
         </View>
      </View>

       {/* Transparansi Bar */}
       <View style={styles.transparencyCard}>
         <View style={styles.cardHeader}>
            <Activity size={20} color="#69f6b8" />
            <Text style={styles.cardTitle}>Status Penyaluran</Text>
         </View>
         
         <View style={styles.statsList}>
           <View>
             <View style={styles.statInfoRow}>
               <Text style={styles.statLabel}>Telah Disalurkan</Text>
               <Text style={styles.statValuePrimary}>
                   {formatRp(fundData.totalExpenses)} ({fundData.usagePercentage}%)
               </Text>
             </View>
             <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${fundData.usagePercentage}%`, backgroundColor: '#69f6b8' }]} />
             </View>
           </View>
         </View>
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
                const progress = Math.min((camp.current_amount / camp.target_amount) * 100, 100);
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
                          <View style={styles.campProgressBarBg}>
                             <View style={[styles.campProgressBarFill, { width: `${progress}%` }]} />
                          </View>
                          <Text style={styles.campProgressText}>{Math.round(progress)}%</Text>
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
            <TouchableOpacity onPress={() => router.push('/(donatur)/laporan')}>
              <Text style={styles.viewAllText}>Laporan Detail</Text>
            </TouchableOpacity>
         </View>
         
         <View style={{ gap: 12 }}>
             {fundData.recentDonations.length === 0 && fundData.recentExpenses.length === 0 ? (
                 <Text style={styles.emptyText}>Belum ada riwayat tercatat.</Text>
             ) : (
                <>
                  {[
                    ...fundData.recentDonations.slice(0, 3).map(d => ({ ...d, type: 'income' })),
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(105, 246, 184, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)' },
  avatarText: { color: '#69f6b8', fontWeight: 'bold' },
  headerRole: { color: '#64748b', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  notifBtn: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 14 },
  heroCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' },
  heroBlur: { position: 'absolute', bottom: -40, left: -40, width: 100, height: 100, backgroundColor: 'rgba(105, 246, 184, 0.03)', borderRadius: 50 },
  heroLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
  heroBalance: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', marginTop: 16 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(105, 246, 184, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { color: '#69f6b8', fontSize: 11, fontWeight: 'bold' },
  transparencyCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statsList: { gap: 20 },
  statInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  statValuePrimary: { fontSize: 12, color: '#69f6b8', fontWeight: 'bold' },
  statValueSecondary: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
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
  campProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  campProgressBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  campProgressBarFill: { height: '100%', backgroundColor: '#69f6b8', borderRadius: 2 },
  campProgressText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  emptyCampaign: { width: 300, padding: 40, alignItems: 'center', justifyContent: 'center' },
});
