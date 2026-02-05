// Resilience Score calculation using exponential decay formula
// R(P, t) = (O × I) × e^(-λ * t) + S

import { LivenessStatus, ScoringResult, ExtendedGitHubData } from '@/types/database';

const DECAY_LAMBDA = 0.05; // Decay constant per month
const MAX_BASE_SCORE = 4; // Maximum base score for normalization

/**
 * Calculate Originality factor (O)
 * Scale: 0.3 for forks, 1.0 for original code
 */
function calculateOriginality(isFork: boolean): number {
  return isFork ? 0.3 : 1.0;
}

/**
 * Calculate Impact factor (I)
 * Logarithmic scale: log10(contributors + stars)
 */
function calculateImpact(contributors: number, stars: number): number {
  const combined = Math.max(contributors + stars, 1);
  return Math.log10(combined);
}

/**
 * Calculate Decay factor
 * Exponential decay: e^(-λ * months)
 */
function calculateDecay(daysSinceLastCommit: number): number {
  const monthsSinceLastCommit = daysSinceLastCommit / 30;
  return Math.exp(-DECAY_LAMBDA * monthsSinceLastCommit);
}

/**
 * Calculate Stake bonus (S)
 * SOL / 1000 for logarithmic scaling
 */
function calculateStakeBonus(stakedSOL: number): number {
  return stakedSOL / 1000;
}

/**
 * Determine liveness status based on activity
 */
function determineLivenessStatus(
  daysSinceLastCommit: number,
  commitsLast30Days: number
): LivenessStatus {
  if (daysSinceLastCommit < 30 && commitsLast30Days >= 5) {
    return 'ACTIVE';
  } else if (daysSinceLastCommit < 90) {
    return 'STALE';
  }
  return 'DECAYING';
}

/**
 * Calculate days since a given date
 */
function daysSince(date: Date | string): number {
  const then = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Main Resilience Score calculation
 * Formula: R(P, t) = (O × I) × e^(-λ * t) + S
 * Normalized to 0-100 scale
 */
export function calculateResilienceScore(
  githubData: {
    isFork: boolean;
    activeContributors: number;
    stars: number;
    lastCommitDate: string;
    commitsLast30Days?: number;
  },
  onchainData: {
    stakedSOL: number;
  }
): ScoringResult {
  // Calculate components
  const O = calculateOriginality(githubData.isFork);
  const I = calculateImpact(githubData.activeContributors, githubData.stars);
  const daysSinceLastCommit = daysSince(githubData.lastCommitDate);
  const decayFactor = calculateDecay(daysSinceLastCommit);
  const S = calculateStakeBonus(onchainData.stakedSOL);

  // Apply formula: R = (O × I) × decay + S
  const baseScore = (O * I) * decayFactor;
  const finalScore = baseScore + S;

  // Normalize to 0-100 scale
  const normalizedScore = Math.min((finalScore / MAX_BASE_SCORE) * 100, 100);

  // Determine liveness status
  const commitsLast30Days = githubData.commitsLast30Days ?? 0;
  const livenessStatus = determineLivenessStatus(daysSinceLastCommit, commitsLast30Days);

  return {
    score: Math.round(normalizedScore),
    livenessStatus,
    breakdown: {
      originality: O,
      impact: parseFloat(I.toFixed(2)),
      decayFactor: parseFloat(decayFactor.toFixed(4)),
      stakeBonus: parseFloat(S.toFixed(2)),
      baseScore: parseFloat(baseScore.toFixed(2)),
      finalScore: parseFloat(finalScore.toFixed(2)),
    },
  };
}

/**
 * Calculate score from database project record
 * Convenience wrapper for DBProject data
 */
export function calculateScoreFromProject(project: {
  is_fork: boolean;
  github_contributors: number;
  github_stars: number;
  github_last_commit: string | null;
  github_commit_velocity: number;
  total_staked: number;
}): ScoringResult {
  const lastCommitDate = project.github_last_commit || new Date().toISOString();
  const commitsLast30Days = Math.round(project.github_commit_velocity * 30);

  return calculateResilienceScore(
    {
      isFork: project.is_fork,
      activeContributors: project.github_contributors,
      stars: project.github_stars,
      lastCommitDate,
      commitsLast30Days,
    },
    {
      stakedSOL: project.total_staked,
    }
  );
}

/**
 * Get score tier for display
 */
export function getScoreTier(score: number): {
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
} {
  if (score >= 90) return { tier: 'S', label: 'TITAN', color: 'text-primary' };
  if (score >= 80) return { tier: 'A', label: 'ELITE', color: 'text-primary' };
  if (score >= 70) return { tier: 'B', label: 'SOLID', color: 'text-foreground' };
  if (score >= 60) return { tier: 'C', label: 'MODERATE', color: 'text-muted-foreground' };
  if (score >= 50) return { tier: 'D', label: 'AT RISK', color: 'text-warning' };
  return { tier: 'F', label: 'CRITICAL', color: 'text-destructive' };
}
