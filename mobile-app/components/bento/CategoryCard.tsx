/**
 * CategoryCard — Bento Category Tile (kecil)
 * Menampilkan satu kategori dengan progress bar
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Truck, Settings, HeartPulse, GraduationCap, MoreHorizontal,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedProgressBar } from '@/components/ui/ProgressBar';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';
import type { CategorySummary } from '@/constants/types';

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  'truck':           (c) => <Truck size={16} color={c} />,
  'settings':        (c) => <Settings size={16} color={c} />,
  'heart-pulse':     (c) => <HeartPulse size={16} color={c} />,
  'graduation-cap':  (c) => <GraduationCap size={16} color={c} />,
  'more-horizontal': (c) => <MoreHorizontal size={16} color={c} />,
};

type CategoryCardProps = {
  category: CategorySummary;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const renderIcon = ICONS[category.icon];

  const formatRupiah = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}Jt`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}K`;
    }
    return `${amount}`;
  };

  return (
    <GlassCard
      accentColor={category.color}
      style={styles.card}
      padding={AppSpacing.md}
    >
      {/* Icon + Name */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${category.color}20` }]}>
          {renderIcon(category.color)}
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
      <Text style={[styles.amount, { color: category.color }]}>
        Rp {formatRupiah(category.total)}
      </Text>

      <AnimatedProgressBar
        percentage={category.percentage}
        color={category.color}
        showPercentage={false}
        height={5}
        animationDuration={1000}
      />
      <Text style={[styles.percentage, { color: category.color }]}>
        {category.percentage.toFixed(1)}%
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
  },
  header: {
    marginBottom: AppSpacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
    fontWeight: AppFonts.weights.medium,
    marginBottom: 2,
  },
  amount: {
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.bold,
    marginBottom: AppSpacing.sm,
  },
  percentage: {
    fontSize: AppFonts.sizes.xs,
    fontWeight: AppFonts.weights.semibold,
    marginTop: 4,
    textAlign: 'right',
  },
});
