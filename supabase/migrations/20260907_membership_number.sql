-- Migration: Add Membership Number to Members Table
-- Preserves existing members and data without dropping or recreating tables

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS membership_number TEXT;

-- Safely populate existing members with member_code or generated fallback if membership_number is empty
UPDATE public.members
SET membership_number = member_code
WHERE membership_number IS NULL OR membership_number = '';

ALTER TABLE public.members ALTER COLUMN membership_number SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'members_membership_number_key'
    ) THEN
        ALTER TABLE public.members ADD CONSTRAINT members_membership_number_key UNIQUE (membership_number);
    END IF;
END $$;
