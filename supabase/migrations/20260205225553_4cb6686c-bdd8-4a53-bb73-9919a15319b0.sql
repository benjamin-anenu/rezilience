-- Add GitHub access token storage to claimed_profiles
ALTER TABLE public.claimed_profiles 
ADD COLUMN github_access_token TEXT;

-- Add token scope for reference
ALTER TABLE public.claimed_profiles 
ADD COLUMN github_token_scope TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.claimed_profiles.github_access_token IS 'Encrypted GitHub OAuth access token for user-specific API calls';
COMMENT ON COLUMN public.claimed_profiles.github_token_scope IS 'OAuth scopes granted by the user';