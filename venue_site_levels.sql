-- SQL Migration to add Site Levels to Venues
-- This column stores an array of site level strings (e.g., 'rooms(ac)', 'garden', etc.)
-- Only for venues, as requested.

ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS site_levels JSONB DEFAULT '[]';

-- Optional: Add a comment to describe the field
COMMENT ON COLUMN venues.site_levels IS 'Array of venue site levels like halls, gardens, rooms, etc.';
