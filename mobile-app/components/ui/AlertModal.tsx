import React from 'react';
import { 
  View, Text, Modal, TouchableOpacity, 
  StyleSheet, Animated, Dimensions 
} from 'react-native';
import { 
  CheckCircle2, AlertCircle, Info, 
  X, AlertTriangle 
} from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows } from '@/constants/theme';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'Siap',
  cancelText = 'Batal',
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, fadeAnim]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={32} color={AppColors.accent.emerald} />;
      case 'error': return <AlertCircle size={32} color={AppColors.accent.red} />;
      case 'warning': return <AlertTriangle size={32} color={AppColors.accent.amber} />;
      default: return <Info size={32} color={AppColors.accent.blue} />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success': return AppColors.accent.emerald;
      case 'error': return AppColors.accent.red;
      case 'warning': return AppColors.accent.amber;
      default: return AppColors.accent.blue;
    }
  };

  if (!shouldRender) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
           <TouchableOpacity 
             activeOpacity={1} 
             style={StyleSheet.absoluteFill} 
             onPress={onConfirm ? undefined : onClose} 
           />
        </Animated.View>

        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              }) }]
            }
          ]}
        >
          <GlassCard variant="elevated" style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: `${getAccentColor()}15` }]}>
              {getIcon()}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actions}>
              {onConfirm && (
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: getAccentColor() }]} 
                onPress={onConfirm ? onConfirm : onClose}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 14, 32, 0.8)',
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    alignItems: 'center',
    padding: AppSpacing.xl,
    gap: AppSpacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppSpacing.sm,
  },
  title: {
    color: AppColors.text.primary,
    fontSize: 20,
    fontWeight: AppFonts.weights.bold,
    textAlign: 'center',
  },
  message: {
    color: AppColors.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: AppSpacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: AppRadius.md,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: AppColors.text.secondary,
    fontSize: 14,
    fontWeight: AppFonts.weights.bold,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: AppRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...AppShadows.md,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: AppFonts.weights.bold,
  },
});
