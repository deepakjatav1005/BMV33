-- Create service_type_photos table
CREATE TABLE IF NOT EXISTS service_type_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE service_type_photos;
