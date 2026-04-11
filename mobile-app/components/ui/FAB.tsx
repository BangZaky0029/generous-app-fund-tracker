/**
 * FAB — Floating Action Button
 * Tombol utama untuk "Tambah Pengeluaran"
 */
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { AppColors, AppRadius, AppShadows } from '@/constants/theme';

type FABProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
  icon?: React.ReactNode;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FAB({
  onPress,
  style,
  color = AppColors.accent.emerald,
  icon,
}: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.fab,
        { backgroundColor: color },
        AppShadows.emerald,
        animatedStyle,
        style,
      ]}
    >
      {icon ?? <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: AppRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
