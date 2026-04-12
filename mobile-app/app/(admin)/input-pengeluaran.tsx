import React from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  StyleSheet, Image 
} from 'react-native';
import { 
  PlusCircle, Scan, Keyboard, 
  ArrowRight, ShieldCheck, Zap,
  Info
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function InputDashboard() {
  
  const handleOpenExpense = () => {
    router.push('/modal/add-expense');
  };

  const handleOpenDonation = () => {
    router.push('/modal/add-donation');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Action Center</Text>
        <Text style={styles.headerSubtitle}>Kelola Arus Dana Generous</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Header Card */}
        <GlassCard variant="elevated" style={styles.heroCard}>
          <View style={styles.heroInfo}>
            <ShieldCheck size={32} color={AppColors.accent.emerald} />
            <Text style={styles.heroTitle}>Input Terverifikasi</Text>
            <Text style={styles.heroDesc}>
              Setiap transaksi yang Anda masukkan akan tercatat secara permanen di blockchain database Supabase.
            </Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>Pilih Jenis Input</Text>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.9}
          onPress={handleOpenExpense}
        >
          <GlassCard variant="elevated" style={styles.cardInner}>
            <LinearGradient
              colors={['rgba(105, 246, 184, 0.1)', 'rgba(6, 14, 32, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.iconBox, { backgroundColor: 'rgba(105, 246, 184, 0.1)' }]}>
              <Scan size={32} color={AppColors.accent.emerald} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Input Pengeluaran</Text>
              <Text style={styles.cardDesc}>Scan struk belanja dengan AI OCR atau masukkan data pengeluaran secara manual.</Text>
            </View>
            <View style={styles.arrowBox}>
               <ArrowRight size={20} color={AppColors.accent.emerald} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.9}
          onPress={handleOpenDonation}
        >
          <GlassCard variant="elevated" style={styles.cardInner}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.1)', 'rgba(6, 14, 32, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <PlusCircle size={32} color={AppColors.accent.blue} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Donasi / Kas Masuk</Text>
              <Text style={styles.cardDesc}>Catat dana yang masuk dari donatur atau uang kas jamaah untuk menambah saldo.</Text>
            </View>
            <View style={styles.arrowBox}>
               <ArrowRight size={20} color={AppColors.accent.blue} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Tips Section */}
        <GlassCard style={styles.tipsCard}>
           <View style={styles.tipsHeader}>
              <Zap size={16} color={AppColors.accent.electric} />
              <Text style={styles.tipsTitle}>Tips Admin</Text>
           </View>
           <Text style={styles.tipsText}>
             Gunakan fitur **Scan Struk** untuk efisiensi. AI akan mendeteksi nominal secara otomatis dan mengisi form untuk Anda.
           </Text>
        </GlassCard>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  header: {
    paddingHorizontal: AppSpacing.base,
    paddingVertical: AppSpacing.xl,
  },
  headerTitle: {
    color: AppColors.text.primary,
    fontSize: 32,
    fontWeight: AppFonts.weights.bold,
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: AppColors.accent.emerald,
    fontSize: 14,
    fontWeight: AppFonts.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  scroll: {
    padding: AppSpacing.base,
  },
  heroCard: {
    marginBottom: AppSpacing.xl,
    padding: AppSpacing.xl,
    backgroundColor: 'rgba(25, 37, 64, 0.4)',
  },
  heroInfo: {
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    color: AppColors.text.primary,
    fontSize: 20,
    fontWeight: AppFonts.weights.bold,
  },
  heroDesc: {
    color: AppColors.text.tertiary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionLabel: {
    color: AppColors.text.tertiary,
    fontSize: 12,
    fontWeight: AppFonts.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: AppSpacing.lg,
    marginLeft: 4,
  },
  actionCard: {
    marginBottom: AppSpacing.md,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppSpacing.lg,
    gap: AppSpacing.lg,
    overflow: 'hidden',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: AppColors.text.primary,
    fontSize: 18,
    fontWeight: AppFonts.weights.bold,
  },
  cardDesc: {
    color: AppColors.text.tertiary,
    fontSize: 12,
    lineHeight: 18,
  },
  arrowBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    marginTop: AppSpacing.lg,
    padding: AppSpacing.lg,
    borderColor: 'rgba(105, 246, 184, 0.1)',
    backgroundColor: 'rgba(105, 246, 184, 0.05)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    color: AppColors.accent.electric,
    fontSize: 14,
    fontWeight: AppFonts.weights.bold,
    textTransform: 'uppercase',
  },
  tipsText: {
    color: AppColors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
  }
});
