-- Create dependency_graph table for storing parsed dependencies
CREATE TABLE public.dependency_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_profile_id UUID NOT NULL REFERENCES public.claimed_profiles(id) ON DELETE CASCADE,
  crate_name TEXT NOT NULL,
  current_version TEXT,
  latest_version TEXT,
  months_behind INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,
  crates_io_url TEXT,
  crates_io_dependents INTEGER DEFAULT 0,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_profile_id, crate_name)
);

-- Create index for fast lookups by profile
CREATE INDEX idx_dependency_graph_source_profile ON public.dependency_graph(source_profile_id);

-- Enable Row Level Security
ALTER TABLE public.dependency_graph ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Dependency graph is publicly readable" 
ON public.dependency_graph 
FOR SELECT 
USING (true);