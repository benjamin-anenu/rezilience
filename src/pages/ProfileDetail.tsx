import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  HeroBanner,
  QuickStats,
  StickyCTA,
  ProgramTabs,
  AboutTabContent,
  DevelopmentTabContent,
  CommunityTabContent,
  RoadmapTabContent,
  SupportTabContent,
  TeamTabContent,
} from '@/components/program';
import { SettingsTab, BuildInPublicTab, TeamManagement, MediaTab } from '@/components/profile/tabs';
import { RoadmapManagement } from '@/components/profile/tabs/RoadmapManagement';
import { FundingStatusWidget } from '@/components/profile/FundingStatusWidget';
import { PROJECT_CATEGORIES } from '@/types';
import { useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAuth } from '@/context/AuthContext';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { trackEvent } = useAnalyticsTracker();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (id) trackEvent('click', 'profile_view', { profile_id: id });
  }, [id, trackEvent]);

  const { data: profile, isLoading, error } = useClaimedProfile(id || '');

  // Strict ownership check: only x_user_id match (username is mutable and exploitable)
  const isOwner = !!(user && profile && user.id && profile.xUserId && user.id === profile.xUserId);

  // Debug log for owner detection issues
  if (user && profile && !isOwner) {
    console.log('[OwnerCheck] Not owner.', { userId: user.id, profileXUserId: profile.xUserId, username: user.username, profileXUsername: profile.xUsername });
  }

  const handleRefresh = async () => {
    if (!profile?.githubOrgUrl || !profile?.id) {
      toast({ title: 'Cannot refresh', description: 'No GitHub URL configured', variant: 'destructive' });
      return;
    }
    
    setIsRefreshing(true);
    try {
      // Wrap each dimension call with a 60-second timeout
      const withTimeout = <T,>(promise: Promise<T>, label: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after 60s`)), 60000))
        ]);
      };

      const [githubResult, depsResult, govResult, tvlResult] = await Promise.allSettled([
        withTimeout(supabase.functions.invoke('analyze-github-repo', {
          body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
        }), 'GitHub'),
        withTimeout(supabase.functions.invoke('analyze-dependencies', {
          body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
        }), 'Dependencies'),
        profile.governanceMetrics?.governance_address
          ? withTimeout(supabase.functions.invoke('analyze-governance', {
              body: { governance_address: profile.governanceMetrics.governance_address, profile_id: profile.id },
            }), 'Governance')
          : Promise.resolve({ data: null }),
        profile.category === 'defi'
          ? withTimeout(supabase.functions.invoke('analyze-tvl', {
              body: { 
                protocol_name: profile.projectName, 
                profile_id: profile.id, 
                monthly_commits: profile.githubAnalytics?.github_commits_30d || 30 
              },
            }), 'TVL')
          : Promise.resolve({ data: null }),
      ]);

      const dimensionNames = ['GitHub', 'Dependencies', 'Governance', 'TVL'];
      const results = [githubResult, depsResult, govResult, tvlResult];
      
      // Check for silent failures: HTTP 200 but success: false in response body
      const failed: string[] = [];
      let succeeded = 0;
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          failed.push(dimensionNames[i]);
        } else if (r.value?.data?.success === false) {
          console.warn(`${dimensionNames[i]} returned success:false:`, r.value.data.error);
          failed.push(dimensionNames[i]);
        } else {
          succeeded++;
        }
      });

      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.warn(`${dimensionNames[i]} failed:`, result.reason);
        }
      });
      
      await queryClient.invalidateQueries({ queryKey: ['claimed-profile', profile.id] });
      await queryClient.invalidateQueries({ queryKey: ['claimed-profiles'] });
      
      if (failed.length > 0) {
        toast({ 
          title: `Refresh partially complete (${succeeded}/4)`, 
          description: `${failed.join(', ')} timed out or failed. Other dimensions updated.` 
        });
      } else {
        toast({ 
          title: 'Full refresh complete', 
          description: 'All 4 dimensions analyzed and integrated score recalculated.' 
        });
      }
    } catch (err) {
      console.error('Refresh exception:', err);
      toast({ title: 'Refresh failed', description: 'Please try again later', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    const category = PROJECT_CATEGORIES.find(c => c.value === value);
    return category?.label || value;
  };

  if (isLoading || authLoading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <Skeleton className="mb-6 h-10 w-32" />
            <Skeleton className="mb-6 h-64 w-full" />
            <Skeleton className="mb-6 h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Profile not found</p>
          <p className="text-sm text-muted-foreground/70">
            This profile may not exist or hasn't been verified yet.
          </p>
          <Button asChild variant="outline">
            <Link to="/explorer">Return to Explorer</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Build program object for HeroBanner and other components
  const programForComponents = {
    id: profile.id,
    name: profile.projectName,
    programId: profile.programId || '',
    score: profile.score,
    livenessStatus: profile.livenessStatus as 'active' | 'dormant' | 'degraded',
    originalityStatus: (profile.programId && profile.programId !== profile.id)
      ? 'unverified' as const
      : 'not-deployed' as const,
    stakedAmount: 0,
    lastUpgrade: profile.verifiedAt || new Date().toISOString(),
    upgradeCount: 0,
    rank: 0,
  };

  const claimStatus = profile.claimStatus || 'claimed';
  const displayProgramId = profile.programId || '';

  // Detect fresh profiles with no analysis data yet
  const isFreshProfile = !profile.githubAnalytics?.github_analyzed_at
    && !profile.dependencyMetrics?.dependency_analyzed_at
    && !profile.governanceMetrics?.governance_analyzed_at
    && !profile.tvlMetrics?.tvl_analyzed_at;

  // Shared development tab props (used by both owner and visitor)
  const developmentTabProps = {
    projectId: profile.id,
    githubUrl: profile.githubOrgUrl,
    analytics: profile.githubAnalytics,
    program: programForComponents,
    githubIsFork: profile.githubAnalytics?.github_is_fork,
    githubOAuthVerified: !!profile.githubUsername,
    bytecodeMatchStatus: profile.bytecodeMatchStatus,
    bytecodeVerifiedAt: profile.bytecodeVerifiedAt,
    bytecodeConfidence: profile.bytecodeConfidence,
    bytecodeDeploySlot: profile.bytecodeDeploySlot,
    programId: displayProgramId || undefined,
    profileId: profile.id,
    dependencyHealthScore: profile.dependencyMetrics?.dependency_health_score,
    dependencyOutdatedCount: profile.dependencyMetrics?.dependency_outdated_count,
    dependencyCriticalCount: profile.dependencyMetrics?.dependency_critical_count,
    dependencyAnalyzedAt: profile.dependencyMetrics?.dependency_analyzed_at,
    governanceAddress: profile.governanceMetrics?.governance_address,
    governanceTx30d: profile.governanceMetrics?.governance_tx_30d,
    governanceLastActivity: profile.governanceMetrics?.governance_last_activity,
    governanceAnalyzedAt: profile.governanceMetrics?.governance_analyzed_at,
    tvlUsd: profile.tvlMetrics?.tvl_usd,
    tvlMarketShare: profile.tvlMetrics?.tvl_market_share,
    tvlRiskRatio: profile.tvlMetrics?.tvl_risk_ratio,
    tvlAnalyzedAt: profile.tvlMetrics?.tvl_analyzed_at,
    protocolName: profile.projectName,
    category: profile.category,
    vulnerabilityCount: profile.vulnerabilityCount,
    vulnerabilityDetails: profile.vulnerabilityDetails as any,
    vulnerabilityAnalyzedAt: profile.vulnerabilityAnalyzedAt,
    openssfScore: profile.openssfScore,
    openssfChecks: profile.openssfChecks,
    openssfAnalyzedAt: profile.openssfAnalyzedAt,
  };

  // ========== OWNER VIEW: Premium Dashboard with Management ==========
  if (isOwner) {
    return (
      <Layout>
        <div className="pb-20 lg:pb-0">
          <div className="py-6 lg:py-8">
            <div className="container mx-auto max-w-5xl px-4 lg:px-8">
              {/* Back Link */}
              <div className="mb-4">
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Fresh Profile Banner */}
              {(isFreshProfile || isRefreshing) && (
                <Alert className="mb-4 border-primary/20 bg-primary/5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    {isRefreshing ? 'Refreshing all dimensions...' : 'First analysis in progress — metrics will appear shortly.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* 1. HERO BANNER - Same as public but with owner badge */}
              <div className="mb-6">
                <HeroBanner
                  program={programForComponents}
                  websiteUrl={profile.websiteUrl}
                  xUsername={profile.xUsername}
                  discordUrl={profile.socials?.discordUrl}
                  telegramUrl={profile.socials?.telegramUrl}
                  githubUrl={profile.githubOrgUrl}
                  isVerified={profile.verified}
                  verifiedAt={profile.verifiedAt}
                  description={profile.description}
                  logoUrl={profile.logoUrl}
                  isOwner={true}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                  scoreBreakdown={profile.scoreBreakdown}
                />
              </div>

              {/* Funding Status Widget */}
              <FundingStatusWidget
                profileId={profile.id}
                fundingStatus={(profile as any).fundingStatus || (profile as any).funding_status}
                fundingRequestedSol={(profile as any).fundingRequestedSol || (profile as any).funding_requested_sol}
              />

              {/* 2. QUICK STATS BAR - Same as public */}
              <div className="mb-6">
                <QuickStats
                  analytics={profile.githubAnalytics}
                />
              </div>

              {/* 3. TABBED CONTENT - Owner-enhanced versions */}
              <ProgramTabs>
                {{
                  about: (
                    <div className="space-y-6">
                      <AboutTabContent
                        description={profile.description}
                        category={profile.category}
                        country={(profile as { country?: string }).country}
                        getCategoryLabel={getCategoryLabel}
                        websiteUrl={profile.websiteUrl}
                        mediaAssets={profile.mediaAssets}
                        isVerified={profile.verified}
                      />
                      <SettingsTab profile={profile} xUserId={user!.id} />
                      <MediaTab profile={profile} xUserId={user!.id} />
                    </div>
                  ),
                  development: (
                    <DevelopmentTabContent {...developmentTabProps} />
                  ),
                  team: (
                    <div className="space-y-6">
                      <TeamTabContent
                        teamMembers={profile.teamMembers}
                        stakingPitch={profile.stakingPitch}
                        isVerified={profile.verified}
                        claimStatus={claimStatus}
                        ownerUsername={profile.xUsername}
                        ownerLogoUrl={profile.logoUrl}
                        ownerProjectName={profile.projectName}
                        ownerAvatarUrl={profile.xAvatarUrl}
                        ownerDisplayName={profile.xDisplayName}
                      />
                      <TeamManagement profile={profile} xUserId={user!.id} />
                    </div>
                  ),
                  community: (
                    <div className="space-y-6">
                      {/* Build In Public Editor for Owner */}
                      <BuildInPublicTab profile={profile} xUserId={user!.id} />
                      
                      {/* Also show community links */}
                      <CommunityTabContent
                        buildInPublicVideos={profile.buildInPublicVideos}
                        xUsername={profile.xUsername}
                        twitterFollowers={profile.twitterMetrics?.followers}
                        twitterEngagementRate={profile.twitterMetrics?.engagementRate}
                        twitterRecentTweets={profile.twitterMetrics?.recentTweets}
                        twitterLastSynced={profile.twitterMetrics?.lastSynced}
                        discordUrl={profile.socials?.discordUrl}
                        telegramUrl={profile.socials?.telegramUrl}
                        githubUrl={profile.githubOrgUrl}
                        isVerified={profile.verified}
                        claimStatus={claimStatus}
                      />
                    </div>
                  ),
                  roadmap: (
                    <RoadmapManagement profile={profile} xUserId={user!.id} />
                  ),
                  support: (
                    <SupportTabContent
                      program={programForComponents}
                      isVerified={profile.verified}
                      claimStatus={claimStatus}
                    />
                  ),
                }}
              </ProgramTabs>
            </div>
          </div>
        </div>

        {/* Sticky CTA for mobile */}
        <StickyCTA programId={displayProgramId} projectName={profile.projectName} />
      </Layout>
    );
  }

  // ========== VISITOR VIEW: Public Profile (same as /program/:id) ==========
  return (
    <Layout>
      <div className="pb-20 lg:pb-0">
        <div className="py-6 lg:py-8">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            {/* Back Link */}
            <div className="mb-4">
              <Button variant="ghost" asChild className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <Link to="/explorer">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back to Registry
                </Link>
              </Button>
            </div>

              {/* Fresh Profile Banner */}
              {isFreshProfile && (
                <Alert className="mb-4 border-primary/20 bg-primary/5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    First analysis in progress — metrics will appear shortly.
                  </AlertDescription>
                </Alert>
              )}

              {/* 1. HERO BANNER */}
            <div className="mb-6">
              <HeroBanner
                program={programForComponents}
                websiteUrl={profile.websiteUrl}
                xUsername={profile.xUsername}
                discordUrl={profile.socials?.discordUrl}
                telegramUrl={profile.socials?.telegramUrl}
                githubUrl={profile.githubOrgUrl}
                isVerified={profile.verified}
                verifiedAt={profile.verifiedAt}
                description={profile.description}
                logoUrl={profile.logoUrl}
                scoreBreakdown={profile.scoreBreakdown}
              />
            </div>

            {/* 2. QUICK STATS BAR */}
            <div className="mb-6">
              <QuickStats
                analytics={profile.githubAnalytics}
              />
            </div>

            {/* 3. TABBED CONTENT - Read-only for visitors */}
            <ProgramTabs>
              {{
                about: (
                  <AboutTabContent
                    description={profile.description}
                    category={profile.category}
                    country={(profile as { country?: string }).country}
                    getCategoryLabel={getCategoryLabel}
                    websiteUrl={profile.websiteUrl}
                    mediaAssets={profile.mediaAssets}
                    isVerified={profile.verified}
                  />
                ),
                development: (
                  <DevelopmentTabContent {...developmentTabProps} />
                ),
                team: (
                  <TeamTabContent
                    teamMembers={profile.teamMembers}
                    stakingPitch={profile.stakingPitch}
                    isVerified={profile.verified}
                    claimStatus={claimStatus}
                    ownerUsername={profile.xUsername}
                    ownerLogoUrl={profile.logoUrl}
                    ownerProjectName={profile.projectName}
                    ownerAvatarUrl={profile.xAvatarUrl}
                    ownerDisplayName={profile.xDisplayName}
                  />
                ),
                community: (
                  <CommunityTabContent
                    buildInPublicVideos={profile.buildInPublicVideos}
                    xUsername={profile.xUsername}
                    twitterFollowers={profile.twitterMetrics?.followers}
                    twitterEngagementRate={profile.twitterMetrics?.engagementRate}
                    twitterRecentTweets={profile.twitterMetrics?.recentTweets}
                    twitterLastSynced={profile.twitterMetrics?.lastSynced}
                    discordUrl={profile.socials?.discordUrl}
                    telegramUrl={profile.socials?.telegramUrl}
                    githubUrl={profile.githubOrgUrl}
                    isVerified={profile.verified}
                    claimStatus={claimStatus}
                  />
                ),
                roadmap: (
                  <RoadmapTabContent
                    milestones={profile.milestones}
                    isVerified={profile.verified}
                    claimStatus={claimStatus}
                  />
                ),
                support: (
                  <SupportTabContent
                    program={programForComponents}
                    isVerified={profile.verified}
                    claimStatus={claimStatus}
                  />
                ),
              }}
            </ProgramTabs>
          </div>
        </div>
      </div>

      {/* Sticky CTA for mobile */}
      <StickyCTA programId={displayProgramId} projectName={profile.projectName} />
    </Layout>
  );
};

export default ProfileDetail;
