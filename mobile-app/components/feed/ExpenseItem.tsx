/**
 * ExpenseItem — Feed Item untuk Transparency Screen
 * Desain Fintech Clean List Row
 */
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Receipt, ChevronRight } from 'lucide-react-native';
import { AgentBadge } from '@/components/ui/AgentBadge';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES } from '@/constants/theme';
import type { Expense } from '@/constants/types';

type ExpenseItemProps = {
  expense: Expense;
  onPress?: () => void;
};

export function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
  const catConfig = CATEGORIES.find((c) => c.name === expense.category);
  const color = catConfig?.color ?? AppColors.text.secondary;

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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={styles.row}>
        {/* Left: Icon or Thumbnail */}
        <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
          {expense.receipt_url ? (
            <Image source={{ uri: expense.receipt_url }} style={styles.thumbnail} />
          ) : (
            <Receipt size={22} color={color} strokeWidth={2} />
          )}
        </View>

        {/* Middle: Info */}
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description ?? 'Tidak ada deskripsi'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{formatDate(expense.created_at)}</Text>
            {expense.profiles?.full_name && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.admin} numberOfLines={1}>
                  {expense.profiles.full_name.split(' ')[0]}
                </Text>
              </>
            )}
          </View>
          <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            <AgentBadge variant="verified" />
          </View>
        </View>

        {/* Right: Amount & Category */}
        <View style={styles.rightSect}>
          <Text style={[styles.amount, { color }]}>
            - Rp {expense.amount.toLocaleString('id-ID')}
          </Text>
          <View style={[styles.catBadge, { backgroundColor: `${color}10` }]}>
            <Text style={[styles.catText, { color }]}>{expense.category}</Text>
          </View>
        </View>

        {onPress && (
          <ChevronRight size={16} color={AppColors.text.tertiary} style={styles.chevron} />
        )}
      </View>
      {/* Separator / Divider */}
      <View style={styles.separator} />
    </TouchableOpacity>
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
    backgroundColor: AppColors.glass.border, // Sangat tipis dan soft
    marginLeft: 60, // Align dengan teks konten
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24, // Bulat sempurna
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbnail: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.semibold,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.xs,
  },
  dot: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
    marginHorizontal: 4,
  },
  admin: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
    maxWidth: 80, // Hindari tertumpuk
  },
  rightSect: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
    fontSize: AppFonts.sizes.md,
    fontWeight: AppFonts.weights.bold,
  },
  catBadge: {
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 2,
    borderRadius: AppRadius.sm,
  },
  catText: {
    fontSize: 9,
    fontWeight: AppFonts.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chevron: {
    marginLeft: 2,
  },
});
