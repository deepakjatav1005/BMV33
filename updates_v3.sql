-- Add is_invoice_generated to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT FALSE;
