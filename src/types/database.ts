// Database-aligned type definitions for Supabase

export type LivenessStatus = 'ACTIVE' | 'STALE' | 'DECAYING';

// Direct mapping to projects table
export interface DBProject {
  id: string;
  created_at: string;
  updated_at: string;
  program_id: string;
  program_name: string;
  description: string | null;
  github_url: string | null;
  website_url: string | null;
  logo_url: string | null;
  verified: boolean;
  github_stars: number;
  github_forks: number;
  github_contributors: number;
  github_last_commit: string | null;
  github_commit_velocity: number;
  is_fork: boolean;
  github_language: string | null;
  program_authority: string | null;
  is_multisig: boolean;
  last_onchain_activity: string | null;
  resilience_score: number;
  liveness_status: LivenessStatus;
  originality_score: number;
  total_staked: number;
}

// Score history entry
export interface DBScoreHistory {
  id: string;
  project_id: string;
  score: number;
  snapshot_date: string;
  commit_velocity: number | null;
  days_last_commit: number | null;
  breakdown: {
    originality: number;
    impact: number;
    decay: number;
    stake: number;
  } | null;
}

// Bond entry
export interface DBBond {
  id: string;
  project_id: string;
  user_wallet: string;
  staked_amount: number;
  locked_until: string;
  created_at: string;
  yield_earned: number;
}

// Extended GitHub data with all fields from spec
export interface ExtendedGitHubData {
  repoUrl: string;
  stars: number;
  forks: number;
  activeContributors: number;
  commitVelocity: number;
  lastCommitDate: string;
  openIssues: number;
  releases: number;
  // New fields from spec
  isFork: boolean;
  commitsLast30Days: number;
  topContributors: string[];
  language: string;
}

// Scoring result with breakdown
export interface ScoringResult {
  score: number;
  livenessStatus: LivenessStatus;
  breakdown: {
    originality: number;
    impact: number;
    decayFactor: number;
    stakeBonus: number;
    baseScore: number;
    finalScore: number;
  };
}

// Ecosystem statistics (aggregated)
export interface DBEcosystemStats {
  programsIndexed: number;
  averageScore: number;
  totalStaked: number;
  activePrograms: number;
}

// Insert/Update types
export type ProjectInsert = Omit<DBProject, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;
