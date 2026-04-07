-- Add city column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
