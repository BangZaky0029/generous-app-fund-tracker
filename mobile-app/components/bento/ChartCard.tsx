/**
 * ChartCard — Bento Pie Chart Tile
 * Visualisasi distribusi dana menggunakan PieChart dari react-native-gifted-charts
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';
import type { CategorySummary } from '@/constants/types';

type ChartCardProps = {
  categories: CategorySummary[];
  totalExpenses: number;
  totalDonations: number;
};

export function ChartCard({ categories, totalExpenses, totalDonations }: ChartCardProps) {
  // Data untuk pie chart
  const pieData = categories
    .filter((cat) => cat.total > 0)
    .map((cat) => ({
      value: cat.total,
      color: cat.color,
      text: `${cat.percentage.toFixed(0)}%`,
      label: cat.name,
    }));

  // Kalau belum ada data, tampilkan placeholder
  const isEmptyData = pieData.length === 0;
  const emptyData = [{ value: 1, color: AppColors.bg.secondary }];

  const usedPercentage =
    totalDonations > 0
      ? Math.round((totalExpenses / totalDonations) * 100)
      : 0;

  return (
    <GlassCard variant="elevated" style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>Distribusi Dana</Text>
      <Text style={styles.subtitle}>Per kategori pengeluaran</Text>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <PieChart
          data={isEmptyData ? emptyData : pieData}
          donut
          radius={72}
          innerRadius={46}
          innerCircleColor={AppColors.bg.secondary}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerPercentage}>{usedPercentage}%</Text>
              <Text style={styles.centerSubtext}>Terpakai</Text>
            </View>
          )}
          showText={false}
          strokeWidth={2}
          strokeColor={AppColors.bg.secondary}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {categories.map((cat) => (
          <View key={cat.name} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {cat.name}
            </Text>
            <Text style={[styles.legendValue, { color: cat.color }]}>
              {cat.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      {isEmptyData && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Belum ada pengeluaran</Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
    marginBottom: 2,
  },
  subtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
    marginBottom: AppSpacing.base,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: AppSpacing.base,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerPercentage: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.xl,
    fontWeight: AppFonts.weights.extrabold,
  },
  centerSubtext: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
    marginTop: 2,
  },
  legend: {
    gap: AppSpacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: AppRadius.full,
  },
  legendName: {
    flex: 1,
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
  },
  legendValue: {
    fontSize: AppFonts.sizes.xs,
    fontWeight: AppFonts.weights.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: AppSpacing.sm,
  },
  emptyText: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.sm,
  },
});
