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

export type Campaign = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  poster_url: string | null;
  status: 'active' | 'completed';
  admin_id: string | null;
  created_at: string;
};

export type CampaignUpdate = {
  id: string;
  campaign_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

export type DonationStatus = 'pending' | 'confirmed' | 'rejected';

export type Donation = {
  id: string;
  campaign_id: string | null;
  donator_name: string;
  amount: number;
  message: string | null;
  receipt_url: string | null; // This might be used for something else, adding payment_proof_url for naming consistency with SQL
  payment_proof_url: string | null;
  status: DonationStatus;
  created_at: string;
  campaigns?: Campaign; // joined
};

export type ExpenseCategory =
  | 'Logistik'
  | 'Operasional'
  | 'Kesehatan'
  | 'Edukasi'
  | 'Lainnya';

export type Expense = {
  id: string;
  campaign_id: string | null;
  admin_id: string | null;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
  profiles?: Profile; // joined
  campaigns?: Campaign; // joined
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
  totalDonations: number,
  totalDonationsPending: number,
  totalExpenses: number,
  remainingFunds: number,
  usagePercentage: number,
  categories: CategorySummary[];
  recentExpenses: Expense[];
  recentDonations: Donation[];
  activeCampaigns: Campaign[]; // New
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
  receiptLocalUri?: string | null;
  status?: DonationStatus; // Added for flexibility in UI calls
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
