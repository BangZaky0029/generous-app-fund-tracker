/**
 * Transparency Feed Screen
 * Daftar lengkap semua pengeluaran + Agent Verified badges
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ShieldCheck } from 'lucide-react-native';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { ExpenseItem } from '@/components/feed/ExpenseItem';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES } from '@/constants/theme';
import type { Expense, ExpenseCategory } from '@/constants/types';

const ALL_CATEGORIES = ['Semua', ...CATEGORIES.map((c) => c.name)] as const;

export default function TransparencyScreen() {
  const { recentExpenses, isLoading, refetch } = useFundTrackerContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Semua');

  const filtered = recentExpenses.filter((exp) => {
    const matchSearch =
      searchQuery === '' ||
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'Semua' || exp.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => <ExpenseItem expense={item} />,
    []
  );

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transparency Feed</Text>
          <View style={styles.verifiedRow}>
            <ShieldCheck size={12} color={AppColors.accent.emerald} />
            <Text style={styles.verifiedText}>
              {recentExpenses.length} pengeluaran terverifikasi agent
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Search size={16} color={AppColors.text.tertiary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari pengeluaran..."
          placeholderTextColor={AppColors.text.tertiary}
          style={styles.searchInput}
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          const catConfig = CATEGORIES.find((c) => c.name === item);
          const color = catConfig?.color ?? AppColors.accent.emerald;
          return (
            <View
              onTouchEnd={() => setActiveFilter(item)}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: `${color}20`, borderColor: `${color}50` },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && { color },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
        style={styles.filterScroll}
      />

      {/* Expense List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={AppColors.accent.emerald} />
        </View>
      ) : filtered.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {searchQuery || activeFilter !== 'Semua'
              ? '🔍 Tidak ada hasil yang cocok'
              : '📭 Belum ada pengeluaran'}
          </Text>
        </GlassCard>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
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
      )}
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
    paddingTop: AppSpacing.base,
    paddingBottom: AppSpacing.sm,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.xl,
    fontWeight: AppFonts.weights.bold,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginHorizontal: AppSpacing.base,
    marginBottom: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
    height: 44,
    backgroundColor: AppColors.bg.secondary,
    borderRadius: AppRadius.xl,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
  },
  searchInput: {
    flex: 1,
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.sm,
  },
  filterScroll: {
    maxHeight: 42,
    marginBottom: AppSpacing.sm,
  },
  filterList: {
    paddingHorizontal: AppSpacing.base,
    gap: AppSpacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.xs,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    backgroundColor: AppColors.glass.bg,
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
