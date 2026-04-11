/**
 * 2026 Design System — Generous Fund Tracker
 * Bento Grid + Glassmorphism 2.0 | Dark Mode Only
 */

export const AppColors = {
  // === BACKGROUNDS ===
  bg: {
    primary: '#0F172A',      // Midnight Navy — layar utama
    secondary: '#1E293B',    // Slate 800 — card base
    tertiary: '#0D1B2E',     // Darker navy — navbar
  },

  // === ACCENT COLORS ===
  accent: {
    emerald: '#10B981',      // Donasi / income
    emeraldDim: '#065F46',   // Emerald background dim
    blue: '#3B82F6',         // Info / chart
    blueDim: '#1E3A5F',      // Blue background dim
    electric: '#6366F1',     // Highlight interaksi
    electricDim: '#312E81',  // Electric dim
    amber: '#F59E0B',        // Logistik
    amberdDim: '#78350F',    // Amber dim
    red: '#EF4444',          // Kesehatan / danger
    redDim: '#7F1D1D',       // Red dim
    violet: '#8B5CF6',       // Lainnya
    violetDim: '#4C1D95',    // Violet dim
  },

  // === GLASSMORPHISM ===
  glass: {
    bg: 'rgba(255, 255, 255, 0.04)',
    bgHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },

  // === TEXT ===
  text: {
    primary: '#F1F5F9',      // Teks utama
    secondary: '#94A3B8',    // Teks muted
    tertiary: '#475569',     // Teks sangat muted
    white: '#FFFFFF',
    inverse: '#0F172A',
  },

  // === STATUS ===
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

// === CATEGORY CONFIG ===
export type ExpenseCategory = 'Logistik' | 'Operasional' | 'Kesehatan' | 'Edukasi' | 'Lainnya';

export const CATEGORIES: {
  name: ExpenseCategory;
  color: string;
  dimColor: string;
  icon: string;
}[] = [
  { name: 'Logistik',    color: AppColors.accent.amber,   dimColor: AppColors.accent.amberdDim,  icon: 'truck' },
  { name: 'Operasional', color: AppColors.accent.blue,    dimColor: AppColors.accent.blueDim,    icon: 'settings' },
  { name: 'Kesehatan',   color: AppColors.accent.red,     dimColor: AppColors.accent.redDim,     icon: 'heart-pulse' },
  { name: 'Edukasi',     color: AppColors.accent.emerald, dimColor: AppColors.accent.emeraldDim, icon: 'graduation-cap' },
  { name: 'Lainnya',     color: AppColors.accent.violet,  dimColor: AppColors.accent.violetDim,  icon: 'more-horizontal' },
];

// === TYPOGRAPHY ===
export const AppFonts = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 48,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// === SPACING ===
export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// === BORDER RADIUS (Bento Grid Style) ===
export const AppRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
};

// === SHADOWS ===
export const AppShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  emerald: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// === LEGACY COMPAT (untuk hook useColorScheme bawaan Expo) ===
export const Colors = {
  light: {
    text: AppColors.text.inverse,
    background: '#FFFFFF',
    tint: AppColors.accent.blue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: AppColors.accent.blue,
  },
  dark: {
    text: AppColors.text.primary,
    background: AppColors.bg.primary,
    tint: AppColors.accent.emerald,
    icon: AppColors.text.secondary,
    tabIconDefault: AppColors.text.tertiary,
    tabIconSelected: AppColors.accent.emerald,
  },
};

export const Fonts = {
  sans: 'System',
};
