/**
 * HeroCard — Bento Hero Tile (Full Width)
 * Menampilkan Total Dana Terkumpul + sisa dana
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TrendingUp, Wallet } from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';

type HeroCardProps = {
  totalDonations: number;
  totalExpenses: number;
  remainingFunds: number;
  usagePercentage: number;
  isLoading: boolean;
};

export function HeroCard({
  totalDonations,
  totalExpenses,
  remainingFunds,
  usagePercentage,
  isLoading,
}: HeroCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (!isLoading) {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withSpring(0, { damping: 15 });
    }
  }, [isLoading]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const formatRupiah = (amount: number) => {
    if (amount >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <GlassCard variant="hero" style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.subtitle}>Total Dana Generous</Text>
        </View>
        <View style={styles.walletIcon}>
          <Wallet size={20} color={AppColors.accent.emerald} />
        </View>
      </View>

      {/* Main Amount */}
      <Animated.View style={animStyle}>
        <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
          {isLoading ? 'Memuat...' : `Rp ${totalDonations.toLocaleString('id-ID')}`}
        </Text>
      </Animated.View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Terpakai</Text>
          <Text style={[styles.statValue, { color: AppColors.accent.amber }]}>
            {formatRupiah(totalExpenses)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sisa Dana</Text>
          <Text style={[styles.statValue, { color: AppColors.accent.emerald }]}>
            {formatRupiah(remainingFunds)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <View style={styles.trendRow}>
            <TrendingUp size={12} color={AppColors.accent.blue} />
            <Text style={styles.statLabel}> Penyerapan</Text>
          </View>
          <Text style={[styles.statValue, { color: AppColors.accent.blue }]}>
            {usagePercentage.toFixed(1)}%
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: AppSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: AppSpacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${AppColors.accent.emerald}20`,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 3,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: `${AppColors.accent.emerald}30`,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.accent.emerald,
  },
  liveText: {
    color: AppColors.accent.emerald,
    fontSize: 10,
    fontWeight: AppFonts.weights.bold,
    letterSpacing: 1,
  },
  subtitle: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: AppRadius.md,
    backgroundColor: `${AppColors.accent.emerald}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    color: AppColors.text.white,
    fontSize: AppFonts.sizes['3xl'],
    fontWeight: AppFonts.weights.extrabold,
    letterSpacing: -1,
    marginBottom: AppSpacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: AppSpacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.glass.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
    fontWeight: AppFonts.weights.medium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.bold,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: AppColors.glass.border,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
