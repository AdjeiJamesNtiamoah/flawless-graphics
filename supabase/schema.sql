-- ============================================================================
-- Supabase Schema Migration: FLAWLESS GRAPHICS — LUCY™ Management System
-- Project: AdjeiJamesNtiamoah
-- Description: Sets up enterprise tables, indexes, and Row Level Security (RLS)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS TABLE
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

-- Auto-update trigger for updated_at
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

-- Auto-link trigger: when a user signs up via Supabase Auth, populate public.organizations
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

-- Attach trigger to auth.users if auth schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_org_user();
  END IF;
END $$;

-- 3. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS',
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    salary NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Active',
    hire_date DATE DEFAULT CURRENT_DATE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS',
    employee_name TEXT NOT NULL,
    department TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIME,
    check_out TIME,
    hours TEXT,
    status TEXT NOT NULL DEFAULT 'Present',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PAYROLL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS',
    employee_id TEXT,
    employee_name TEXT NOT NULL,
    department TEXT,
    basic_salary NUMERIC(12, 2) DEFAULT 0.00,
    allowance NUMERIC(12, 2) DEFAULT 0.00,
    bonus NUMERIC(12, 2) DEFAULT 0.00,
    gross NUMERIC(12, 2) DEFAULT 0.00,
    paye_tax NUMERIC(12, 2) DEFAULT 0.00,
    pension NUMERIC(12, 2) DEFAULT 0.00,
    deductions NUMERIC(12, 2) DEFAULT 0.00,
    net_pay NUMERIC(12, 2) DEFAULT 0.00,
    period TEXT NOT NULL,
    status TEXT DEFAULT 'Approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PERFORMANCE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS',
    employee_name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    kpi INTEGER DEFAULT 90,
    rating TEXT DEFAULT '4.8',
    grade TEXT DEFAULT 'Exceeds Standards',
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ANNOUNCEMENTS & BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS',
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'HR Desk',
    date TEXT DEFAULT 'Today',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7.5. SCHEMA MIGRATION SAFETY: Ensure org_id & columns exist on pre-existing tables
DO $$
BEGIN
  -- Employees table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees') THEN
    ALTER TABLE public.employees ALTER COLUMN id DROP IDENTITY IF EXISTS;
    ALTER TABLE public.employees ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS position TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hire_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS photo_url TEXT;
    ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

    -- Drop NOT NULL on legacy columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='employees' AND column_name='name') THEN
      ALTER TABLE public.employees ALTER COLUMN name DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='employees' AND column_name='role') THEN
      ALTER TABLE public.employees ALTER COLUMN role DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='employees' AND column_name='emp_id') THEN
      ALTER TABLE public.employees ALTER COLUMN emp_id DROP NOT NULL;
    END IF;

    UPDATE public.employees SET org_id = 'FLAWLESS GRAPHICS' WHERE org_id IS NULL;
  END IF;

  -- Attendance table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_records') THEN
    ALTER TABLE public.attendance_records ALTER COLUMN id DROP IDENTITY IF EXISTS;
    ALTER TABLE public.attendance_records ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS employee_name TEXT;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS check_in TIME;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS check_out TIME;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS hours TEXT;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present';
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS remarks TEXT;
    ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    UPDATE public.attendance_records SET org_id = 'FLAWLESS GRAPHICS' WHERE org_id IS NULL;
  END IF;

  -- Payroll table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payroll_records') THEN
    ALTER TABLE public.payroll_records ALTER COLUMN id DROP IDENTITY IF EXISTS;
    ALTER TABLE public.payroll_records ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS employee_id TEXT;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS employee_name TEXT;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS allowance NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS bonus NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS gross NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS paye_tax NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS pension NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS deductions NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS net_pay NUMERIC(12, 2) DEFAULT 0.00;
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'Current';
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Approved';
    ALTER TABLE public.payroll_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    UPDATE public.payroll_records SET org_id = 'FLAWLESS GRAPHICS' WHERE org_id IS NULL;
  END IF;

  -- Performance table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'performance_reviews') THEN
    ALTER TABLE public.performance_reviews ALTER COLUMN id DROP IDENTITY IF EXISTS;
    ALTER TABLE public.performance_reviews ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS employee_name TEXT;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS position TEXT;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS kpi INTEGER DEFAULT 90;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS rating TEXT DEFAULT '4.8';
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'Exceeds Standards';
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.performance_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    UPDATE public.performance_reviews SET org_id = 'FLAWLESS GRAPHICS' WHERE org_id IS NULL;
  END IF;

  -- Announcements table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements') THEN
    ALTER TABLE public.announcements ALTER COLUMN id DROP IDENTITY IF EXISTS;
    ALTER TABLE public.announcements ALTER COLUMN id TYPE TEXT USING id::text;
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS text TEXT;
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'HR Desk';
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS date TEXT DEFAULT 'Today';
    ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    UPDATE public.announcements SET org_id = 'FLAWLESS GRAPHICS' WHERE org_id IS NULL;
  END IF;

  -- Organizations table updates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS auth_user_id uuid;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_name TEXT;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_id TEXT;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_path TEXT;
    ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

    -- Drop NOT NULL on legacy columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='name') THEN
      ALTER TABLE public.organizations ALTER COLUMN name DROP NOT NULL;
      UPDATE public.organizations SET org_name = name WHERE org_name IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='owner_name') THEN
      ALTER TABLE public.organizations ALTER COLUMN owner_name DROP NOT NULL;
      UPDATE public.organizations SET admin_name = owner_name WHERE admin_name IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='owner_email') THEN
      ALTER TABLE public.organizations ALTER COLUMN owner_email DROP NOT NULL;
      UPDATE public.organizations SET email = owner_email WHERE email IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='organizations' AND column_name='logo_url') THEN
      UPDATE public.organizations SET logo_path = logo_url WHERE logo_path IS NULL;
    END IF;
    UPDATE public.organizations SET org_id = COALESCE(org_name, id::text) WHERE org_id IS NULL;
  END IF;
END $$;

-- 7.6. AUTO-SYNC LEGACY COLUMNS (Keeps name <-> full_name, role <-> position synchronized)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='employees' AND column_name='name') THEN
    CREATE OR REPLACE FUNCTION public.sync_employee_legacy_columns()
    RETURNS TRIGGER AS $trg$
    BEGIN
      IF NEW.full_name IS NOT NULL THEN
        NEW.name := NEW.full_name;
      ELSIF NEW.name IS NOT NULL THEN
        NEW.full_name := NEW.name;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='employees' AND column_name='role') THEN
        IF NEW.position IS NOT NULL THEN
          NEW.role := NEW.position;
        ELSIF NEW.role IS NOT NULL THEN
          NEW.position := NEW.role;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $trg$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_sync_employee_columns ON public.employees;
    CREATE TRIGGER trg_sync_employee_columns
      BEFORE INSERT OR UPDATE ON public.employees
      FOR EACH ROW EXECUTE FUNCTION public.sync_employee_legacy_columns();
  END IF;
END $$;

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_employees_org ON public.employees(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org_date ON public.attendance_records(org_id, date);
CREATE INDEX IF NOT EXISTS idx_payroll_org ON public.payroll_records(org_id);
CREATE INDEX IF NOT EXISTS idx_performance_org ON public.performance_reviews(org_id);
CREATE INDEX IF NOT EXISTS idx_announcements_org ON public.announcements(org_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Idempotent policy definitions (safe to re-run multiple times)
DROP POLICY IF EXISTS "Allow anon read organizations" ON public.organizations;
CREATE POLICY "Allow anon read organizations" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert organizations" ON public.organizations;
CREATE POLICY "Allow anon insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update organizations" ON public.organizations;
CREATE POLICY "Allow anon update organizations" ON public.organizations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon read employees" ON public.employees;
CREATE POLICY "Allow anon read employees" ON public.employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon write employees" ON public.employees;
CREATE POLICY "Allow anon write employees" ON public.employees FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read attendance" ON public.attendance_records;
CREATE POLICY "Allow anon read attendance" ON public.attendance_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon write attendance" ON public.attendance_records;
CREATE POLICY "Allow anon write attendance" ON public.attendance_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read payroll" ON public.payroll_records;
CREATE POLICY "Allow anon read payroll" ON public.payroll_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon write payroll" ON public.payroll_records;
CREATE POLICY "Allow anon write payroll" ON public.payroll_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read performance" ON public.performance_reviews;
CREATE POLICY "Allow anon read performance" ON public.performance_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon write performance" ON public.performance_reviews;
CREATE POLICY "Allow anon write performance" ON public.performance_reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read announcements" ON public.announcements;
CREATE POLICY "Allow anon read announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon write announcements" ON public.announcements;
CREATE POLICY "Allow anon write announcements" ON public.announcements FOR ALL USING (true);

-- 10. INITIAL SEED DATA FOR FLAWLESS GRAPHICS
INSERT INTO public.organizations (org_name, admin_name, email, logo_path)
VALUES ('FLAWLESS GRAPHICS', 'James Ntiamoah', 'admin@flawlessgraphics.com', NULL)
ON CONFLICT (org_name) DO NOTHING;

INSERT INTO public.employees (id, org_id, full_name, department, position, email, phone, salary, status)
VALUES
  ('emp_1', 'FLAWLESS GRAPHICS', 'James Ntiamoah', 'Executive & Design', 'Creative Director', 'james@flawless.org', '+233 24 111 2233', 8500.00, 'Active'),
  ('emp_2', 'FLAWLESS GRAPHICS', 'Ama Serwaa', 'Operations', 'HR Manager', 'ama@flawless.org', '+233 20 222 3344', 6200.00, 'Active'),
  ('emp_3', 'FLAWLESS GRAPHICS', 'Kwame Boateng', 'Academic Staff', 'Lead Instructor', 'kwame@flawless.org', '+233 55 333 4455', 5400.00, 'Active'),
  ('emp_4', 'FLAWLESS GRAPHICS', 'Abena Mansa', 'Finance', 'Chief Accountant', 'abena@flawless.org', '+233 27 444 5566', 7100.00, 'Active'),
  ('emp_5', 'FLAWLESS GRAPHICS', 'Kofi Owusu', 'Digital Media', 'Senior Designer', 'kofi@flawless.org', '+233 24 555 6677', 5000.00, 'Active'),
  ('emp_6', 'FLAWLESS GRAPHICS', 'Esi Badu', 'Academic Staff', 'Science Educator', 'esi@flawless.org', '+233 50 666 7788', 4800.00, 'Active')
ON CONFLICT (id) DO NOTHING;
