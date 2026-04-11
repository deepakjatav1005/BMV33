-- Fix missing columns for venues and service_providers
-- Run this in your Supabase SQL Editor

-- 1. Update Venues Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'available_for') THEN
        ALTER TABLE public.venues ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Update Service Providers Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'available_for') THEN
        ALTER TABLE public.service_providers ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'price_level') THEN
        ALTER TABLE public.service_providers ADD COLUMN price_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'district') THEN
        ALTER TABLE public.service_providers ADD COLUMN district TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_providers' AND column_name = 'block') THEN
        ALTER TABLE public.service_providers ADD COLUMN block TEXT;
    END IF;
END $$;

-- Enable Real-time for these tables if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE public.venues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_providers;
