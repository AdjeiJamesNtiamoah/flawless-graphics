-- ============================================================================
-- Migration: Create public.organizations Table
-- Project: FLAWLESS GRAPHICS — LUCY™ Management System
-- Date: 2026-09-05
-- ============================================================================

-- 1. Ensure uuid-ossp extension is enabled in extensions schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create public.organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid not null default extensions.uuid_generate_v4 (),
  auth_user_id uuid null,
  org_name text not null,
  admin_name text not null,
  email text not null,
  logo_path text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint organizations_pkey primary key (id),
  constraint organizations_org_name_key unique (org_name)
) TABLESPACE pg_default;

-- If table already existed without auth_user_id or org_id, add them safely
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS auth_user_id uuid;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_id TEXT;
UPDATE public.organizations SET org_id = COALESCE(org_name, id::text) WHERE org_id IS NULL;

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Auto-link trigger from Supabase auth.users -> public.organizations
CREATE OR REPLACE FUNCTION public.handle_new_org_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organizations (
    org_name,
    admin_name,
    email,
    logo_path,
    auth_user_id
  )
  VALUES (
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'org_name', ''), 'FLAWLESS GRAPHICS'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'admin_name', ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'logo_path',
    NEW.id
  )
  ON CONFLICT (org_name) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    admin_name = COALESCE(NULLIF(EXCLUDED.admin_name, ''), public.organizations.admin_name),
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users if auth schema is present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_org_user();
  END IF;
END $$;

-- 5. Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Allow anon read organizations'
  ) THEN
    CREATE POLICY "Allow anon read organizations" ON public.organizations FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Allow anon insert organizations'
  ) THEN
    CREATE POLICY "Allow anon insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Allow anon update organizations'
  ) THEN
    CREATE POLICY "Allow anon update organizations" ON public.organizations FOR UPDATE USING (true);
  END IF;
END $$;

-- 6. Initial Default Organization Seed
INSERT INTO public.organizations (org_name, admin_name, email, logo_path)
VALUES ('FLAWLESS GRAPHICS', 'James Ntiamoah', 'admin@flawlessgraphics.com', NULL)
ON CONFLICT (org_name) DO NOTHING;
