-- Add admin_mobile to admin_settings if it doesn't exist
INSERT INTO admin_settings (key, value)
VALUES ('admin_mobile', '0000000000')
ON CONFLICT (key) DO NOTHING;
