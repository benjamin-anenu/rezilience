// GitHub API utilities for fetching repository data
import { GitHubData } from '@/types';

/**
 * Build the GitHub OAuth authorization URL
 */
export function buildGitHubOAuthUrl(redirectUri: string, state: string): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  
  if (!clientId) {
    console.error('VITE_GITHUB_CLIENT_ID not configured');
    // Return a placeholder that will show an error
    return '#github-oauth-not-configured';
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user read:org repo',
    state,
  });
  
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Generate a CSRF state token for OAuth
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Fetch GitHub repository data
 * In Phase 0, this returns mock data. When connected to backend,
 * this will make actual GitHub API calls.
 */
export async function fetchGitHubData(repoUrl: string): Promise<GitHubData> {
  // Phase 0: Return mock data based on repo URL
  // In production, this would use the GitHub API with the OAuth token
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate semi-random but consistent data based on URL hash
  const hash = repoUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    repoUrl,
    stars: 500 + (hash % 5000),
    forks: 50 + (hash % 500),
    activeContributors: 5 + (hash % 25),
    commitVelocity: 0.5 + (hash % 30) / 10, // 0.5 - 3.5 commits per day
    lastCommitDate: new Date(Date.now() - (hash % 7) * 24 * 60 * 60 * 1000).toISOString(),
    openIssues: 10 + (hash % 100),
    releases: 5 + (hash % 20),
  };
}

/**
 * Calculate GitHub-specific metrics from raw data
 */
export function calculateGitHubMetrics(data: GitHubData) {
  const daysSinceLastCommit = Math.floor(
    (Date.now() - new Date(data.lastCommitDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Activity status based on commit recency
  const activityStatus = 
    daysSinceLastCommit <= 7 ? 'high' :
    daysSinceLastCommit <= 30 ? 'medium' :
    daysSinceLastCommit <= 90 ? 'low' : 'inactive';
  
  // Community health based on stars, forks, contributors
  const communityScore = Math.min(100, 
    (data.stars / 50) + 
    (data.forks / 10) + 
    (data.activeContributors * 2)
  );
  
  // Velocity score based on commit frequency
  const velocityScore = Math.min(100, data.commitVelocity * 30);
  
  return {
    daysSinceLastCommit,
    activityStatus,
    communityScore: Math.round(communityScore),
    velocityScore: Math.round(velocityScore),
    monthlyCommits: Math.round(data.commitVelocity * 30),
  };
}

/**
 * Validate a GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url);
}

/**
 * Extract owner and repo name from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}
