import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  StyleSheet, Image 
} from 'react-native';
import { 
  PlusCircle, Scan, Keyboard, 
  ArrowRight, ShieldCheck, Zap,
  Info, Sparkles, ArrowLeft
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useFundTrackerContext } from '@/context/FundTrackerContext';

export default function InputDashboard() {
  const { showAlert, refetch } = useFundTrackerContext();

  // Auto Refresh saat masuk ke layar ini
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );
  
  const handleOpenExpense = () => {
    router.push('/(admin)/add-expense');
  };

  const handleOpenDonation = () => {
    router.push('/(admin)/add-donation');
  };

  const showUnderConstruction = () => {
    showAlert(
      'Fitur Sedang Dikembangkan',
      'Kami sedang mengintegrasikan agen AI untuk validasi data otomatis secara realtime.',
      'info'
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Action Center</Text>
            <View style={styles.subHeaderRow}>
              <Sparkles size={14} color={AppColors.accent.emerald} />
              <Text style={styles.headerSubtitle}>Kelola Arus Dana Digital</Text>
            </View>
          </View>
        </View>
        
        {/* Main Header Card with Gradient */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.heroCard}
          >
            <View style={styles.heroInfo}>
              <View style={styles.shieldIcon}>
                <ShieldCheck size={32} color={AppColors.accent.emerald} />
              </View>
              <Text style={styles.heroTitle}>Input Terverifikasi</Text>
              <Text style={styles.heroDesc}>
                Setiap transaksi yang Anda masukkan akan tercatat secara permanen dan terenkripsi dalam sistem ledger kami.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionLabel}>Pilih Modul Input</Text>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/add-expense')}
        >
          <GlassCard style={styles.cardInner}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(105, 246, 184, 0.1)' }]}>
              <Scan size={28} color={AppColors.accent.emerald} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Pengeluaran</Text>
                <View style={styles.newBadge}><Text style={styles.newBadgeText}>AI SCAN</Text></View>
              </View>
              <Text style={styles.cardDesc}>Scan struk belanja dengan OCR atau masukkan data manual.</Text>
            </View>
            <ArrowRight size={20} color={AppColors.accent.emerald} style={styles.arrowIcon} />
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={handleOpenDonation}
        >
          <GlassCard style={styles.cardInner}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <PlusCircle size={28} color={AppColors.accent.blue} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Donasi / Kas</Text>
              <Text style={styles.cardDesc}>Catat dana masuk atau uang kas jamaah untuk menambah saldo.</Text>
            </View>
            <ArrowRight size={20} color={AppColors.accent.blue} style={styles.arrowIcon} />
          </GlassCard>
        </TouchableOpacity>

        {/* Tips Section */}
        <TouchableOpacity onPress={showUnderConstruction} activeOpacity={0.9}>
          <GlassCard style={styles.tipsCard}>
             <View style={styles.tipsHeader}>
                <Zap size={16} color={AppColors.accent.electric} />
                <Text style={styles.tipsTitle}>Tips Optimasi</Text>
             </View>
             <Text style={styles.tipsText}>
               Gunakan fitur <Text style={{fontWeight: 'bold'}}>Scan Struk</Text> untuk efisiensi. AI kami akan mendeteksi nominal secara otomatis.
             </Text>
          </GlassCard>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060e20',
  },
  header: {
    paddingHorizontal: AppSpacing.base,
    paddingTop: AppSpacing.xl,
    paddingBottom: AppSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  headerTitle: {
    color: AppColors.text.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: AppColors.accent.emerald,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scroll: {
    padding: AppSpacing.base,
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
  shieldIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroInfo: {
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    color: AppColors.text.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  heroDesc: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 20,
    marginLeft: 4,
  },
  actionCard: {
    marginBottom: 16,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
    borderRadius: 24,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: AppColors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  newBadge: {
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(105, 246, 184, 0.3)',
  },
  newBadgeText: {
    color: AppColors.accent.emerald,
    fontSize: 8,
    fontWeight: '900',
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  arrowIcon: {
    opacity: 0.5,
  },
  tipsCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 24,
    borderColor: 'rgba(105, 246, 184, 0.05)',
    backgroundColor: 'rgba(105, 246, 184, 0.02)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    color: AppColors.accent.electric,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipsText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 22,
  }
});
