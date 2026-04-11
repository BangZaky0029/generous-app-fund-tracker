/**
 * AgentBadge — "Agent Verified" status badge
 * Menunjukkan bahwa data sudah diverifikasi oleh agentic system
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';

type AgentBadgeVariant = 'verified' | 'processing' | 'pending';

type AgentBadgeProps = {
  variant?: AgentBadgeVariant;
  label?: string;
};

const BADGE_CONFIG: Record<AgentBadgeVariant, { color: string; bg: string; text: string }> = {
  verified:   { color: AppColors.accent.emerald, bg: `${AppColors.accent.emerald}20`, text: 'Agent Verified' },
  processing: { color: AppColors.accent.blue,    bg: `${AppColors.accent.blue}20`,    text: 'Processing...'  },
  pending:    { color: AppColors.accent.amber,   bg: `${AppColors.accent.amber}20`,   text: 'Pending'        },
};

export function AgentBadge({ variant = 'verified', label }: AgentBadgeProps) {
  const config = BADGE_CONFIG[variant];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: `${config.color}40` }]}>
      <Bot size={10} color={config.color} strokeWidth={2.5} />
      <Text style={[styles.text, { color: config.color }]}>
        {label ?? config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 3,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: AppFonts.weights.semibold,
    letterSpacing: 0.3,
  },
});
