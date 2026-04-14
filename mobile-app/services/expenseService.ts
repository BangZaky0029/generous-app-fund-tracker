/**
 * Expense Service
 * CRUD + Upload Receipt ke Supabase Storage
 */
import { supabase } from '@/lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
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

// --- Upload foto struk ke Supabase Storage ---
export async function uploadReceipt(
  localUri: string,
  adminId: string
): Promise<string | null> {
  try {
    const fileName = `receipt_${adminId}_${Date.now()}.jpg`;
    const filePath = `${adminId}/${fileName}`;

    // Baca file sebagai base64 string
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 ke Uint8Array tanpa atob() (tidak tersedia di Hermes/RN)
    const binaryLen = base64.length;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

    const outputLen = Math.floor((binaryLen * 3) / 4) -
      (base64[binaryLen - 1] === '=' ? 1 : 0) -
      (base64[binaryLen - 2] === '=' ? 1 : 0);
    const bytes = new Uint8Array(outputLen);
    let p = 0;
    for (let i = 0; i < binaryLen; i += 4) {
      const a = lookup[base64.charCodeAt(i)];
      const b = lookup[base64.charCodeAt(i + 1)];
      const c = lookup[base64.charCodeAt(i + 2)];
      const d = lookup[base64.charCodeAt(i + 3)];
      bytes[p++] = (a << 2) | (b >> 4);
      if (p < outputLen) bytes[p++] = ((b & 15) << 4) | (c >> 2);
      if (p < outputLen) bytes[p++] = ((c & 3) << 6) | (d & 63);
    }

    const { error } = await supabase.storage
      .from('receipts')
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Upload] Storage error:', error.message);
      return null;
    }

    // Dapatkan public URL
    const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (err) {
    console.error('[Upload] Error:', err);
    return null;
  }
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
    receiptUrl = await uploadReceipt(params.receiptLocalUri, params.admin_id);
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
