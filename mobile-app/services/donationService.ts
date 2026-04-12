/**
 * Donation Service
 * CRUD operations untuk tabel donations di Supabase
 */
import { supabase } from '@/lib/supabaseConfig';
import type { Donation, AddDonationForm } from '@/constants/types';

// --- Ambil semua donasi (descending by created_at) ---
export async function fetchAllDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Donation[]) ?? [];
}

// --- Hitung total donasi ---
export async function fetchTotalDonations(): Promise<number> {
  const { data, error } = await supabase
    .from('donations')
    .select('amount');

  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

// --- Ambil N donasi terbaru ---
export async function fetchRecentDonations(limit = 5): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as Donation[]) ?? [];
}

import { uploadToStorage } from '@/lib/upload';

// --- Tambah donasi baru ---
export async function createDonation(form: AddDonationForm): Promise<Donation> {
  let receiptUrl: string | null = null;
  
  if (form.receiptLocalUri) {
    receiptUrl = await uploadToStorage(form.receiptLocalUri, 'receipts', 'donations');
  }

  const payload = {
    donator_name: form.donator_name.trim() || 'Hamba Allah',
    amount: parseFloat(form.amount),
    message: form.message.trim() || null,
    receipt_url: receiptUrl,
  };

  const { data, error } = await supabase
    .from('donations')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Donation;
}
// --- Hapus donasi ---
export async function deleteDonation(id: string): Promise<void> {
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
