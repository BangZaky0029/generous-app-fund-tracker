/**
 * Expense Service
 * CRUD + Upload Receipt ke Supabase Storage
 */
import { supabase } from '@/lib/supabaseConfig';
import { uploadToStorage } from '@/lib/upload';
import type { Expense, ExpenseCategory } from '@/constants/types';

// --- Ambil semua expenses ---
export async function fetchAllExpenses(campaignId?: string): Promise<Expense[]> {
  console.log('[ExpenseService] Fetching all expenses...');
  let query = supabase
    .from('expenses')
    .select('*, profiles(full_name, role), campaigns(title)');

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[ExpenseService] Error:', error.message);
    throw new Error(error.message);
  }
  return (data as Expense[]) ?? [];
}

// --- Ambil N expenses terbaru ---
export async function fetchRecentExpenses(limit = 10, campaignId?: string): Promise<Expense[]> {
  console.log(`[ExpenseService] Fetching recent ${limit} expenses...`);
  try {
    let query = supabase
      .from('expenses')
      .select('*, profiles(full_name, role), campaigns(title)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ExpenseService] Supabase Error:', error.message);
      throw new Error(error.message);
    }
    return (data as Expense[]) ?? [];
  } catch (err) {
    console.error('[ExpenseService] Network/Unknown Error:', err);
    throw err;
  }
}

// --- Hitung total expenses per kategori ---
export async function fetchExpensesByCategory(campaignId?: string): Promise<
  Record<ExpenseCategory, number>
> {
  let query = supabase
    .from('expenses')
    .select('category, amount');

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const result: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    result[row.category] = (result[row.category] ?? 0) + Number(row.amount);
  });
  return result as Record<ExpenseCategory, number>;
}

// --- Hitung total expenses per campaign ---
export async function fetchExpenseTotalsGroupByCampaign(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('expenses')
    .select('campaign_id, amount');

  if (error) throw new Error(error.message);

  const result: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    const cid = String(row.campaign_id).trim();
    result[cid] = (result[cid] ?? 0) + Number(row.amount);
  });

  return result;
}

// --- Tambah expense baru (dengan optional upload receipt) ---
export async function createExpense(params: {
  admin_id: string;
  campaign_id: string; // Wajib di sistem baru
  amount: number;
  category: ExpenseCategory;
  description: string;
  receiptLocalUri?: string | null;
}): Promise<Expense> {
  let receiptUrl: string | null = null;

  if (params.receiptLocalUri) {
    // Gunakan utility uploadToStorage yang sudah ada (folder: adminId, bucket: receipts)
    receiptUrl = await uploadToStorage(params.receiptLocalUri, 'receipts', params.admin_id);
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      admin_id: params.admin_id,
      campaign_id: params.campaign_id,
      amount: params.amount,
      category: params.category,
      description: params.description.trim() || null,
      receipt_url: receiptUrl,
    })
    .select('*, profiles(full_name, role), campaigns(title)')
    .single();

  if (error) throw new Error(error.message);
  return data as Expense;
}

// --- Hapus expense ---
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
