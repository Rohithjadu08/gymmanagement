-- Streamlined Gym Management System & Member Fitness Portal Schema
-- Run this script in your Supabase SQL Editor to configure tables, indexes, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Admin & Member users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'member'
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
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  member_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
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
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EXERCISES LIBRARY
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL, -- 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'
  secondary_muscles TEXT[] DEFAULT '{}',
  description TEXT,
  instructions TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Intermediate',
  equipment TEXT NOT NULL DEFAULT 'Barbell',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WORKOUTS (Assigned by Admin to Member)
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ASSIGNED', -- 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WORKOUT EXERCISES
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sets INT NOT NULL DEFAULT 3,
  reps INT NOT NULL DEFAULT 10,
  rest_seconds INT NOT NULL DEFAULT 60,
  order_index INT NOT NULL DEFAULT 1,
  notes TEXT
);

-- 9. WORKOUT LOGS
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  completed_sets INT NOT NULL,
  completed_reps INT NOT NULL,
  weight NUMERIC(6, 2) NOT NULL DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_expiry_date ON public.payments(expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_member_id ON public.workouts(member_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_member_id ON public.workout_logs(member_id);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access gym_settings" ON public.gym_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access membership_plans" ON public.membership_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access members" ON public.members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access exercises" ON public.exercises FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access workouts" ON public.workouts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access workout_exercises" ON public.workout_exercises FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins full access workout_logs" ON public.workout_logs FOR ALL USING (auth.role() = 'authenticated');

-- Member read-only/own data policies
CREATE POLICY "Members view active plans" ON public.membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Members view gym settings" ON public.gym_settings FOR SELECT USING (true);
CREATE POLICY "Members view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Members view own profile" ON public.members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Members view own payments" ON public.payments FOR SELECT USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members view own workouts" ON public.workouts FOR SELECT USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Members view own workout exercises" ON public.workout_exercises FOR SELECT USING (workout_id IN (SELECT id FROM public.workouts WHERE member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())));
CREATE POLICY "Members manage own workout logs" ON public.workout_logs FOR ALL USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
