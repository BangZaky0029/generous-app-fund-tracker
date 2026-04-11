/**
 * ExpenseItem — Feed Item untuk Transparency Screen
 * Menampilkan detail pengeluaran dengan Agent Verified badge
 */
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Receipt, ChevronRight } from 'lucide-react-native';
import { AgentBadge } from '@/components/ui/AgentBadge';
import { GlassCard } from '@/components/ui/GlassCard';
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard style={styles.card} padding={AppSpacing.md} accentColor={color}>
        <View style={styles.row}>
          {/* Receipt Thumbnail or Icon */}
          <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
            {expense.receipt_url ? (
              <Image source={{ uri: expense.receipt_url }} style={styles.thumbnail} />
            ) : (
              <Receipt size={20} color={color} />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={[styles.catBadge, { backgroundColor: `${color}20` }]}>
                <Text style={[styles.catText, { color }]}>{expense.category}</Text>
              </View>
              <AgentBadge variant="verified" />
            </View>

            <Text style={styles.description} numberOfLines={1}>
              {expense.description ?? 'Tidak ada keterangan'}
            </Text>

            <View style={styles.bottomRow}>
              <Text style={[styles.amount, { color }]}>
                Rp {expense.amount.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.date}>{formatDate(expense.created_at)}</Text>
            </View>

            {expense.profiles?.full_name && (
              <Text style={styles.admin}>
                oleh {expense.profiles.full_name}
              </Text>
            )}
          </View>

          {onPress && (
            <ChevronRight size={16} color={AppColors.text.tertiary} style={styles.chevron} />
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: AppSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: AppSpacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbnail: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  catBadge: {
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 2,
    borderRadius: AppRadius.full,
  },
  catText: {
    fontSize: 10,
    fontWeight: AppFonts.weights.semibold,
  },
  description: {
    color: AppColors.text.primary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: AppFonts.sizes.base,
    fontWeight: AppFonts.weights.bold,
  },
  date: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
  },
  admin: {
    color: AppColors.text.tertiary,
    fontSize: AppFonts.sizes.xs,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: AppSpacing.xs,
  },
});
