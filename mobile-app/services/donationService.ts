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
  // Ambil semua field untuk menghindari issue seleksi kolom parsial pada FK
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('status', status);

  if (error) throw new Error(error.message);

  const totals: Record<string, number> = {};
  (data ?? []).forEach(row => {
    // Pastikan campaign_id benar-benar ada dan dikonversi ke string murni
    if (row.campaign_id) {
      const campId = String(row.campaign_id).trim();
      const amount = parseFloat(row.amount) || 0;
      totals[campId] = (totals[campId] ?? 0) + amount;
    } else {
       // Log internal sederhana jika ada donasi 'Yatim' (tanpa campaign)
       totals['umum'] = (totals['umum'] ?? 0) + (parseFloat(row.amount) || 0);
    }
  });
  return totals;
}

// --- Hitung statistik donor per campaign (Top Donor & Total Donors) ---
export async function fetchCampaignStats(): Promise<Record<string, { total_donors: number, top_donator_name: string, top_donator_amount: number }>> {
  const { data, error } = await supabase
    .from('donations')
    .select('campaign_id, donator_name, amount')
    .eq('status', 'confirmed');

  if (error) throw new Error(error.message);

  const stats: Record<string, { total_donors: number, top_donator_name: string, top_donator_amount: number, max_donation: number }> = {};
  
  (data ?? []).forEach(row => {
    const campId = String(row.campaign_id || 'umum').trim();
    if (!stats[campId]) {
      stats[campId] = { total_donors: 0, top_donator_name: '-', top_donator_amount: 0, max_donation: 0 };
    }
    
    stats[campId].total_donors += 1;
    const amount = parseFloat(row.amount) || 0;
    if (amount > stats[campId].max_donation) {
       stats[campId].max_donation = amount;
       stats[campId].top_donator_name = row.donator_name || 'Hamba Allah';
       stats[campId].top_donator_amount = amount;
    }
  });
  
  return stats as any;
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

// --- Ambil donasi berdasarkan ID donatur (untuk Riwayat Privat) ---
export async function fetchUserDonations(userId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title)')
    .eq('donator_id', userId)
    .order('created_at', { ascending: false });

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
    donator_id: form.donator_id || null,
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
