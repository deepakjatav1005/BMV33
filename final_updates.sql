-- Final updates for booking flow and management modules

-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_services JSONB DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_mode TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add missing columns to service_providers table
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS price_level TEXT;

-- Add missing columns to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS available_for TEXT[] DEFAULT '{}';

-- Ensure RLS is enabled and policies are set (simplified for this update)
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for now" ON bookings FOR ALL USING (true);
