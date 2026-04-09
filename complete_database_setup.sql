-- Consolidated Database Setup Script (Updated)
-- This script ensures all tables exist and have the correct columns.
-- Run this in your Supabase SQL Editor.

-- 1. Users Table (Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    father_name TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'user',
    mobile_number TEXT,
    state TEXT,
    district TEXT,
    block TEXT,
    pincode TEXT,
    address TEXT,
    business_name TEXT,
    business_description TEXT,
    venue_type TEXT,
    registration_id TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    subscription_plan TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    venue_type TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    state TEXT,
    district TEXT,
    block TEXT,
    pincode TEXT,
    capacity INTEGER,
    price_per_day INTEGER,
    images TEXT[] DEFAULT '{}',
    facilities TEXT[] DEFAULT '{}',
    rating DECIMAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    available_for TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Providers Table
CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id TEXT NOT NULL,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    price_range TEXT,
    price_level TEXT,
    images TEXT[] DEFAULT '{}',
    state TEXT,
    district TEXT,
    block TEXT,
    rating DECIMAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    available_for TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'venue' or 'service'
    target_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    end_date TEXT,
    start_time TEXT,
    end_time TEXT,
    event_type TEXT,
    party_name TEXT,
    party_address TEXT,
    visitor_name TEXT,
    visitor_mobile TEXT,
    total_amount INTEGER DEFAULT 0,
    updated_amount INTEGER,
    status TEXT DEFAULT 'pending',
    is_manual BOOLEAN DEFAULT FALSE,
    is_invoice_generated BOOLEAN DEFAULT FALSE,
    extra_services JSONB DEFAULT '[]',
    payment_mode TEXT,
    payment_status TEXT DEFAULT 'Pending',
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_name TEXT,
    user_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (in case tables were created previously without them)
DO $$ 
BEGIN 
    -- Users updates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='father_name') THEN
        ALTER TABLE public.users ADD COLUMN father_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='registration_id') THEN
        ALTER TABLE public.users ADD COLUMN registration_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='venue_type') THEN
        ALTER TABLE public.users ADD COLUMN venue_type TEXT;
    END IF;

    -- Bookings updates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='is_invoice_generated') THEN
        ALTER TABLE public.bookings ADD COLUMN is_invoice_generated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='extra_services') THEN
        ALTER TABLE public.bookings ADD COLUMN extra_services JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_mode') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_mode TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_status') THEN
        ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'Pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='invoice_url') THEN
        ALTER TABLE public.bookings ADD COLUMN invoice_url TEXT;
    END IF;

    -- Service Providers updates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_providers' AND column_name='available_for') THEN
        ALTER TABLE public.service_providers ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_providers' AND column_name='price_level') THEN
        ALTER TABLE public.service_providers ADD COLUMN price_level TEXT;
    END IF;

    -- Venues updates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='district') THEN
        ALTER TABLE public.venues ADD COLUMN district TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='block') THEN
        ALTER TABLE public.venues ADD COLUMN block TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='pincode') THEN
        ALTER TABLE public.venues ADD COLUMN pincode TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='available_for') THEN
        ALTER TABLE public.venues ADD COLUMN available_for TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_providers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
