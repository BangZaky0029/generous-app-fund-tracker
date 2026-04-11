-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  donator_name text DEFAULT 'Anonymous'::text,
  amount numeric NOT NULL DEFAULT 0,
  message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT donations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category = ANY (ARRAY['Logistik'::text, 'Operasional'::text, 'Kesehatan'::text, 'Edukasi'::text, 'Lainnya'::text])),
  description text,
  receipt_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.fund_summary (
  id integer NOT NULL DEFAULT nextval('fund_summary_id_seq'::regclass),
  category text UNIQUE,
  total_spent numeric DEFAULT 0,
  percentage_of_total numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT fund_summary_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  role text DEFAULT 'donatur'::text CHECK (role = ANY (ARRAY['admin'::text, 'donatur'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);