-- Add unique constraint on project_name for upsert deduplication
ALTER TABLE public.claimed_profiles
ADD CONSTRAINT claimed_profiles_project_name_key UNIQUE (project_name);