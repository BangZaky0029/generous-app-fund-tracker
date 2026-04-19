import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TrendingUp, PlusSquare, QrCode, Bot, Receipt } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/theme';
import { NotificationBell } from '@/components/ui/NotificationBell';

// Helper Formatter
const formatRp = (amount: number) => {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    // Fallback if Intl fails on some Android builds
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
};

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const fundData = useFundTrackerContext();

  // Ambil inisial 
  const fullName = user?.profile?.full_name || 'Administrator';
  const initals = fullName.substring(0, 2).toUpperCase();

  if (fundData.isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color="#69f6b8" />
        <Text style={styles.loadingText}>Menghubungkan ke Ledger...</Text>
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
          <LinearGradient colors={['#69f6b8', '#00c37b']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initals}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerRole}>Otoritas Admin</Text>
            <Text style={styles.headerName}>{fullName}</Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Hero Section */}
      <View style={styles.heroCard}>
        <View style={styles.heroBlur} />
        <Text style={styles.heroLabel}>Total Saldo Terkelola</Text>
        <Text style={styles.heroBalance}>{formatRp(fundData.remainingFunds)}</Text>

        <View style={styles.heroStats}>
          <View>
            <Text style={styles.statLabel}>ASET MASUK</Text>
            <Text style={styles.statIn}>{formatRp(fundData.totalDonations)}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>ANTRIAN (PENDING)</Text>
            <Text style={styles.statPending}>{formatRp(fundData.totalDonationsPending)}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>ASET KELUAR</Text>
            <Text style={styles.statOut}>{formatRp(fundData.totalExpenses)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitleMain}>Aksi Cepat</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/create-campaign')}
            style={styles.actionBtnPrimary}
          >
            <PlusSquare size={24} color="#002919" />
            <Text style={styles.actionTextPrimary}>Buat Donasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(admin)/validasi-kamera')}
            style={styles.actionBtnSecondary}
          >
            <QrCode size={24} color="#69f6b8" />
            <Text style={styles.actionTextSecondary}>Scan Struk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manajemen Wadah Donasi */}
      <View style={styles.campaignSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp size={20} color="#69f6b8" />
            <Text style={styles.sectionTitle}>Wadah Donasi Aktif</Text>
          </View>
        </View>

        {fundData.activeCampaigns.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada wadah donasi aktif.</Text>
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
                  pathname: '/(admin)/campaign-manage',
                  params: { id: camp.id }
                })}
              >
                <View style={styles.campUpperRow}>
                  <View style={styles.campHeaderInfo}>
                    <Text style={styles.campTitle}>{camp.title}</Text>
                    <View style={styles.categoryRow}>
                      <View style={styles.categoryDot} />
                      <Text style={styles.campCategory}>{camp.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.percentCircle}>
                    <Text style={styles.progressPercentText}>{displayPercent}%</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  {/* Confirmed Progress Bar */}
                  <View style={styles.barContainer}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabelText}>TERVERIFIKASI</Text>
                      <Text style={styles.barSmallVal}>{formatRp(camp.current_amount)}</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.progressFill, { width: `${Math.min(visualConfirmed, 100)}%` }]} />
                    </View>
                  </View>

                  {/* Expense Progress Bar */}
                  <View style={styles.barContainer}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabelExpenseText}>PENGELUARAN (TERPAKAI)</Text>
                      <Text style={styles.barSmallValExpense}>{formatRp(camp.expense_amount || 0)}</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.progressFillExpense, { width: `${Math.min(visualExpense, 100)}%` }]} />
                    </View>
                  </View>

                  {/* Pending Progress Bar */}
                  <View style={styles.barContainer}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabelPendingText}>ANTRIAN (PENDING)</Text>
                      <Text style={styles.barSmallValPending}>+ {formatRp(camp.pending_amount)}</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.progressFillPendingLine, { width: `${Math.min(visualPending, 100)}%` }]} />
                    </View>
                  </View>
                </View>

                <View style={styles.campFooter}>
                  <View style={styles.targetCol}>
                    <Text style={styles.targetLabel}>TARGET PENDANAAN</Text>
                    <Text style={styles.targetAmountText}>{formatRp(camp.target_amount)}</Text>
                  </View>
                  
                  <View style={styles.manageBtn}>
                    <TrendingUp size={16} color="#002919" />
                    <Text style={styles.manageBtnText}>KELOLA</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </View>

      {/* Log Aktivitas */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Bot size={20} color="#69f6b8" />
            <Text style={styles.sectionTitle}>Log Aktivitas</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/manajemen-bukti')}>
            <Text style={styles.viewAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 12 }}>
          {fundData.recentExpenses.length === 0 && fundData.recentDonations.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada aktivitas hari ini.</Text>
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
                  const campaignTitle = item.campaigns?.title || 'Umum';

                  return (
                    <TouchableOpacity
                      key={item.id || idx}
                      style={styles.activityCard}
                      onPress={() => item.receipt_url && router.push({ pathname: '/(admin)/(tabs)/manajemen-bukti', params: { search: item.description || item.donator_name } })}
                    >
                      <View style={[styles.iconBox, { backgroundColor: isIncome ? 'rgba(105, 246, 184, 0.1)' : 'rgba(255, 71, 87, 0.1)' }]}>
                        {isIncome ? <TrendingUp size={18} color="#69f6b8" /> : <Receipt size={18} color="#ff4757" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityName} numberOfLines={1}>
                          {isIncome ? `Donasi: ${item.donator_name || 'Hamba Allah'}` : (item.description || item.category)}
                        </Text>
                        <Text style={styles.activityMeta}>
                          {campaignTitle} • {isIncome ? 'Masuk' : item.category}
                        </Text>
                      </View>
                      <Text style={[styles.activityAmount, { color: isIncome ? '#69f6b8' : '#fff' }]}>
                        {isIncome ? '+' : '-'}{formatRp(item.amount)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              }
            </>
          )}
        </View>
      </View>

      <View style={styles.footerBadge}>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SISTEM AKTIF</Text>
        </View>
        <Text style={styles.footerVersion}>v2.0.4 Premium</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 13 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#002919', fontWeight: 'bold' },
  headerRole: { color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  notifBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  heroCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  heroBlur: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, backgroundColor: 'rgba(105, 246, 184, 0.05)', borderRadius: 60 },
  heroLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  heroBalance: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  statIn: { color: '#69f6b8', fontWeight: 'bold' },
  statOut: { color: '#fff', fontWeight: 'bold' },
  statPending: { color: '#facc15', fontWeight: 'bold' },
  statLabel: { color: '#64748b', fontSize: 10, marginBottom: 4 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  actionSection: { marginBottom: 32 },
  sectionTitleMain: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#69f6b8', padding: 20, borderRadius: 20, alignItems: 'center' },
  actionBtnSecondary: { flex: 1, backgroundColor: 'rgba(25, 37, 64, 0.8)', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionTextPrimary: { color: '#002919', fontWeight: 'bold', marginTop: 8, fontSize: 12 },
  actionTextSecondary: { color: '#fff', fontWeight: 'bold', marginTop: 8, fontSize: 12 },
  activitySection: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  viewAllText: { color: '#69f6b8', fontSize: 12, fontWeight: 'bold' },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  activityMeta: { color: '#64748b', fontSize: 11 },
  activityAmount: { fontSize: 14, fontWeight: 'bold' },
  emptyText: { color: '#475569', textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  campaignSection: { marginBottom: 32 },
  campaignCard: { backgroundColor: '#0f172a', borderRadius: 28, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
  campUpperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  campHeaderInfo: { flex: 1, gap: 4 },
  campTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#69f6b8' },
  campCategory: { color: '#69f6b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  percentCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(105, 246, 184, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)' },
  progressPercentText: { color: '#69f6b8', fontSize: 13, fontWeight: '900' },
  
  progressSection: { gap: 12 },
  barContainer: { gap: 6 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabelText: { color: '#69f6b8', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  barLabelExpenseText: { color: '#ff4757', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  barLabelPendingText: { color: '#facc15', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  barSmallVal: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  barSmallValExpense: { color: '#ff4757', fontSize: 10, fontWeight: 'bold' },
  barSmallValPending: { color: '#facc15', fontSize: 10, fontWeight: 'bold' },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#69f6b8', borderRadius: 3 },
  progressFillExpense: { height: '100%', backgroundColor: '#ff4757', borderRadius: 3 },
  progressFillPendingLine: { height: '100%', backgroundColor: '#facc15', borderRadius: 3 },

  campFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  targetCol: { gap: 2 },
  targetLabel: { color: '#64748b', fontSize: 8, fontWeight: 'bold' },
  targetAmountText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#69f6b8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  manageBtnText: { color: '#002919', fontSize: 11, fontWeight: 'bold' },

  footerBadge: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(105, 246, 184, 0.05)', padding: 12, borderRadius: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#69f6b8' },
  statusText: { color: '#69f6b8', fontSize: 10, fontWeight: 'bold' },
  footerVersion: { color: '#64748b', fontSize: 9 }
});
