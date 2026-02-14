ALTER TABLE public.claimed_profiles ADD COLUMN IF NOT EXISTS x_avatar_url TEXT;
ALTER TABLE public.claimed_profiles ADD COLUMN IF NOT EXISTS x_display_name TEXT;