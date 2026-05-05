-- SQL Migration to add Facility Details support
-- This adds JSONB columns to store the detailed facility list (name, rate, unit, photo)

-- Update Venues table
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS facility_details JSONB DEFAULT '[]';

-- Update Service Providers table
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS catalogue JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS facility_details JSONB DEFAULT '[]';

-- Metadata for tracking (optional)
COMMENT ON COLUMN venues.facility_details IS 'Stores array of facility objects with name, rate, unit, and photoUrl';
COMMENT ON COLUMN service_providers.facility_details IS 'Stores array of facility objects with name, rate, unit, and photoUrl';
