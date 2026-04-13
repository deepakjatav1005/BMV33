-- FORCE_SCHEMA_FIX_V5.sql
-- This script forcefully adds missing columns and reloads the schema cache.

-- 1. Notifications Table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Venues Table
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS pincode TEXT;

-- 3. Service Providers Table
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS price_level TEXT DEFAULT 'per day';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS block TEXT;

-- 4. Bookings Table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS extra_services JSONB DEFAULT '[]';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_amount NUMERIC;

-- 5. App Feedback Table
ALTER TABLE public.app_feedback ADD COLUMN IF NOT EXISTS visitor_mobile TEXT;

-- 6. Reviews Table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS visitor_mobile TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS target_type TEXT;
-- Add constraint separately to avoid errors if it exists
DO $$
BEGIN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_target_type_check CHECK (target_type IN ('venue', 'service'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 7. Ensure Realtime is enabled for all tables
-- We do this one by one to avoid stopping on errors if a table is already added
DO $$
DECLARE
    t_name TEXT;
    table_names TEXT[] := ARRAY['venues', 'service_providers', 'bookings', 'app_feedback', 'notifications', 'banners', 'reviews', 'service_type_photos'];
BEGIN
    -- Ensure publication exists
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    FOREACH t_name IN ARRAY table_names LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t_name);
        EXCEPTION
            WHEN others THEN 
                RAISE NOTICE 'Table % already in publication or does not exist', t_name;
        END;
    END LOOP;
END $$;

-- 8. RELOAD SCHEMA CACHE (PostgREST)
-- This is the most important part for the "Could not find column" error
NOTIFY pgrst, 'reload schema';
