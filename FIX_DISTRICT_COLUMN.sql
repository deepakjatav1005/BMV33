-- FIX_DISTRICT_COLUMN.sql
-- This script ensures the 'district' column exists in 'service_providers' and 'venues' tables.
-- Note: These columns are now optional in the application forms.
-- Run this in your Supabase SQL Editor.

-- 1. Add district column to service_providers if missing
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS district TEXT;

-- 2. Add district column to venues if missing
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS district TEXT;

-- 3. Add district column to users if missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS district TEXT;

-- 4. Add payment_status column to bookings if missing
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS extra_services JSONB DEFAULT '[]';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_amount NUMERIC;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS party_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS party_address TEXT;

-- 5. Add columns to notifications and reviews
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS visitor_mobile TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS target_type TEXT;
ALTER TABLE public.app_feedback ADD COLUMN IF NOT EXISTS visitor_mobile TEXT;

-- 6. Add other potentially missing columns for service_providers
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS price_level TEXT DEFAULT 'per day';

-- 4. Add other potentially missing columns for venues
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS pincode TEXT;

-- 8. Ensure Realtime is enabled for all tables
DO $$
DECLARE
    t_name TEXT;
    table_names TEXT[] := ARRAY['venues', 'service_providers', 'bookings', 'app_feedback', 'notifications', 'banners', 'reviews', 'service_type_photos', 'users'];
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

-- 9. Reload the schema cache (PostgREST)
-- This is critical for the "Could not find column" error
NOTIFY pgrst, 'reload schema';

-- Also try to force a schema reload by touching a table if needed
COMMENT ON TABLE public.bookings IS 'Bookings table updated with payment_status and manual booking fields';
COMMENT ON TABLE public.venues IS 'Venues table updated';
COMMENT ON TABLE public.service_providers IS 'Service providers table updated';
COMMENT ON TABLE public.notifications IS 'Notifications table updated';
