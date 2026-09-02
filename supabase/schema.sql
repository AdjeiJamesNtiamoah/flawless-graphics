-- ============================================================================
-- Supabase Schema Migration: FLAWLESS GRAPHICS — LUCY™ Management System
-- Project: AdjeiJamesNtiamoah
-- Description: Sets up enterprise tables, indexes, and Row Level Security (RLS)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT,
    owner_email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Allow public / anon read and write access for client applications
CREATE POLICY "Allow anon read organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update organizations" ON public.organizations FOR UPDATE USING (true);

CREATE POLICY "Allow anon read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow anon write employees" ON public.employees FOR ALL USING (true);

CREATE POLICY "Allow anon read attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow anon write attendance" ON public.attendance_records FOR ALL USING (true);

CREATE POLICY "Allow anon read payroll" ON public.payroll_records FOR SELECT USING (true);
CREATE POLICY "Allow anon write payroll" ON public.payroll_records FOR ALL USING (true);

CREATE POLICY "Allow anon read performance" ON public.performance_reviews FOR SELECT USING (true);
CREATE POLICY "Allow anon write performance" ON public.performance_reviews FOR ALL USING (true);

CREATE POLICY "Allow anon read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow anon write announcements" ON public.announcements FOR ALL USING (true);

-- 10. INITIAL SEED DATA FOR FLAWLESS GRAPHICS
INSERT INTO public.organizations (id, name, owner_name, owner_email)
VALUES ('FLAWLESS GRAPHICS', 'FLAWLESS GRAPHICS', 'James Ntiamoah', 'admin@flawlessgraphics.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.employees (id, org_id, full_name, department, position, email, phone, salary, status)
VALUES
  ('emp_1', 'FLAWLESS GRAPHICS', 'James Ntiamoah', 'Executive & Design', 'Creative Director', 'james@flawless.org', '+233 24 111 2233', 8500.00, 'Active'),
  ('emp_2', 'FLAWLESS GRAPHICS', 'Ama Serwaa', 'Operations', 'HR Manager', 'ama@flawless.org', '+233 20 222 3344', 6200.00, 'Active'),
  ('emp_3', 'FLAWLESS GRAPHICS', 'Kwame Boateng', 'Academic Staff', 'Lead Instructor', 'kwame@flawless.org', '+233 55 333 4455', 5400.00, 'Active'),
  ('emp_4', 'FLAWLESS GRAPHICS', 'Abena Mansa', 'Finance', 'Chief Accountant', 'abena@flawless.org', '+233 27 444 5566', 7100.00, 'Active'),
  ('emp_5', 'FLAWLESS GRAPHICS', 'Kofi Owusu', 'Digital Media', 'Senior Designer', 'kofi@flawless.org', '+233 24 555 6677', 5000.00, 'Active'),
  ('emp_6', 'FLAWLESS GRAPHICS', 'Esi Badu', 'Academic Staff', 'Science Educator', 'esi@flawless.org', '+233 50 666 7788', 4800.00, 'Active')
ON CONFLICT (id) DO NOTHING;
