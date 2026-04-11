-- Comprehensive Fix for Real-time and Missing Columns
-- Run this in your Supabase SQL Editor

-- 1. Enable Real-time for all critical tables
-- First, check if publication exists, if not create it (Supabase usually has it)
-- If it exists, we just add tables to it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to publication (ignore errors if already added)
BEGIN;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.venues;
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'venues already in publication';
END;

BEGIN;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_providers;
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'service_providers already in publication';
END;

BEGIN;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_feedback;
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'app_feedback already in publication';
END;

BEGIN;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN others THEN 
    RAISE NOTICE 'bookings already in publication';
END;

-- 2. Ensure all columns exist for venues
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';

-- 3. Ensure all columns exist for service_providers
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS price_level TEXT DEFAULT 'per day';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS block TEXT;

-- 4. Ensure all columns exist for bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS extra_services JSONB DEFAULT '[]';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_amount NUMERIC;

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
