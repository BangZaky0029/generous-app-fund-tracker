import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { Receipt, Clock, CheckCircle2, AlertCircle, ChevronRight, TrendingUp } from 'lucide-react-native';
import { useAuthContext, useFundTrackerContext } from '@/context/FundTrackerContext';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserDonations } from '@/services/donationService';
import { Donation } from '@/constants/types';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function RiwayatDonasiScreen() {
  const { user } = useAuthContext();
  const { showAlert } = useFundTrackerContext();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user])
  );

  const loadHistory = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchUserDonations(user.id);
      setDonations(data);
    } catch (err) {
      console.error(err);
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

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Donasi</Text>
        <Text style={styles.subtitle}>Pantau status kontribusi Anda di sini</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        {donations.length === 0 ? (
          <View style={styles.emptyState}>
            <Receipt size={64} color="rgba(255,255,255,0.05)" />
            <Text style={styles.emptyTitle}>Belum Ada Donasi</Text>
            <Text style={styles.emptySub}>Donasi yang Anda kirim akan muncul di sini untuk pelacakan status.</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {donations.map((item) => {
              const isConfirmed = item.status === 'confirmed';
              const isPending = item.status === 'pending';
              const isRejected = item.status === 'rejected';

              return (
                <GlassCard key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.labelContainer}>
                      <TrendingUp size={12} color="#64748b" />
                      <Text style={styles.campaignLabel} numberOfLines={1}>
                        {item.campaigns?.title || 'Wadah Terintegrasi'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      isConfirmed && styles.statusConfirmed,
                      isPending && styles.statusPending,
                      isRejected && styles.statusRejected
                    ]}>
                      {isConfirmed && <CheckCircle2 size={10} color="#002919" />}
                      {isPending && <Clock size={10} color="#422006" />}
                      {isRejected && <AlertCircle size={10} color="#fff" />}
                      <Text style={[
                        styles.statusText,
                        isConfirmed && { color: '#002919' },
                        isPending && { color: '#422006' },
                        isRejected && { color: '#fff' }
                      ]}>
                        {isConfirmed ? 'VERIFIKASI' : isPending ? 'ANTRIAN' : 'DITOLAK'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMain}>
                    <View>
                      <Text style={styles.amountText}>{formatRp(item.amount)}</Text>
                      <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </Text>
                    </View>
                    
                    {item.payment_proof_url && (
                      <TouchableOpacity 
                        style={styles.proofBtn} 
                        onPress={() => Linking.openURL(item.payment_proof_url!)}
                      >
                        <Text style={styles.proofText}>Lihat Bukti</Text>
                        <ChevronRight size={14} color="#69f6b8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {item.message && (
                    <View style={styles.messageBox}>
                      <Text style={styles.messageText} numberOfLines={2}>"{item.message}"</Text>
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  loadingRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24, backgroundColor: 'rgba(6,14,32,0.8)' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 4 },
  scroll: { padding: 24 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  card: { padding: 16, gap: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  campaignLabel: { color: '#64748b', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusConfirmed: { backgroundColor: '#69f6b8' },
  statusPending: { backgroundColor: '#facc15' },
  statusRejected: { backgroundColor: '#ef4444' },
  statusText: { fontSize: 9, fontWeight: '900' },
  cardMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  dateText: { color: '#475569', fontSize: 12, marginTop: 2 },
  proofBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(105, 246, 184, 0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  proofText: { color: '#69f6b8', fontSize: 11, fontWeight: 'bold' },
  messageBox: { padding: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeftWidth: 2, borderLeftColor: 'rgba(105, 246, 184, 0.3)' },
  messageText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
});
