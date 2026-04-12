/**
 * Global TypeScript Types
 * Generous Fund Tracker App
 */

// ========== DATABASE TYPES ==========

export type UserRole = 'admin' | 'donatur';

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  updated_at: string;
};

export type Donation = {
  id: string;
  donator_name: string;
  amount: number;
  message: string | null;
  created_at: string;
};

export type ExpenseCategory =
  | 'Logistik'
  | 'Operasional'
  | 'Kesehatan'
  | 'Edukasi'
  | 'Lainnya';

export type Expense = {
  id: string;
  admin_id: string | null;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
  profiles?: Profile; // joined
};

export type FundSummary = {
  id: number;
  category: ExpenseCategory | null;
  total_spent: number;
  percentage_of_total: number;
  last_updated: string;
};

// ========== COMPUTED TYPES ==========

export type CategorySummary = {
  name: ExpenseCategory;
  total: number;
  percentage: number;
  color: string;
  dimColor: string;
  icon: string;
};

export type FundTrackerState = {
  totalDonations: number;
  totalExpenses: number;
  remainingFunds: number;
  usagePercentage: number;
  categories: CategorySummary[];
  recentExpenses: Expense[];
  recentDonations: Donation[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
};

// ========== FORM TYPES ==========

export type AddExpenseForm = {
  amount: string;
  category: ExpenseCategory;
  description: string;
  receiptUri: string | null;
  receiptBase64: string | null;
};

export type AddDonationForm = {
  donator_name: string;
  amount: string;
  message: string;
};

// ========== OCR TYPES ==========

export type OcrResult = {
  ParsedResults?: {
    ParsedText: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }[];
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[] | null;
};

export type ParsedReceiptData = {
  amount: number | null;
  date: string | null;
  rawText: string;
};

// ========== AUTH TYPES ==========

export type AuthUser = {
  id: string;
  email: string | null;
  profile: Profile | null;
};
