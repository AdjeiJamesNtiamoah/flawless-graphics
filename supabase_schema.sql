-- ====================================================================
-- FLAWLESS GRAPHICS — ENTERPRISE SCHOOL MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION SCRIPT
-- Target Project / Owner: AdjeiJamesNtiamoah
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. CORE INSTITUTION & TENANCY TABLES
-- ====================================================================

-- Organizations / Tenants Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY DEFAULT ('org_' || replace(gen_random_uuid()::text, '-', '')),
    org_name TEXT NOT NULL UNIQUE
);

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS admin_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_path TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#635bfc';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Users / User Accounts Directory Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('u_' || replace(gen_random_uuid()::text, '-', '')),
    email TEXT NOT NULL UNIQUE
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'teacher';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pass_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linked_staff_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 3. FACULTY & STAFF DIRECTORY
-- ====================================================================

-- Teachers & Staff Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY DEFAULT ('emp_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'Academic Faculty';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS dept TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'Instructor';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS salary NUMERIC(12, 2) DEFAULT 4500.00;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 4. ACADEMICS: CLASSES, STUDENTS, ATTENDANCE & TIMETABLE
-- ====================================================================

-- Classes & Cohorts Table
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY DEFAULT ('cls_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS grade_level TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS room TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 35;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026/2027';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Students Roster Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY DEFAULT ('stu_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS roll TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrollment_code TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS grade_level TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS rfid_tag TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS rfid_uid TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS smart_id_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS security_hash TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS guardian_email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS clearance_status TEXT DEFAULT 'Cleared';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Daily Attendance & Biometric Punches Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY DEFAULT ('att_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS check_in TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS check_out TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS in_time TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS out_time TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present';
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS records_json JSONB;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 5. BURSARY, FINANCE & TREASURY
-- ====================================================================

-- Student Fees & Billing Accounts
CREATE TABLE IF NOT EXISTS public.student_fees (
    id TEXT PRIMARY KEY DEFAULT ('fee_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Tuition Fee';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS cat TEXT;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS billed NUMERIC(12, 2);
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2);
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Cleared';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS academic_term TEXT DEFAULT 'Term 2';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2026/2027';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Financial Transactions & Payment Receipts
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT ('txn_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Mobile Money';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Certified Paid';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Faculty & Staff Payroll Records
CREATE TABLE IF NOT EXISTS public.payroll (
    id TEXT PRIMARY KEY DEFAULT ('pay_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS staff_id TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS staff_name TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS dept TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS gross_salary NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS gross NUMERIC(12, 2);
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS teaching_allowance NUMERIC(12, 2) DEFAULT 450.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS ssnit_deduction NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS tax_deduction NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS net_salary NUMERIC(12, 2);
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS pay_period TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending Approval';
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Scholarships & Financial Grants
CREATE TABLE IF NOT EXISTS public.scholarships (
    id TEXT PRIMARY KEY DEFAULT ('sch_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS scheme_name TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS scheme TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS sponsor TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS waiver_details TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS waiver TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Operating Expenses & Disbursements
CREATE TABLE IF NOT EXISTS public.disbursements (
    id TEXT PRIMARY KEY DEFAULT ('disb_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS beneficiary TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Disbursed';
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE public.disbursements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 6. COURSEWORK, ASSESSMENTS & STUDY VAULT
-- ====================================================================

-- Coursework Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id TEXT PRIMARY KEY DEFAULT ('asgn_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS points INT DEFAULT 100;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS due_date TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published';
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Academic Broadsheet Assessments & Certifications
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id TEXT PRIMARY KEY DEFAULT ('eval_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS student_roll TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS ca_score NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS exam_score NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS total_score NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'A1';
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS certified_by TEXT;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS certified_at TIMESTAMPTZ;
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Approved & Certified';
ALTER TABLE public.student_assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Digital Study Materials Vault
CREATE TABLE IF NOT EXISTS public.study_materials (
    id TEXT PRIMARY KEY DEFAULT ('doc_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'PDF';
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS downloads INT DEFAULT 0;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS desc_text TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Faculty Lesson Notes
CREATE TABLE IF NOT EXISTS public.lesson_notes (
    id TEXT PRIMARY KEY DEFAULT ('note_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS week TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.lesson_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Academic Calendar Terms
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id TEXT PRIMARY KEY DEFAULT ('term_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS year TEXT DEFAULT '2026';
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS ca_deadline DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS exam_start DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS staff_review_start DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS staff_review_end DATE;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS directives TEXT;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Published for Staff Review';
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS published_by TEXT;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());
ALTER TABLE public.academic_calendar ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 7. ANNOUNCEMENTS, DIRECTIVES & AUDIT LOGS
-- ====================================================================

-- Official Directives & Broadcast Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY DEFAULT ('ann_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Administrator';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'all';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Universal Institutional Activity Stream & Audit Trail
CREATE TABLE IF NOT EXISTS public.activity_stream (
    id TEXT PRIMARY KEY DEFAULT ('act_' || replace(gen_random_uuid()::text, '-', ''))
);

ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'FLAWLESS GRAPHICS';
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'INFO';
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE public.activity_stream ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_stream ENABLE ROW LEVEL SECURITY;

-- Permissive public/authenticated access policies for single-tenant / multi-tenant portal operation
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'organizations', 'users', 'teachers', 'classes', 'students',
            'attendance_records', 'student_fees', 'transactions', 'payroll',
            'scholarships', 'disbursements', 'assignments', 'student_assessments',
            'study_materials', 'lesson_notes', 'academic_calendar', 'announcements', 'activity_stream'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_all_read_' || tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'allow_all_write_' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true);', 'allow_all_read_' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true);', 'allow_all_write_' || tbl, tbl);
    END LOOP;
END $$;

-- ====================================================================
-- 9. SUPABASE STORAGE BUCKETS (FOR IMAGES & ASSETS)
-- ====================================================================

-- Insert storage buckets if storage schema is available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES 
            ('school-assets', 'school-assets', true),
            ('student-photos', 'student-photos', true),
            ('staff-photos', 'staff-photos', true),
            ('study-vault', 'study-vault', true)
        ON CONFLICT (id) DO NOTHING;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
            DROP POLICY IF EXISTS "Public Access school-assets" ON storage.objects;
            CREATE POLICY "Public Access school-assets" ON storage.objects FOR ALL USING (bucket_id IN ('school-assets', 'student-photos', 'staff-photos', 'study-vault')) WITH CHECK (bucket_id IN ('school-assets', 'student-photos', 'staff-photos', 'study-vault'));
        END IF;
    END IF;
END $$;

-- ====================================================================
-- ====================================================================
-- 10. PURE MULTI-TENANT ARCHITECTURE (READY FOR NEW ORGANIZATIONS)
-- ====================================================================
-- Database is initialized clean with zero default records.
-- New institutions, administrators, staff, students, and ledgers
-- are created dynamically through the registration & onboarding portal.
