-- Final Comprehensive Database Fix for BOOK MY VANUE
-- This script adds missing columns, ensures correct data types, and enables real-time for all tables.

DO $$
BEGIN
    -- 1. Fix Notifications Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_active') THEN
        ALTER TABLE public.notifications ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- 2. Fix Venues Table
    -- Ensure available_for is TEXT[]
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'available_for') THEN
        -- Check if it's already an array, if not, convert it
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'available_for') != 'ARRAY' THEN
            ALTER TABLE public.venues ALTER COLUMN available_for TYPE TEXT[] USING ARRAY[available_for];
        END IF;
    ELSE
        ALTER TABLE public.venues ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;

    -- Add other missing columns for venues
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'district') THEN
        ALTER TABLE public.venues ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'state') THEN
        ALTER TABLE public.venues ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'block') THEN
        ALTER TABLE public.venues ADD COLUMN block TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'pincode') THEN
        ALTER TABLE public.venues ADD COLUMN pincode TEXT;
    END IF;

    -- 3. Fix Service Providers Table
    -- Ensure available_for is TEXT[]
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'available_for') THEN
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'available_for') != 'ARRAY' THEN
            ALTER TABLE public.service_providers ALTER COLUMN available_for TYPE TEXT[] USING ARRAY[available_for];
        END IF;
    ELSE
        ALTER TABLE public.service_providers ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;

    -- Add price_level if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'price_level') THEN
        ALTER TABLE public.service_providers ADD COLUMN price_level TEXT DEFAULT 'per day';
    END IF;

    -- Add other missing columns for service providers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'district') THEN
        ALTER TABLE public.service_providers ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'state') THEN
        ALTER TABLE public.service_providers ADD COLUMN state TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'block') THEN
        ALTER TABLE public.service_providers ADD COLUMN block TEXT;
    END IF;

    -- 4. Fix Bookings Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'Pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'is_invoice_generated') THEN
        ALTER TABLE public.bookings ADD COLUMN is_invoice_generated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'extra_services') THEN
        ALTER TABLE public.bookings ADD COLUMN extra_services JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_mode') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_mode TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'invoice_url') THEN
        ALTER TABLE public.bookings ADD COLUMN invoice_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'updated_amount') THEN
        ALTER TABLE public.bookings ADD COLUMN updated_amount NUMERIC;
    END IF;

    -- 5. Fix App Feedback Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_feedback' AND column_name = 'visitor_mobile') THEN
        ALTER TABLE public.app_feedback ADD COLUMN visitor_mobile TEXT;
    END IF;

    -- 6. Enable Realtime for all tables
    -- This must be done carefully to avoid errors if the table is already in the publication
    DECLARE
        table_names TEXT[] := ARRAY['venues', 'service_providers', 'bookings', 'app_feedback', 'notifications', 'banners', 'reviews', 'service_type_photos'];
        t_name TEXT;
    BEGIN
        FOREACH t_name IN ARRAY table_names LOOP
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables 
                WHERE pubname = 'supabase_realtime' AND tablename = t_name
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t_name);
            END IF;
        END LOOP;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error adding tables to publication: %', SQLERRM;
    END;

END $$;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
