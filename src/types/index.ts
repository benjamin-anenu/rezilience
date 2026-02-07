// Re-export all database types
export * from './database';

// Resilience Type Definitions

export interface Program {
  id: string;
  name: string;
  programId: string;
  score: number;
  livenessStatus: 'active' | 'dormant' | 'degraded';
  originalityStatus: 'verified' | 'unverified' | 'fork' | 'not-deployed';
  stakedAmount: number;
  lastUpgrade: string;
  upgradeCount: number;
  rank: number;
}

export interface UpgradeEvent {
  date: string;
  type: 'upgrade' | 'authority_change' | 'stake_added' | 'stake_removed';
  description: string;
  txHash: string;
}

export interface ChartDataPoint {
  month: string;
  upgrades: number;
  score: number;
}

export interface EcosystemStats {
  programsIndexed: number;
  averageScore: number;
  totalStaked: number;
  activePrograms: number;
}

export interface StakingFormData {
  programId: string;
  programName: string;
  amount: number;
  lockupMonths: number;
}

export interface BondSummary {
  currentScore: number;
  projectedScore: number;
  scoreIncrease: number;
  estimatedAPY: number;
  unlockDate: string;
}

// X (Twitter) Authentication Types
export interface XUser {
  id: string;
  username: string;
  avatarUrl: string;
}

// Claim Profile Types
export interface VerificationStep {
  step: number;
  label: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
}

export interface GitHubData {
  repoUrl: string;
  stars: number;
  forks: number;
  activeContributors: number;
  commitVelocity: number;
  lastCommitDate: string;
  openIssues: number;
  releases: number;
  // Extended fields from spec
  isFork?: boolean;
  commitsLast30Days?: number;
  topContributors?: string[];
  language?: string;
}

export interface ResilienceScoreResult {
  score: number;
  livenessStatus: 'active' | 'dormant' | 'degraded';
  breakdown: {
    liveness: number;
    originality: number;
    assurance: number;
  };
}

// Media & Roadmap Types
export interface MediaAsset {
  id: string;
  type: 'image' | 'youtube' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  isLocked: boolean;
  status: 'upcoming' | 'completed' | 'overdue';
  varianceRequested?: boolean;
}

export interface SocialLinks {
  xHandle?: string;
  discordUrl?: string;
  telegramUrl?: string;
}

// Category options
export type ProjectCategory = 
  | 'defi' 
  | 'nft' 
  | 'infrastructure' 
  | 'gaming' 
  | 'social' 
  | 'dao' 
  | 'payments' 
  | 'developer-tools' 
  | 'other';

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT / Digital Collectibles' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'social', label: 'Social' },
  { value: 'dao', label: 'DAO / Governance' },
  { value: 'payments', label: 'Payments' },
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'other', label: 'Other' },
];

// Top Contributor for charts
export interface TopContributor {
  login: string;
  contributions: number;
  avatar: string;
}

// Recent Event for activity charts
export interface RecentEvent {
  type: string;
  actor: string;
  date: string;
  createdAt: string;
  message?: string;
}

// GitHub Analytics for Dashboard
export interface GitHubAnalytics {
  github_org_url?: string;
  github_stars?: number;
  github_forks?: number;
  github_contributors?: number;
  github_language?: string;
  github_last_commit?: string;
  github_commit_velocity?: number;
  github_commits_30d?: number;
  github_releases_30d?: number;
  github_open_issues?: number;
  github_topics?: string[];
  github_top_contributors?: TopContributor[];
  github_recent_events?: RecentEvent[];
  github_analyzed_at?: string;
  github_is_fork?: boolean;
  // Multi-signal activity fields
  github_push_events_30d?: number;
  github_pr_events_30d?: number;
  github_issue_events_30d?: number;
  github_last_activity?: string;
}

// Build In Public Video (Twitter video links)
export interface BuildInPublicVideo {
  id: string;
  url: string;
  tweetUrl: string;
  thumbnailUrl?: string;
  title?: string;
  timestamp?: string;
}

// Twitter Tweet for engagement display
export interface TwitterTweet {
  id: string;
  text: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
}

// Twitter Engagement Metrics
export interface TwitterMetrics {
  followers: number;
  engagementRate: number;
  recentTweets: TwitterTweet[];
  lastSynced?: string;
}

// Complete Claimed Profile
export interface ClaimedProfile {
  id: string;
  
  // Core Identity (Step 2)
  projectName: string;
  description?: string;
  category: ProjectCategory;
  websiteUrl?: string;
  logoUrl?: string;
  programId?: string;
  walletAddress?: string;
  
  // Auth (Step 1)
  xUserId: string;
  xUsername: string;
  
  // GitHub (Step 3)
  githubOrgUrl: string;
  githubUsername?: string;
  
  // Socials (Step 3)
  socials: SocialLinks;
  
  // Media (Step 4)
  mediaAssets: MediaAsset[];
  
  // Roadmap (Step 5)
  milestones: Milestone[];
  
  // Verification
  verified: boolean;
  verifiedAt: string;
  score: number;
  livenessStatus: 'active' | 'dormant' | 'degraded';
  
  // Extended GitHub Analytics (populated from DB)
  githubAnalytics?: GitHubAnalytics;
  
  // Build In Public & Twitter Integration (Phase 2)
  buildInPublicVideos?: BuildInPublicVideo[];
  twitterMetrics?: TwitterMetrics;
}

// Form data for multi-step claim flow
export interface ClaimProfileFormData {
  // Step 2: Core Identity
  projectName: string;
  description: string;
  category: ProjectCategory | '';
  websiteUrl: string;
  programId: string;
  walletAddress: string;
  
  // Step 3: Socials
  githubOrgUrl: string;
  discordUrl: string;
  telegramUrl: string;
  
  // Step 4: Media
  mediaAssets: MediaAsset[];
  
  // Step 5: Roadmap
  milestones: Milestone[];
}
