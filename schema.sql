-- SQL Schema Updates

-- 1. Update `bookings` table to include `start_time`, `end_time`, and `updated_amount`
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_amount NUMERIC;

-- 2. Create `admin_settings` table to store admin password
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert default admin password if not exists
INSERT INTO admin_settings (key, value)
VALUES ('admin_password', 'admin_password_2026')
ON CONFLICT (key) DO NOTHING;
