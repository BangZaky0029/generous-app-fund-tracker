/**
 * DonationItem — Feed Item untuk Transparency Screen
 * Desain Fintech Clean List Row khusus Uang Masuk
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDownCircle } from 'lucide-react-native';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';
import type { Donation } from '@/constants/types';

type DonationItemProps = {
  donation: Donation;
};

export function DonationItem({ donation }: DonationItemProps) {
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: Icon */}
        <View style={styles.iconWrap}>
          <ArrowDownCircle size={24} color={AppColors.accent.emerald} strokeWidth={2} />
        </View>

        {/* Middle: Info */}
        <View style={styles.content}>
          <Text style={styles.donatorName} numberOfLines={1}>
            {donation.donator_name}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {donation.message && donation.message.length > 1 ? donation.message : 'Tanpa pesan'}
          </Text>
          <Text style={styles.date}>{formatDate(donation.created_at)}</Text>
        </View>

        {/* Right: Amount */}
        <View style={styles.rightSect}>
          <Text style={styles.amount}>
            + Rp {donation.amount.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
      {/* Separator / Divider */}
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: AppSpacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingBottom: AppSpacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.glass.border,
    marginLeft: 60, // Align dengan teks konten
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.accent.emerald}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  donatorName: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.bold,
  },
  message: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
  },
  date: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
  },
  rightSect: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    color: AppColors.accent.emerald,
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
});
