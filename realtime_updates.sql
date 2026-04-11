-- Enable Realtime for app_feedback and reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- Add visitor_mobile to app_feedback if missing
ALTER TABLE public.app_feedback ADD COLUMN IF NOT EXISTS visitor_mobile TEXT;
