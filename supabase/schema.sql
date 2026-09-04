-- Streamlined Internal Gym Management System Schema
-- Run this script in your Supabase SQL Editor to configure tables, indexes, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Admin Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GYM SETTINGS
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_name TEXT NOT NULL DEFAULT 'Iron Pulse Gym',
  phone TEXT DEFAULT '+91 98765 43210',
  whatsapp_number TEXT DEFAULT '919876543210',
  warning_days INT NOT NULL DEFAULT 7,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MEMBERS
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  date_of_birth DATE,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAYMENTS (Ledger history - never overwritten)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash', -- Cash, UPI, Card, Bank Transfer, Other
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_expiry_date ON public.payments(expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members(is_active);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admins full access gym_settings" ON public.gym_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access membership_plans" ON public.membership_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access members" ON public.members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');

-- INITIAL SEED DATA FOR GYM SETTINGS & PLANS IF EMPTY
INSERT INTO public.gym_settings (gym_name, phone, whatsapp_number, warning_days)
SELECT 'Iron Pulse Gym', '+91 98765 43210', '919876543210', 7
WHERE NOT EXISTS (SELECT 1 FROM public.gym_settings);

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT 'Monthly', 30, 1500.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = 'Monthly');

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '3 Months', 90, 4000.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '3 Months');

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '6 Months', 180, 7500.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '6 Months');

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT 'Yearly', 365, 13500.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = 'Yearly');
