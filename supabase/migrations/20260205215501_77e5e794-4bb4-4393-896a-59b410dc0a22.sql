-- Create liveness status enum
CREATE TYPE public.liveness_status AS ENUM ('ACTIVE', 'STALE', 'DECAYING');

-- Projects table (main registry)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Core identity
  program_id VARCHAR(44) NOT NULL UNIQUE,
  program_name VARCHAR(255) NOT NULL,
  description TEXT,
  github_url VARCHAR(500),
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- GitHub data (cached from API)
  github_stars INT DEFAULT 0,
  github_forks INT DEFAULT 0,
  github_contributors INT DEFAULT 0,
  github_last_commit TIMESTAMP WITH TIME ZONE,
  github_commit_velocity DECIMAL DEFAULT 0,
  is_fork BOOLEAN DEFAULT FALSE,
  github_language VARCHAR(50),
  
  -- On-chain data
  program_authority VARCHAR(44),
  is_multisig BOOLEAN DEFAULT FALSE,
  last_onchain_activity TIMESTAMP WITH TIME ZONE,
  
  -- Resilience Score (calculated)
  resilience_score DECIMAL DEFAULT 0,
  liveness_status public.liveness_status DEFAULT 'STALE',
  originality_score DECIMAL DEFAULT 1.0,
  
  -- Staking
  total_staked DECIMAL DEFAULT 0
);

-- Score history for tracking changes over time
CREATE TABLE public.score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  commit_velocity DECIMAL,
  days_last_commit INT,
  breakdown JSONB
);

-- Bonds table (Phase 1 preparation)
CREATE TABLE public.bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_wallet VARCHAR(44) NOT NULL,
  staked_amount DECIMAL NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  yield_earned DECIMAL DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_projects_program_id ON public.projects(program_id);
CREATE INDEX idx_projects_resilience_score ON public.projects(resilience_score DESC);
CREATE INDEX idx_projects_verified ON public.projects(verified);
CREATE INDEX idx_score_history_project_id ON public.score_history(project_id);
CREATE INDEX idx_score_history_date ON public.score_history(snapshot_date DESC);
CREATE INDEX idx_bonds_project_id ON public.bonds(project_id);
CREATE INDEX idx_bonds_user_wallet ON public.bonds(user_wallet);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (public read, admin write)
CREATE POLICY "Projects are publicly readable"
ON public.projects FOR SELECT
USING (true);

-- RLS Policies for score_history (public read)
CREATE POLICY "Score history is publicly readable"
ON public.score_history FOR SELECT
USING (true);

-- RLS Policies for bonds (public read for transparency)
CREATE POLICY "Bonds are publicly readable"
ON public.bonds FOR SELECT
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();