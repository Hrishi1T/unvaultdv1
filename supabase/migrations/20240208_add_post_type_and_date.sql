ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'live' CHECK (post_type IN ('live', 'upcoming'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS garment_name TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS brand_website TEXT;
