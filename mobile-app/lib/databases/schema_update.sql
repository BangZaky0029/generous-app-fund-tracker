-- === 1. CREATE CAMPAIGNS TABLE ===
CREATE TABLE public.campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL, -- Admin input bebas
  description text,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  poster_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'completed'])),
  admin_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id)
);

-- === 2. CREATE CAMPAIGN UPDATES TABLE ===
CREATE TABLE public.campaign_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_updates_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_updates_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE
);

-- === 3. MODIFY DONATIONS TABLE ===
-- Menambahkan campaign_id, status konfirmasi, dan link bukti transfer
ALTER TABLE public.donations ADD COLUMN campaign_id uuid REFERENCES public.campaigns(id);
ALTER TABLE public.donations ADD COLUMN status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'confirmed', 'rejected']));
ALTER TABLE public.donations ADD COLUMN payment_proof_url text;

-- === 4. MODIFY EXPENSES TABLE ===
-- Menambahkan campaign_id untuk melacak pengeluaran per wadah
ALTER TABLE public.expenses ADD COLUMN campaign_id uuid REFERENCES public.campaigns(id);

-- === 5. RLS POLICIES ===

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

-- Policies for Campaigns
CREATE POLICY "Campaigns are viewable by everyone" ON public.campaigns
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies for Campaign Updates
CREATE POLICY "Updates are viewable by everyone" ON public.campaign_updates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage updates" ON public.campaign_updates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update Donations Policies (Donatur can insert, Admin can view/update)
CREATE POLICY "Donaturs can insert donations" ON public.donations
  FOR INSERT WITH CHECK (true); -- Izinkan insert anonim/donatur

CREATE POLICY "Admins can management donations" ON public.donations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- === 6. STORAGE BUCKETS (REMARKS) ===
-- Pastikan buat bucket 'payment' dan 'campaigns' di Supabase Storage Dashboard
-- Set public jika ingin poster bisa diakses publik.
