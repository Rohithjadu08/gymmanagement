-- Migration: Update Gym Management System for Shiva Gym ("Shape Your Body")

-- 1. Update Gym Settings
INSERT INTO public.gym_settings (gym_name, phone, whatsapp_number, warning_days)
SELECT 'SHIVA GYM', '9600879081', '919600879081', 7
WHERE NOT EXISTS (SELECT 1 FROM public.gym_settings);

UPDATE public.gym_settings
SET gym_name = 'SHIVA GYM', phone = '9600879081', whatsapp_number = '919600879081'
WHERE gym_name != 'SHIVA GYM';

-- 2. Deactivate obsolete default plans if present, and insert official Shiva Gym plans
UPDATE public.membership_plans
SET is_active = false
WHERE name NOT IN ('1 Month', '2 Months', '4 Months', '6 Months', '15 Months');

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '1 Month', 30, 700.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '1 Month' AND is_active = true);

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '2 Months', 60, 1200.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '2 Months' AND is_active = true);

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '4 Months', 120, 2000.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '4 Months' AND is_active = true);

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '6 Months', 180, 2700.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '6 Months' AND is_active = true);

INSERT INTO public.membership_plans (name, duration_days, price, is_active)
SELECT '15 Months', 450, 5500.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE name = '15 Months' AND is_active = true);

-- 3. Extend Members Table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS training_goals TEXT[] DEFAULT '{}';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS has_treadmill BOOLEAN DEFAULT false;

-- 4. Extend Payments Table for Base Fee vs Optional Add-on Breakdown
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS base_amount NUMERIC(10, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS addon_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS addon_name TEXT;

-- 5. Create Storage Bucket for Member Photos (if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Member Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

CREATE POLICY "Authenticated Upload Member Photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos' AND auth.role() = 'authenticated');
