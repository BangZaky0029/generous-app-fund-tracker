-- 1. Tabel untuk riwayat notifikasi (In-App)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Fungsi untuk mengirim push via Edge Function
-- Catatan: Fungsi ini akan memanggil Supabase Edge Function yang bertugas ke FCM
CREATE OR REPLACE FUNCTION public.handle_new_donation_notification()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Masukkan ke tabel riwayat untuk Admin
    FOR admin_record IN (SELECT id FROM public.profiles WHERE role = 'admin') LOOP
        INSERT INTO public.notifications (user_id, title, message, data)
        VALUES (
            admin_record.id,
            'Donasi Baru!',
            'Ada donasi sebesar Rp ' || NEW.amount || ' dari ' || NEW.donator_name,
            jsonb_build_object('type', 'new_donation', 'id', NEW.id)
        );
    END LOOP;
    
    -- Trigger HTTP Request ke Edge Function (Bisa diaktifkan di Supabase Dashboard)
    -- Supabase Webhooks lebih disarankan untuk bagian ini.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fungsi untuk notifikasi Transparansi (Pengeluaran Baru)
CREATE OR REPLACE FUNCTION public.handle_new_expense_notification()
RETURNS TRIGGER AS $$
DECLARE
    donatur_record RECORD;
BEGIN
    FOR donatur_record IN (SELECT id FROM public.profiles WHERE role = 'donatur') LOOP
        INSERT INTO public.notifications (user_id, title, message, data)
        VALUES (
            donatur_record.id,
            'Laporan Pengeluaran Baru',
            'Admin baru saja mencatat pengeluaran: ' || NEW.description || ' sebesar Rp ' || NEW.amount,
            jsonb_build_object('type', 'new_expense', 'id', NEW.id)
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fungsi untuk notifikasi Approval Donasi (Ke user spesifik)
CREATE OR REPLACE FUNCTION public.handle_donation_approval_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status = 'pending' AND NEW.status = 'confirmed' AND NEW.donator_id IS NOT NULL) THEN
        INSERT INTO public.notifications (user_id, title, message, data)
        VALUES (
            NEW.donator_id,
            'Donasi Dikonfirmasi',
            'Donasi Anda telah diverifikasi oleh admin. Terima kasih!',
            jsonb_build_object('type', 'donation_confirmed', 'id', NEW.id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER DEFINITIONS
-- Trigger di tabel donations
CREATE TRIGGER tr_on_donation_insert
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_donation_notification();

CREATE TRIGGER tr_on_donation_confirmed
  AFTER UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_approval_notification();

-- Trigger di tabel expenses
CREATE TRIGGER tr_on_expense_insert
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_expense_notification();

-- 6. Fungsi untuk notifikasi Campaign Baru (Semua Donatur)
CREATE OR REPLACE FUNCTION public.handle_new_campaign_notification()
RETURNS TRIGGER AS $$
DECLARE
    donatur_record RECORD;
BEGIN
    FOR donatur_record IN (SELECT id FROM public.profiles WHERE role = 'donatur') LOOP
        INSERT INTO public.notifications (user_id, title, message, data)
        VALUES (
            donatur_record.id,
            '🔥 Wadah Donasi Baru!',
            'Ayo bantu, ada donasi baru: ' || NEW.title,
            jsonb_build_object('type', 'new_campaign', 'id', NEW.id)
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fungsi untuk notifikasi Update Berita (Donatur yg berdonasi di campaign terkait)
CREATE OR REPLACE FUNCTION public.handle_campaign_update_notification()
RETURNS TRIGGER AS $$
DECLARE
    donatur_record RECORD;
    campaign_title text;
BEGIN
    -- Ambil judul campaign
    SELECT title INTO campaign_title FROM public.campaigns WHERE id = NEW.campaign_id;

    -- Kirim notifikasi ke donatur yang pernah berdonasi di campaign ini (status confirmed)
    FOR donatur_record IN (
        SELECT DISTINCT donator_id 
        FROM public.donations 
        WHERE campaign_id = NEW.campaign_id 
        AND status = 'confirmed' 
        AND donator_id IS NOT NULL
    ) LOOP
        INSERT INTO public.notifications (user_id, title, message, data)
        VALUES (
            donatur_record.donator_id,
            '📢 Update Progres: ' || campaign_title,
            'Ada berita terbaru: ' || NEW.title,
            jsonb_build_object('type', 'campaign_update', 'campaign_id', NEW.campaign_id, 'update_id', NEW.id)
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER DEFINITIONS (Lanjutan)
-- Trigger di tabel campaigns
DROP TRIGGER IF EXISTS tr_on_campaign_insert ON public.campaigns;
CREATE TRIGGER tr_on_campaign_insert
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_campaign_notification();

-- Trigger di tabel campaign_updates
DROP TRIGGER IF EXISTS tr_on_campaign_update_insert ON public.campaign_updates;
CREATE TRIGGER tr_on_campaign_update_insert
  AFTER INSERT ON public.campaign_updates
  FOR EACH ROW EXECUTE FUNCTION public.handle_campaign_update_notification();
