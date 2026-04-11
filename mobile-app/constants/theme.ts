/**
 * 2026 Design System — Generous Fund Tracker
 * Clean Light Theme + Soft Neumorphism (Fintech Style)
 */

export const AppColors = {
  // === BACKGROUNDS ===
  bg: {
    primary: '#F8FAFC',      // Slate 50 — layar utama (off-white)
    secondary: '#FFFFFF',    // Pure White — card base
    tertiary: '#F1F5F9',     // Slate 100 — form input/navbar
  },

  // === ACCENT COLORS (Soft Pastel Vibrancy) ===
  accent: {
    emerald: '#10B981',      // Donasi / Income (Vibrant Mint)
    emeraldDim: '#D1FAE5',   // Very Soft Mint
    blue: '#3B82F6',         // Info / chart (Bright Blue)
    blueDim: '#DBEAFE',      // Very Soft Blue
    electric: '#6366F1',     // Indigo / Kamera
    electricDim: '#E0E7FF',  // Soft Indigo
    amber: '#F59E0B',        // Logistik (Warm Mango)
    amberdDim: '#FEF3C7',    // Soft Yellow
    red: '#EF4444',          // Kesehatan / Out (Coral Red)
    redDim: '#FEE2E2',       // Soft Red
    violet: '#8B5CF6',       // Lainnya
    violetDim: '#EDE9FE',    // Soft Lavender
  },

  // === GLASSMORPHISM / NEUMORPHISM (Light Mode) ===
  glass: {
    bg: '#FFFFFF',
    bgHover: '#F8FAFC',
    border: '#E2E8F0',       // Slate 200 — garis pinggir soft
    borderStrong: '#CBD5E1', // Slate 300
    shadow: 'rgba(15, 23, 42, 0.05)', // Bayangan hitam sangat samar
  },

  // === TEXT ===
  text: {
    primary: '#0F172A',      // Slate 900 — Judul & nominal
    secondary: '#475569',    // Slate 600 — Deskripsi / Muted
    tertiary: '#94A3B8',     // Slate 400 — Waktu / Hint
    white: '#FFFFFF',        // Tetap putih untuk tombol berlatar warna
    inverse: '#F8FAFC',
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

// === BORDER RADIUS (Bento Grid / Neumorphism) ===
export const AppRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
};

// === SHADOWS (Light Theme Drop Shadows) ===
export const AppShadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2, // Android
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  emerald: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
};

// === LEGACY COMPAT ===
export const Colors = {
  light: {
    text: AppColors.text.primary,
    background: AppColors.bg.primary,
    tint: AppColors.accent.emerald,
    icon: AppColors.text.secondary,
    tabIconDefault: AppColors.text.tertiary,
    tabIconSelected: AppColors.accent.emerald,
  },
  dark: {
    text: AppColors.text.inverse,
    background: AppColors.bg.primary,
    tint: AppColors.accent.electric,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: AppColors.accent.electric,
  },
};

export const Fonts = {
  sans: 'System',
};
