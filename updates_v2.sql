-- Add password column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Ensure status column exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Ensure admin_settings table exists for admin credentials
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Insert default admin password if not exists
INSERT INTO admin_settings (key, value) 
VALUES ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;

-- Insert default admin mobile if not exists
INSERT INTO admin_settings (key, value) 
VALUES ('admin_mobile', '0000000000')
ON CONFLICT (key) DO NOTHING;
