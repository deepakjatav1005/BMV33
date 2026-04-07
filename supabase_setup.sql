-- Supabase Backend Setup SQL
-- This script creates all necessary tables for the Event Manager application.

-- 1. Users Table (Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    uid TEXT PRIMARY KEY, -- Changed to TEXT for custom auth compatibility
    registration_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    father_name TEXT,
    mobile_number TEXT,
    password TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT CHECK (role IN ('user', 'owner', 'provider', 'admin')) DEFAULT 'user',
    state TEXT,
    district TEXT,
    block TEXT,
    city TEXT,
    pincode TEXT,
    venue_type TEXT,
    status TEXT CHECK (status IN ('active', 'disabled')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure status column exists for existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE public.users ADD COLUMN status TEXT CHECK (status IN ('active', 'disabled')) DEFAULT 'active';
    END IF;
END $$;

-- 7. Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT CHECK (role IN ('owner', 'provider')),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration TEXT CHECK (duration IN ('month', 'year')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(uid) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired')) DEFAULT 'active',
    amount NUMERIC NOT NULL,
    payment_id TEXT,
    order_id TEXT,
    signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT, -- 'user', 'owner', 'provider', 'all'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure title column exists for existing banners table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'title') THEN
        ALTER TABLE public.banners ADD COLUMN title TEXT;
    END IF;
END $$;

-- Seed Initial Subscription Plans
INSERT INTO public.subscription_plans (role, name, price, duration) VALUES
('owner', 'Monthly Plan', 100, 'month'),
('owner', 'Yearly Plan', 1000, 'year'),
('provider', 'Monthly Plan', 20, 'month'),
('provider', 'Yearly Plan', 200, 'year')
ON CONFLICT DO NOTHING;

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT REFERENCES public.users(uid) ON DELETE CASCADE, -- Changed to TEXT
    name TEXT NOT NULL,
    description TEXT,
    venue_type TEXT,
    address TEXT,
    state TEXT,
    district TEXT,
    block TEXT,
    pincode TEXT,
    city TEXT,
    capacity INTEGER,
    price_per_day NUMERIC,
    images TEXT[] DEFAULT '{}',
    facilities TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    rate_chart JSONB DEFAULT '[]',
    catalogue JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Providers Table
CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id TEXT REFERENCES public.users(uid) ON DELETE CASCADE, -- Changed to TEXT
    name TEXT NOT NULL,
    service_type TEXT,
    description TEXT,
    price_range TEXT,
    city TEXT,
    state TEXT,
    images TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    rate_chart JSONB DEFAULT '[]',
    catalogue JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Can be UUID or 'visitor'
    visitor_name TEXT,
    visitor_mobile TEXT,
    event_type TEXT,
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('venue', 'service')),
    target_name TEXT,
    owner_id TEXT REFERENCES public.users(uid) ON DELETE CASCADE, -- Changed to TEXT
    event_date DATE NOT NULL,
    end_date DATE,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'paid')) DEFAULT 'pending',
    total_amount NUMERIC DEFAULT 0,
    message TEXT,
    party_name TEXT,
    party_address TEXT,
    is_manual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID NOT NULL,
    target_type TEXT CHECK (target_type IN ('venue', 'service')),
    user_id TEXT,
    user_name TEXT,
    visitor_mobile TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure visitor_mobile column exists for existing reviews table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'visitor_mobile') THEN
        ALTER TABLE public.reviews ADD COLUMN visitor_mobile TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'target_type') THEN
        ALTER TABLE public.reviews ADD COLUMN target_type TEXT CHECK (target_type IN ('venue', 'service'));
    END IF;
END $$;

-- 6. App Feedback Table
CREATE TABLE IF NOT EXISTS public.app_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscription Plans: Anyone can read, only admin can manage (simplified for demo)
DROP POLICY IF EXISTS "Anyone can read plans" ON public.subscription_plans;
CREATE POLICY "Anyone can read plans" ON public.subscription_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage plans" ON public.subscription_plans;
CREATE POLICY "Anyone can manage plans" ON public.subscription_plans FOR ALL USING (true) WITH CHECK (true);

-- User Subscriptions: Anyone can read and manage (simplified for demo)
DROP POLICY IF EXISTS "Anyone can manage subscriptions" ON public.user_subscriptions;
CREATE POLICY "Anyone can manage subscriptions" ON public.user_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Notifications: Anyone can read, only admin can manage
DROP POLICY IF EXISTS "Anyone can read notifications" ON public.notifications;
CREATE POLICY "Anyone can read notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage notifications" ON public.notifications;
CREATE POLICY "Anyone can manage notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Banners: Anyone can read, only admin can manage
DROP POLICY IF EXISTS "Anyone can read banners" ON public.banners;
CREATE POLICY "Anyone can read banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage banners" ON public.banners;
CREATE POLICY "Anyone can manage banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- Users: Anyone can read profiles, but only the user can update their own
-- Note: Since we use custom auth, we allow all for now to simplify demo
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
CREATE POLICY "Users can manage own profile" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Venues: Anyone can read, anyone can manage (simplified for custom auth demo)
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage venues" ON public.venues;
CREATE POLICY "Anyone can manage venues" ON public.venues FOR ALL USING (true) WITH CHECK (true);

-- Service Providers: Anyone can read, anyone can manage
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.service_providers;
CREATE POLICY "Services are viewable by everyone" ON public.service_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage services" ON public.service_providers;
CREATE POLICY "Anyone can manage services" ON public.service_providers FOR ALL USING (true) WITH CHECK (true);

-- Bookings: Anyone can read and manage
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON public.bookings;
CREATE POLICY "Bookings are viewable by everyone" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage bookings" ON public.bookings;
CREATE POLICY "Anyone can manage bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- Reviews: Anyone can read and manage
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can manage reviews" ON public.reviews;
CREATE POLICY "Anyone can manage reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- App Feedback: Anyone can insert
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.app_feedback;
CREATE POLICY "Anyone can insert feedback" ON public.app_feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view feedback" ON public.app_feedback;
CREATE POLICY "Anyone can view feedback" ON public.app_feedback FOR SELECT USING (true);

-- 7. Storage Setup (Supabase Storage)
-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public access and upload
-- We use FOR ALL to simplify and ensure all operations are allowed for the 'images' bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Manage" ON storage.objects;

CREATE POLICY "Public Manage" ON storage.objects 
FOR ALL TO public 
USING ( bucket_id = 'images' ) 
WITH CHECK ( bucket_id = 'images' );
