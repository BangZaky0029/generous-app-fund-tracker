/**
 * AnimatedProgressBar — Bento Grid Progress Indicator
 * Menggunakan react-native-reanimated untuk animasi smooth
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppColors, AppFonts, AppRadius, AppSpacing } from '@/constants/theme';

type ProgressBarProps = {
  percentage: number;   // 0–100
  color: string;
  label?: string;
  showPercentage?: boolean;
  height?: number;
  animationDuration?: number;
};

export function AnimatedProgressBar({
  percentage,
  color,
  label,
  showPercentage = true,
  height = 8,
  animationDuration = 800,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Micro-animation: progress bar grows saat data berubah
    progress.value = withTiming(Math.min(percentage, 100) / 100, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && (
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color }]}>{percentage.toFixed(1)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, height, borderRadius: height },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: AppSpacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: AppColors.text.secondary,
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.medium,
    flex: 1,
  },
  percentage: {
    fontSize: AppFonts.sizes.sm,
    fontWeight: AppFonts.weights.bold,
    minWidth: 42,
    textAlign: 'right',
  },
  track: {
    backgroundColor: AppColors.bg.secondary,
    borderRadius: AppRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: AppRadius.full,
  },
});
