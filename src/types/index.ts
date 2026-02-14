// Re-export all database types
export * from './database';

// Rezilience Type Definitions

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
  name?: string;
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
  completedAt?: string;
  originalTargetDate?: string;
}

// Phase-based Roadmap Types (v2)
export interface PhaseMilestone {
  id: string;
  title: string;
  description: string;
  targetDate?: string;
  status: 'upcoming' | 'completed' | 'overdue';
  completedAt?: string;
}

export interface Phase {
  id: string;
  title: string;
  isLocked: boolean;
  varianceRequested?: boolean;
  milestones: PhaseMilestone[];
  order: number;
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
  github_languages?: Record<string, number>;
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

// Multi-Dimensional Scoring Metrics
export interface DependencyMetrics {
  dependency_health_score?: number;
  dependency_outdated_count?: number;
  dependency_critical_count?: number;
  dependency_analyzed_at?: string;
}

export interface GovernanceMetrics {
  governance_address?: string;
  governance_tx_30d?: number;
  governance_last_activity?: string;
  governance_analyzed_at?: string;
}

export interface TVLMetrics {
  tvl_usd?: number;
  tvl_market_share?: number;
  tvl_risk_ratio?: number;
  tvl_analyzed_at?: string;
}

export interface ScoreBreakdown {
  github: number;
  dependency: number;
  governance: number;
  tvl: number;
}

export interface IntegratedScoreMetrics {
  integrated_score?: number;
  score_breakdown?: ScoreBreakdown;
}

// Build In Public Video (Twitter video links)
export interface BuildInPublicVideo {
  id: string;
  url: string;
  tweetUrl?: string;  // Optional - legacy field, new entries use url
  thumbnailUrl?: string;
  title?: string;
  timestamp?: string;
}

// Team Member Role Options
export type TeamMemberRole = 'developer' | 'founder' | 'other';

// Individual Team Member
export interface TeamMember {
  id: string;
  imageUrl?: string;
  name: string;
  nickname?: string;
  jobTitle: string;
  whyFit: string;
  role: TeamMemberRole;
  customRole?: string;
  order: number;
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
  
  // Roadmap (Step 5) - Phase-based
  milestones: Phase[];
  
  // Verification
  verified: boolean;
  verifiedAt: string;
  score: number;
  livenessStatus: 'active' | 'dormant' | 'degraded';
  
  // Extended GitHub Analytics (populated from DB)
  githubAnalytics?: GitHubAnalytics;
  
  // Bytecode Verification (Phase 2 - Hardened)
  bytecodeHash?: string;
  bytecodeVerifiedAt?: string;
  bytecodeMatchStatus?: 'original' | 'fork' | 'unknown' | 'not-deployed';
  bytecodeConfidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'SUSPICIOUS' | 'NOT_DEPLOYED';
  bytecodeDeploySlot?: number;
  bytecodeOnChainHash?: string;
  
  // Build In Public & Twitter Integration (Phase 2)
  buildInPublicVideos?: BuildInPublicVideo[];
  twitterMetrics?: TwitterMetrics;
  
  // Team Section
  teamMembers?: TeamMember[];
  stakingPitch?: string;
  
  // X Profile Data
  xAvatarUrl?: string;
  xDisplayName?: string;
  
  // Authority Verification (SIWS)
  authorityWallet?: string;
  authorityVerifiedAt?: string;
  authoritySignature?: string;
  authorityType?: 'direct' | 'multisig' | 'immutable';
  
  // Multisig Verification (Squads)
  multisigAddress?: string;
  squadsVersion?: 'v3' | 'v4';
  multisigVerifiedVia?: 'member_signature' | 'transaction_proof' | 'manual_review';
  
  // Multi-Dimensional Scoring (Full-Spectrum Rezilience)
  dependencyMetrics?: DependencyMetrics;
  governanceMetrics?: GovernanceMetrics;
  tvlMetrics?: TVLMetrics;
  integratedScore?: number;
  scoreBreakdown?: ScoreBreakdown;
  claimStatus?: 'claimed' | 'unclaimed' | 'pending';
  // Vulnerability & Security Posture
  vulnerabilityCount?: number;
  vulnerabilityDetails?: Array<{ id: string; summary?: string; severity?: string }>;
  vulnerabilityAnalyzedAt?: string;
  openssfScore?: number;
  openssfChecks?: Record<string, unknown>;
  openssfAnalyzedAt?: string;
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
  
  // Step 5: Roadmap (Phase-based)
  milestones: Phase[];
}
