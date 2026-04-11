/**
 * Transparency Feed Screen
 * Daftar lengkap semua pengeluaran & Pemasukan + Agent Verified badges
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, TextInput, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ShieldCheck, ArrowDownCircle } from 'lucide-react-native';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { ExpenseItem } from '@/components/feed/ExpenseItem';
import { DonationItem } from '@/components/feed/DonationItem';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows, CATEGORIES } from '@/constants/theme';
import type { Expense, Donation } from '@/constants/types';

const ALL_CATEGORIES = ['Semua', ...CATEGORIES.map((c) => c.name)] as const;

export default function TransparencyScreen() {
  const { recentExpenses, recentDonations, isLoading, refetch } = useFundTrackerContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');

  const insets = useSafeAreaInsets();

  // Filter Pengeluaran
  const filteredExpenses = recentExpenses.filter((exp) => {
    const matchSearch =
      searchQuery === '' ||
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'Semua' || exp.category === activeFilter;
    return matchSearch && matchFilter;
  });

  // Filter Pemasukan
  const filteredDonations = (recentDonations ?? []).filter((don) => {
    const matchSearch =
      searchQuery === '' ||
      don.donator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const renderExpenseItem = useCallback(
    ({ item }: { item: Expense }) => <ExpenseItem expense={item} />,
    []
  );

  const renderDonationItem = useCallback(
    ({ item }: { item: Donation }) => <DonationItem donation={item} />,
    []
  );

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Riwayat Transaksi</Text>
          <View style={styles.verifiedRow}>
            <ShieldCheck size={14} color={AppColors.accent.emerald} />
            <Text style={styles.verifiedText}>
              Buku besar kas terverifikasi sistem
            </Text>
          </View>
        </View>
      </View>

      {/* Segmented Control / Tab Switch */}
      <View style={styles.segmentWrap}>
        <TouchableOpacity 
          style={[styles.segmentBtn, viewType === 'expense' && styles.segmentBtnActive]}
          onPress={() => setViewType('expense')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, viewType === 'expense' && styles.segmentTextActive]}>
            Uang Keluar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentBtn, viewType === 'income' && styles.segmentBtnActive]}
          onPress={() => setViewType('income')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, viewType === 'income' && styles.segmentTextActive]}>
            Tanda Terima (Masuk)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Search size={16} color={AppColors.text.tertiary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={viewType === 'expense' ? "Cari pengeluaran..." : "Cari nama donatur..."}
          placeholderTextColor={AppColors.text.tertiary}
          style={styles.searchInput}
        />
      </View>

      {/* Category Filter — Hanya muncul di Uang Keluar */}
      {viewType === 'expense' && (
        <FlatList
          horizontal
          data={ALL_CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            const catConfig = CATEGORIES.find((c) => c.name === item);
            const color = catConfig?.color ?? AppColors.accent.electric;
            return (
              <View
                onTouchEnd={() => setActiveFilter(item)}
                style={[
                  styles.filterChip,
                  isActive && { backgroundColor: `${color}15`, borderColor: `${color}60` },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && { color, fontWeight: AppFonts.weights.bold },
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          }}
          style={styles.filterScroll}
        />
      )}

      {/* Data List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={AppColors.accent.emerald} />
        </View>
      ) : (viewType === 'expense' && filteredExpenses.length === 0) || (viewType === 'income' && filteredDonations.length === 0) ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? '🔍 Tidak ada hasil yang cocok'
              : viewType === 'expense' ? '📭 Belum ada data pengeluaran' : '📭 Belum ada data saldo masuk'}
          </Text>
        </GlassCard>
      ) : (
        <GlassCard padding={0} style={{ marginHorizontal: 16, marginBottom: insets.bottom + 80, flex: 1 }}>
          <FlatList
            data={viewType === 'expense' ? filteredExpenses : filteredDonations}
            keyExtractor={keyExtractor}
            renderItem={viewType === 'expense' ? renderExpenseItem : renderDonationItem as any}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor={AppColors.accent.emerald}
                colors={[AppColors.accent.emerald]}
              />
            }
          />
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  header: {
    paddingHorizontal: AppSpacing.base,
    paddingTop: AppSpacing.base,
    paddingBottom: AppSpacing.sm,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.xl,
    fontWeight: AppFonts.weights.extrabold,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
  },
  segmentWrap: {
    flexDirection: 'row',
    marginHorizontal: AppSpacing.base,
    backgroundColor: AppColors.bg.tertiary,
    borderRadius: AppRadius.lg,
    padding: 4,
    marginBottom: AppSpacing.md,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: AppSpacing.sm,
    alignItems: 'center',
    borderRadius: AppRadius.md,
  },
  segmentBtnActive: {
    backgroundColor: AppColors.bg.secondary,
    ...AppShadows.sm,
  },
  segmentText: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  segmentTextActive: {
    color: AppColors.text.primary,
    fontWeight: AppFonts.weights.bold,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginHorizontal: AppSpacing.base,
    marginBottom: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
    height: 48,
    backgroundColor: AppColors.bg.secondary,
    borderRadius: AppRadius.xl,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    ...AppShadows.sm,
  },
  searchInput: {
    flex: 1,
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.sm,
  },
  filterScroll: {
    maxHeight: 44,
    minHeight: 44,
    marginBottom: AppSpacing.sm,
  },
  filterList: {
    paddingHorizontal: AppSpacing.base,
    gap: AppSpacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    backgroundColor: AppColors.bg.secondary,
  },
  filterText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: AppSpacing.base,
    paddingTop: AppSpacing.xs,
    paddingBottom: AppSpacing['3xl'],
  },
  emptyCard: {
    margin: AppSpacing.base,
    alignItems: 'center',
    paddingVertical: AppSpacing.xl,
  },
  emptyText: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
});
