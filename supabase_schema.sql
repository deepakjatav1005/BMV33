-- Supabase Schema for Event Management App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Profiles)
CREATE TABLE public.users (
    uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_id TEXT UNIQUE,
    display_name TEXT,
    father_name TEXT,
    mobile_number TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT CHECK (role IN ('admin', 'owner', 'provider', 'user')),
    state TEXT,
    district TEXT,
    block TEXT,
    pincode TEXT,
    venue_type TEXT,
    password TEXT, -- Note: In a real Supabase app, passwords are handled by auth.users, but the app seems to store it here too for some logic.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Venues Table
CREATE TABLE public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(uid) ON DELETE CASCADE,
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
    images TEXT[], -- Array of image URLs
    facilities TEXT[], -- Array of facilities
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Service Providers Table
CREATE TABLE public.service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.users(uid) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_type TEXT,
    description TEXT,
    price_range TEXT,
    price_level TEXT,
    city TEXT,
    images TEXT[],
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(uid) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.users(uid) ON DELETE SET NULL,
    visitor_name TEXT,
    visitor_mobile TEXT,
    event_type TEXT,
    target_id UUID, -- Can be venue id or service provider id
    target_type TEXT CHECK (target_type IN ('venue', 'service')),
    target_name TEXT,
    event_date DATE,
    total_amount NUMERIC,
    updated_amount NUMERIC,
    payment_status TEXT DEFAULT 'pending',
    payment_mode TEXT,
    is_invoice_generated BOOLEAN DEFAULT FALSE,
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(uid) ON DELETE SET NULL,
    user_name TEXT,
    target_id UUID,
    target_type TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. App Feedback Table (Testimonials)
CREATE TABLE public.app_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(uid) ON DELETE SET NULL,
    user_name TEXT,
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Admin Settings Table
CREATE TABLE public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Subscription Plans Table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    role TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Subscriptions Table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(uid) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Banners Table
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Service Type Photos Table
CREATE TABLE public.service_type_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Example)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = uid);

-- Add more policies as needed for other tables...
