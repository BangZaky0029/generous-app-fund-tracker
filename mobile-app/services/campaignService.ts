/**
 * Campaign Service
 * CRUD operations untuk tabel campaigns dan campaign_updates di Supabase
 */
import { supabase } from '@/lib/supabaseConfig';
import type { Campaign, CampaignUpdate } from '@/constants/types';
import { uploadToStorage } from '@/lib/upload';

// --- Ambil semua campaign yang aktif ---
export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Campaign[]) ?? [];
}

// --- Ambil satu campaign berdasarkan ID ---
export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Campaign;
}

// --- Ambil update berita untuk satu campaign ---
export async function fetchCampaignUpdates(campaignId: string): Promise<CampaignUpdate[]> {
  const { data, error } = await supabase
    .from('campaign_updates')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CampaignUpdate[]) ?? [];
}

// --- Tambah campaign baru ---
export async function createCampaign(params: {
  title: string;
  category: string;
  description: string;
  target_amount: number;
  admin_id: string;
  posterLocalUri?: string | null;
}): Promise<Campaign> {
  let posterUrl: string | null = null;

  if (params.posterLocalUri) {
    posterUrl = await uploadToStorage(params.posterLocalUri, 'receipts', 'posters');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      title: params.title,
      category: params.category,
      description: params.description,
      target_amount: params.target_amount,
      admin_id: params.admin_id,
      poster_url: posterUrl,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Campaign;
}

// --- Tambah update berita ---
export async function addCampaignUpdate(params: {
  campaign_id: string;
  title: string;
  content: string;
  imageLocalUri?: string | null;
}): Promise<CampaignUpdate> {
  let imageUrl: string | null = null;

  if (params.imageLocalUri) {
    imageUrl = await uploadToStorage(params.imageLocalUri, 'receipts', 'updates');
  }

  const { data, error } = await supabase
    .from('campaign_updates')
    .insert({
      campaign_id: params.campaign_id,
      title: params.title,
      content: params.content,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CampaignUpdate;
}
