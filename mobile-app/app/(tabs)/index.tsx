/**
 * Dashboard Screen — Bento Grid Layout 2026
 * Menampilkan seluruh data dana secara real-time
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, RefreshCw } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { HeroCard } from '@/components/bento/HeroCard';
import { ChartCard } from '@/components/bento/ChartCard';
import { CategoryCard } from '@/components/bento/CategoryCard';
import { ExpenseItem } from '@/components/feed/ExpenseItem';
import { FAB } from '@/components/ui/FAB';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppSpacing, AppRadius } from '@/constants/theme';

export default function DashboardScreen() {
  const {
    totalDonations, totalExpenses, remainingFunds,
    usagePercentage, categories, recentExpenses,
    isLoading, error, lastUpdated, refetch,
  } = useFundTrackerContext();

  const { user, isAdmin, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={AppColors.accent.emerald}
            colors={[AppColors.accent.emerald]}
          />
        }
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Halo, {user?.profile?.full_name?.split(' ')[0] ?? 'User'} 👋
            </Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, { backgroundColor: isAdmin ? `${AppColors.accent.electric}20` : `${AppColors.accent.blue}20` }]}>
                <Text style={[styles.roleText, { color: isAdmin ? AppColors.accent.electric : AppColors.accent.blue }]}>
                  {isAdmin ? '🛡️ Admin' : '💚 Donatur'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={refetch}>
              <RefreshCw size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleSignOut}>
              <LogOut size={18} color={AppColors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== AGENT STATUS BAR ===== */}
        <View style={styles.agentBar}>
          <View style={styles.agentDot} />
          <Text style={styles.agentText}>
            🤖 Agentic Core aktif · {lastUpdated
              ? lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Memuat...'}
          </Text>
        </View>

        {/* ===== ERROR STATE ===== */}
        {error && (
          <GlassCard style={styles.errorCard} accentColor={AppColors.accent.red}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </GlassCard>
        )}

        {/* ===== BENTO GRID ===== */}

        {/* 1. Hero Card — Full Width */}
        <HeroCard
          totalDonations={totalDonations}
          totalExpenses={totalExpenses}
          remainingFunds={remainingFunds}
          usagePercentage={usagePercentage}
          isLoading={isLoading}
        />

        {/* 2. Chart Row */}
        <View style={styles.row}>
          <ChartCard
            categories={categories}
            totalExpenses={totalExpenses}
            totalDonations={totalDonations}
          />
        </View>

        {/* 3. Category Grid (2 kolom) */}
        <Text style={styles.sectionTitle}>Alokasi Per Kategori</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
        </View>

        {/* 4. Recent Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pengeluaran Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transparency')}>
            <Text style={styles.seeAll}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        {recentExpenses.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>📭 Belum ada pengeluaran tercatat</Text>
          </GlassCard>
        ) : (
          recentExpenses.slice(0, 3).map((exp) => (
            <ExpenseItem key={exp.id} expense={exp} />
          ))
        )}

        {/* Bottom spacing untuk FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== FAB — Tambah Expense (Admin Only) ===== */}
      {isAdmin && (
        <FAB onPress={() => router.push('/modal/add-expense')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.bg.primary,
    gap: AppSpacing.md,
  },
  loadingText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
  scroll: {
    paddingHorizontal: AppSpacing.base,
    paddingTop: AppSpacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppSpacing.md,
  },
  greeting: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.xl,
    fontWeight: AppFonts.weights.bold,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 3,
    borderRadius: AppRadius.full,
  },
  roleText: {
    fontSize: AppFonts.sizes.xs,
    fontWeight: AppFonts.weights.semibold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    backgroundColor: AppColors.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.glass.border,
  },
  agentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: AppSpacing.base,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    backgroundColor: `${AppColors.accent.emerald}10`,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: `${AppColors.accent.emerald}20`,
  },
  agentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.accent.emerald,
  },
  agentText: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.xs,
  },
  errorCard: {
    marginBottom: AppSpacing.md,
  },
  errorText: {
    color: AppColors.accent.red,
    fontSize: AppFonts.sizes.sm,
  },
  row: {
    marginBottom: AppSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
  },
  sectionTitle: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
    marginBottom: AppSpacing.sm,
  },
  seeAll: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
    marginBottom: AppSpacing.xl,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: AppSpacing.xl,
  },
  emptyText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
});
