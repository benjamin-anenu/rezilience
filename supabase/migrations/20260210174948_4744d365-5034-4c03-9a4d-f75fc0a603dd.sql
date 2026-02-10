CREATE TABLE public.ecosystem_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  total_projects INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  avg_resilience_score NUMERIC NOT NULL DEFAULT 0,
  total_commits_30d INTEGER NOT NULL DEFAULT 0,
  total_contributors INTEGER NOT NULL DEFAULT 0,
  total_tvl_usd NUMERIC NOT NULL DEFAULT 0,
  avg_dependency_health NUMERIC NOT NULL DEFAULT 0,
  total_governance_tx INTEGER NOT NULL DEFAULT 0,
  healthy_count INTEGER NOT NULL DEFAULT 0,
  stale_count INTEGER NOT NULL DEFAULT 0,
  decaying_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ecosystem_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.ecosystem_snapshots FOR SELECT USING (true);