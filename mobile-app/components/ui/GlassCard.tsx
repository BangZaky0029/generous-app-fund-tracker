/**
 * GlassCard — Reusable Glassmorphism Card
 * Fondasi visual untuk semua komponen bento grid
 */
import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { AppColors, AppRadius, AppShadows, AppSpacing } from '@/constants/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'hero';
  accentColor?: string;
  padding?: number;
};

export function GlassCard({
  children,
  style,
  variant = 'default',
  accentColor,
  padding = AppSpacing.base,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'hero' && styles.hero,
        accentColor ? { borderColor: `${accentColor}30` } : {},
        { padding },
        style,
      ]}
    >
      {/* Top accent line */}
      {accentColor && <View style={[styles.accentLine, { backgroundColor: accentColor }]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: AppColors.glass.bg,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    borderRadius: AppRadius['2xl'],
    overflow: 'hidden',
    ...AppShadows.md,
  },
  elevated: {
    backgroundColor: AppColors.bg.secondary,
    borderColor: AppColors.glass.borderStrong,
    ...AppShadows.lg,
  },
  hero: {
    backgroundColor: AppColors.bg.secondary,
    borderColor: `${AppColors.accent.emerald}30`,
    ...AppShadows.emerald,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: AppRadius.full,
    opacity: 0.8,
  },
});
