-- SQL SCRIPT TO FIX STORAGE RLS (Run this in Supabase SQL Editor)
-- This allows admins to upload receipts and everyone to view them (transparency)

-- 1. Ensure the 'receipts' bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies for this bucket to avoid conflicts during setup
DROP POLICY IF EXISTS "Allow Public Access to Receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Admin Delete" ON storage.objects;

-- 3. Policy: Allow Public Access (SELECT)
-- This makes receipts viewable by everyone in the public apps
CREATE POLICY "Allow Public Access to Receipts"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- 4. Policy: Allow Authenticated Upload (INSERT)
-- Only allow logged-in users to upload to the receipts bucket
CREATE POLICY "Allow Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);

-- 5. Policy: Allow Authenticated Delete (Optional but recommended for management)
CREATE POLICY "Allow Admin Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND 
  auth.role() = 'authenticated'
);
