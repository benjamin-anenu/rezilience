// Resilience Score calculation algorithm
import { GitHubData, ResilienceScoreResult } from '@/types';
import { calculateGitHubMetrics } from './github';

/**
 * Calculate Liveness Score (40% of total)
 * Based on commit frequency and recency
 */
function calculateLiveness(githubData: GitHubData): number {
  const metrics = calculateGitHubMetrics(githubData);
  
  // Velocity component (0-50 points)
  const velocityPoints = Math.min(50, metrics.velocityScore / 2);
  
  // Recency component (0-50 points)
  // Full points if last commit within 7 days, decreasing after
  const recencyPoints = 
    metrics.daysSinceLastCommit <= 7 ? 50 :
    metrics.daysSinceLastCommit <= 14 ? 40 :
    metrics.daysSinceLastCommit <= 30 ? 30 :
    metrics.daysSinceLastCommit <= 60 ? 20 :
    metrics.daysSinceLastCommit <= 90 ? 10 : 0;
  
  return Math.round(velocityPoints + recencyPoints);
}

/**
 * Calculate Originality Score (30% of total)
 * Based on community engagement and contributor diversity
 */
function calculateOriginality(githubData: GitHubData): number {
  const metrics = calculateGitHubMetrics(githubData);
  
  // Community score (0-50 points)
  const communityPoints = Math.min(50, metrics.communityScore / 2);
  
  // Contributor diversity (0-30 points)
  const contributorPoints = Math.min(30, githubData.activeContributors * 2);
  
  // Fork ratio penalty - high fork-to-star ratio might indicate a fork
  const forkRatio = githubData.forks / Math.max(1, githubData.stars);
  const originalityBonus = forkRatio < 0.3 ? 20 : forkRatio < 0.5 ? 10 : 0;
  
  return Math.round(communityPoints + contributorPoints + originalityBonus);
}

/**
 * Calculate Assurance Score (30% of total)
 * Based on staked SOL amount
 */
function calculateAssurance(stake: { stakedSOL: number }): number {
  // Logarithmic scale to prevent whale dominance
  // 1 SOL = 10 points, 10 SOL = 20 points, 100 SOL = 40 points, etc.
  if (stake.stakedSOL <= 0) return 0;
  
  const logPoints = Math.log10(stake.stakedSOL) * 20;
  return Math.round(Math.min(100, logPoints));
}

/**
 * Calculate the full Resilience Score
 * Combines Liveness (40%), Originality (30%), and Assurance (30%)
 */
export function calculateResilienceScore(
  githubData: GitHubData, 
  stake: { stakedSOL: number }
): ResilienceScoreResult {
  const livenessScore = calculateLiveness(githubData);
  const originalityScore = calculateOriginality(githubData);
  const assuranceScore = calculateAssurance(stake);
  
  // Weighted average
  const totalScore = Math.round(
    livenessScore * 0.4 + 
    originalityScore * 0.3 + 
    assuranceScore * 0.3
  );
  
  // Determine liveness status
  const livenessStatus: 'active' | 'dormant' | 'degraded' = 
    livenessScore > 70 ? 'active' :
    livenessScore > 40 ? 'degraded' : 'dormant';
  
  return {
    score: totalScore,
    livenessStatus,
    breakdown: {
      liveness: livenessScore,
      originality: originalityScore,
      assurance: assuranceScore,
    },
  };
}

/**
 * Get score tier based on numeric score
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
