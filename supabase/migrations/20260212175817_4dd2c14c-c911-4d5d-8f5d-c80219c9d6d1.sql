
-- Create a secure table for sensitive credentials
CREATE TABLE public.profile_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.claimed_profiles(id) ON DELETE CASCADE,
  github_access_token text,
  github_token_scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_secrets ENABLE ROW LEVEL SECURITY;

-- NO public SELECT policy — only service_role can read this table
-- This ensures tokens are never exposed through the API

-- Migrate existing tokens
INSERT INTO public.profile_secrets (profile_id, github_access_token, github_token_scope)
SELECT id, github_access_token, github_token_scope
FROM public.claimed_profiles
WHERE github_access_token IS NOT NULL;

-- Null out tokens on the public table
UPDATE public.claimed_profiles
SET github_access_token = NULL, github_token_scope = NULL
WHERE github_access_token IS NOT NULL;
