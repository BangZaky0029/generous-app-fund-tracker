/**
 * Donation Service
 * CRUD operations untuk tabel donations di Supabase
 */
import { supabase } from '@/lib/supabaseConfig';
import type { Donation, AddDonationForm, DonationStatus } from '@/constants/types';

// --- Ambil semua donasi (descending by created_at) ---
export async function fetchAllDonations(campaignId?: string): Promise<Donation[]> {
  let query = supabase
    .from('donations')
    .select('*, campaigns(title)')
    .order('created_at', { ascending: false });

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Donation[]) ?? [];
}

// --- Hitung total donasi (Hanya yang sudah confirmed) ---
export async function fetchTotalDonations(campaignId?: string, status: DonationStatus = 'confirmed'): Promise<number> {
  let query = supabase
    .from('donations')
    .select('amount')
    .eq('status', status);

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

// --- Hitung total donasi per campaign (Grouping) ---
export async function fetchDonationTotalsGroupByCampaign(status: DonationStatus = 'confirmed'): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('donations')
    .select('campaign_id, amount')
    .eq('status', status);

  if (error) throw new Error(error.message);

  const totals: Record<string, number> = {};
  (data ?? []).forEach(row => {
    if (row.campaign_id) {
      totals[row.campaign_id] = (totals[row.campaign_id] ?? 0) + Number(row.amount);
    }
  });
  return totals;
}

// --- Ambil N donasi terbaru ---
export async function fetchRecentDonations(limit = 5, campaignId?: string): Promise<Donation[]> {
  let query = supabase
    .from('donations')
    .select('*, campaigns(title)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (campaignId) {
    query = query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as Donation[]) ?? [];
}

import { uploadToStorage } from '@/lib/upload';

// --- Tambah donasi baru ---
export async function createDonation(form: AddDonationForm & { campaign_id: string }): Promise<Donation> {
  let proofUrl: string | null = null;
  
  if (form.receiptLocalUri) {
    // Gunakan folder 'receipts' sesuai instruksi user
    proofUrl = await uploadToStorage(form.receiptLocalUri, 'receipts', 'donations');
  }

  const payload = {
    campaign_id: form.campaign_id,
    donator_name: form.donator_name.trim() || 'Hamba Allah',
    amount: parseFloat(form.amount),
    message: form.message.trim() || null,
    payment_proof_url: proofUrl,
    status: 'pending', // Default pending sampai dikonfirmasi admin
  };

  const { data, error } = await supabase
    .from('donations')
    .insert(payload)
    .select('*, campaigns(title)')
    .single();

  if (error) throw new Error(error.message);
  return data as Donation;
}

// --- Konfirmasi Donasi (Admin Only) ---
export async function confirmDonation(id: string, status: 'confirmed' | 'rejected' = 'confirmed'): Promise<void> {
  const { error } = await supabase
    .from('donations')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
// --- Hapus donasi ---
export async function deleteDonation(id: string): Promise<void> {
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
