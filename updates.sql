-- Update service_providers table
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS price_level TEXT;

-- Update bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_amount NUMERIC;

-- Note: catalogue is already a JSONB column in venues and service_providers, 
-- so it can store the new 'videos' array without schema changes.
