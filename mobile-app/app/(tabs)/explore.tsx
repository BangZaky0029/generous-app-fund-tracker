/**
 * Explore Screen — About App
 * Menampilkan informasi tentang aplikasi Generous Fund Tracker
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, Database, Camera, ShieldCheck, Zap, GitBranch } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppSpacing, AppRadius } from '@/constants/theme';

type FeatureItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  return (
    <GlassCard accentColor={color} style={styles.featureCard} padding={AppSpacing.md}>
      <View style={styles.featureRow}>
        <View style={[styles.featureIcon, { backgroundColor: `${color}18` }]}>
          {icon}
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDesc}>{description}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={28} color={AppColors.accent.emerald} />
          </View>
          <Text style={styles.appName}>Generous</Text>
          <Text style={styles.version}>Transparent Fund Tracker v1.0</Text>
          <Text style={styles.tagline}>
            Sistem pelacakan dana berbasis Agentic AI yang transparan dan real-time
          </Text>
        </View>

        {/* Tutorial / Cara Kerja */}
        <Text style={styles.sectionTitle}>Panduan Penggunaan</Text>
        
        <FeatureItem
          icon={<ShieldCheck size={20} color={AppColors.accent.emerald} />}
          title="1. Role (Admin vs Donatur)"
          description="Aplikasi memiliki 2 role: Donatur & Admin. Donatur hanya bisa melihat feed transaksi (transparan), sedangkan Admin bertugas melaporkan pengeluaran."
          color={AppColors.accent.emerald}
        />
        <FeatureItem
          icon={<Camera size={20} color={AppColors.accent.electric} />}
          title="2. Melaporkan Pengeluaran (Admin)"
          description="Klik tombol navigasi tambah (+) di Dashboard. Sistem akan meminta Anda mengambil foto struk belanja untuk dimuat."
          color={AppColors.accent.electric}
        />
        <FeatureItem
          icon={<Zap size={20} color={AppColors.accent.amber} />}
          title="3. OCR Auto-Fill & Proses"
          description="AI kami akan memindai struk (OCR) dan otomatis mengisi nominal transaksi. Setelah dicek dan disubmit, data langsung masuk ke backend."
          color={AppColors.accent.amber}
        />
        <FeatureItem
          icon={<Bot size={20} color={AppColors.accent.blue} />}
          title="4. Agentic Update Otomatis"
          description="Donatur tidak perlu me-refresh halaman! Setiap kali ada laporan pengeluaran, Agentic AI otomatis update persentase dan chart dalam sepersekian detik."
          color={AppColors.accent.blue}
        />

        {/* Features */}
        <Text style={[styles.sectionTitle, { marginTop: AppSpacing.md }]}>Teknologi Utama</Text>

        <FeatureItem
          icon={<Bot size={20} color={AppColors.accent.emerald} />}
          title="Agentic Core (useFundTracker)"
          description="Hook AI yang subscribe ke Supabase Realtime. Auto-kalkulasi persentase saat ada transaksi baru — tanpa refresh!"
          color={AppColors.accent.emerald}
        />
        <FeatureItem
          icon={<Camera size={20} color={AppColors.accent.electric} />}
          title="OCR Receipt Scanner"
          description="Foto struk → AI (OCR.space) ekstrak nominal otomatis → auto-fill form pengeluaran."
          color={AppColors.accent.electric}
        />
        <FeatureItem
          icon={<Database size={20} color={AppColors.accent.blue} />}
          title="Supabase Realtime Backend"
          description="PostgreSQL dengan Row Level Security. Channel realtime subscribe ke tabel expenses & donations."
          color={AppColors.accent.blue}
        />
        <FeatureItem
          icon={<ShieldCheck size={20} color={AppColors.accent.amber} />}
          title="Agent Verified Badges"
          description="Setiap pengeluaran yang tercatat sistem mendapat badge 'Agent Verified' sebagai jaminan transparansi."
          color={AppColors.accent.amber}
        />
        <FeatureItem
          icon={<Zap size={20} color={AppColors.accent.red} />}
          title="Bento Grid 2026 UI"
          description="Layout bento box dengan glassmorphism cards, progress bar animasi, dan dark mode Midnight Navy."
          color={AppColors.accent.red}
        />

        {/* Tech Stack */}
        <Text style={styles.sectionTitle}>Tech Stack</Text>
        <GlassCard variant="elevated" style={styles.stackCard}>
          {[
            ['Framework', 'React Native (Expo Router)'],
            ['Styling', 'StyleSheet + Design Tokens 2026'],
            ['Backend', 'Supabase (PostgreSQL + Realtime)'],
            ['OCR', 'OCR.space API (Free Tier)'],
            ['Charts', 'react-native-gifted-charts'],
            ['Icons', 'Lucide React Native'],
            ['Animation', 'react-native-reanimated v4'],
          ].map(([label, value]) => (
            <View key={label} style={styles.stackRow}>
              <Text style={styles.stackLabel}>{label}</Text>
              <Text style={styles.stackValue}>{value}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Kategori Dana</Text>
        <GlassCard variant="elevated" style={styles.stackCard}>
          {[
            ['🚛 Logistik',     AppColors.accent.amber],
            ['⚙️ Operasional',  AppColors.accent.blue],
            ['❤️ Kesehatan',    AppColors.accent.red],
            ['🎓 Edukasi',      AppColors.accent.emerald],
            ['📦 Lainnya',      AppColors.accent.violet],
          ].map(([name, color]) => (
            <View key={name as string} style={styles.catRow}>
              <View style={[styles.catDot, { backgroundColor: color as string }]} />
              <Text style={[styles.catName, { color: color as string }]}>{name as string}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={styles.footer}>
          <GitBranch size={12} color={AppColors.text.tertiary} />
          <Text style={styles.footerText}>
            Dibuat untuk mata kuliah Pemrograman Mobile 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  scroll: {
    paddingHorizontal: AppSpacing.base,
    paddingTop: AppSpacing.base,
    paddingBottom: AppSpacing['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingVertical: AppSpacing.xl,
    marginBottom: AppSpacing.base,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: AppRadius['2xl'],
    backgroundColor: `${AppColors.accent.emerald}15`,
    borderWidth: 1,
    borderColor: `${AppColors.accent.emerald}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppSpacing.md,
  },
  appName: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes['2xl'],
    fontWeight: AppFonts.weights.extrabold,
    letterSpacing: -0.5,
  },
  version: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.xs,
    marginTop: 4,
    marginBottom: AppSpacing.sm,
  },
  tagline: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: AppSpacing.lg,
  },
  sectionTitle: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
    marginBottom: AppSpacing.sm,
    marginTop: AppSpacing.sm,
  },
  featureCard: {
    marginBottom: AppSpacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppSpacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.semibold,
    marginBottom: 4,
  },
  featureDesc: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    lineHeight: 18,
  },
  stackCard: {
    marginBottom: AppSpacing.base,
    gap: AppSpacing.sm,
  },
  stackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  stackLabel: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
  stackValue: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
    textAlign: 'right',
    flex: 1,
    marginLeft: AppSpacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    paddingVertical: 4,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: AppSpacing.xl,
  },
  footerText: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
  },
});
