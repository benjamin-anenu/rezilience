-- Add columns for multi-dimensional Full-Spectrum Resilience scoring
-- Phase 1: Dependency Health (Crates.io)
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS dependency_health_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS dependency_outdated_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependency_critical_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependency_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Phase 2: TVL Metrics (DeFiLlama)
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS tvl_usd NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tvl_market_share NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tvl_risk_ratio NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tvl_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Phase 3: Governance Health (Squads/Realms)
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS governance_address TEXT,
ADD COLUMN IF NOT EXISTS governance_tx_30d INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS governance_last_activity TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS governance_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Phase 4: Integrated Score
ALTER TABLE public.claimed_profiles
ADD COLUMN IF NOT EXISTS integrated_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.claimed_profiles.dependency_health_score IS '0-100 score from Crates.io dependency analysis';
COMMENT ON COLUMN public.claimed_profiles.tvl_usd IS 'Total Value Locked from DeFiLlama API';
COMMENT ON COLUMN public.claimed_profiles.tvl_risk_ratio IS 'TVL-to-commit ratio for risk assessment';
COMMENT ON COLUMN public.claimed_profiles.governance_tx_30d IS 'Governance transactions in last 30 days';
COMMENT ON COLUMN public.claimed_profiles.integrated_score IS 'Multi-dimensional weighted resilience score';
COMMENT ON COLUMN public.claimed_profiles.score_breakdown IS 'JSON breakdown: {github, dependency, governance, tvl}';