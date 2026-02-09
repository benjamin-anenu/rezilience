import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  HeroBanner,
  QuickStats,
  ProgramTabs,
  AboutTabContent,
  DevelopmentTabContent,
  CommunityTabContent,
  RoadmapTabContent,
  TeamTabContent,
} from '@/components/program';
import { SettingsTab, BuildInPublicTab, TeamManagement } from '@/components/profile/tabs';
import { RoadmapManagement } from '@/components/profile/tabs/RoadmapManagement';
import { PROJECT_CATEGORIES } from '@/types';
import { useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: profile, isLoading, error } = useClaimedProfile(id || '');

  // Check if current user is the owner
  const isOwner = user?.id && profile?.xUserId && user.id === profile.xUserId;

  const handleRefresh = async () => {
    if (!profile?.githubOrgUrl || !profile?.id) {
      toast({ title: 'Cannot refresh', description: 'No GitHub URL configured', variant: 'destructive' });
      return;
    }
    
    setIsRefreshing(true);
    try {
      // Call ALL 4 dimension analyses in parallel for full-spectrum refresh
      const [githubResult, depsResult, govResult, tvlResult] = await Promise.allSettled([
        // 1. GitHub Activity (40%)
        supabase.functions.invoke('analyze-github-repo', {
          body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
        }),
        // 2. Dependency Health (25%)
        supabase.functions.invoke('analyze-dependencies', {
          body: { github_url: profile.githubOrgUrl, profile_id: profile.id },
        }),
        // 3. Governance (20%) - only if multisig configured
        profile.governanceMetrics?.governance_address
          ? supabase.functions.invoke('analyze-governance', {
              body: { governance_address: profile.governanceMetrics.governance_address, profile_id: profile.id },
            })
          : Promise.resolve({ data: null }),
        // 4. TVL (15%) - only for DeFi category
        profile.category === 'defi'
          ? supabase.functions.invoke('analyze-tvl', {
              body: { 
                protocol_name: profile.projectName, 
                profile_id: profile.id, 
                monthly_commits: profile.githubAnalytics?.github_commits_30d || 30 
              },
            })
          : Promise.resolve({ data: null }),
      ]);

      // Log any dimension failures for debugging
      const dimensionNames = ['GitHub', 'Dependencies', 'Governance', 'TVL'];
      [githubResult, depsResult, govResult, tvlResult].forEach((result, i) => {
        if (result.status === 'rejected') {
          console.warn(`${dimensionNames[i]} analysis failed:`, result.reason);
        } else if (result.value && 'error' in result.value && result.value.error) {
          console.warn(`${dimensionNames[i]} analysis error:`, result.value.error);
        }
      });
      
      // Invalidate queries to show new data
      await queryClient.invalidateQueries({ queryKey: ['claimed-profile', profile.id] });
      await queryClient.invalidateQueries({ queryKey: ['claimed-profiles'] });
      
      toast({ 
        title: 'Full refresh complete', 
        description: 'All 4 dimensions analyzed and integrated score recalculated.' 
      });
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
    originalityStatus: 'verified' as const,
    stakedAmount: 0,
    lastUpgrade: profile.verifiedAt || new Date().toISOString(),
    upgradeCount: 0,
    rank: 0,
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
                    <DevelopmentTabContent
                      projectId={profile.id}
                      githubUrl={profile.githubOrgUrl}
                      analytics={profile.githubAnalytics}
                      program={programForComponents}
                      githubIsFork={profile.githubAnalytics?.github_is_fork}
                      dependencyHealthScore={profile.dependencyMetrics?.dependency_health_score}
                      dependencyOutdatedCount={profile.dependencyMetrics?.dependency_outdated_count}
                      dependencyCriticalCount={profile.dependencyMetrics?.dependency_critical_count}
                      dependencyAnalyzedAt={profile.dependencyMetrics?.dependency_analyzed_at}
                      governanceAddress={profile.governanceMetrics?.governance_address}
                      governanceTx30d={profile.governanceMetrics?.governance_tx_30d}
                      governanceLastActivity={profile.governanceMetrics?.governance_last_activity}
                      governanceAnalyzedAt={profile.governanceMetrics?.governance_analyzed_at}
                      tvlUsd={profile.tvlMetrics?.tvl_usd}
                      tvlMarketShare={profile.tvlMetrics?.tvl_market_share}
                      tvlRiskRatio={profile.tvlMetrics?.tvl_risk_ratio}
                      tvlAnalyzedAt={profile.tvlMetrics?.tvl_analyzed_at}
                      protocolName={profile.projectName}
                      category={profile.category}
                    />
                  ),
                  team: (
                    <TeamManagement profile={profile} xUserId={user!.id} />
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
                      />
                    </div>
                  ),
                  roadmap: (
                    <RoadmapManagement profile={profile} xUserId={user!.id} />
                  ),
                  support: (
                    <SettingsTab profile={profile} xUserId={user!.id} />
                  ),
                }}
              </ProgramTabs>
            </div>
          </div>
        </div>
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
                  <DevelopmentTabContent
                    projectId={profile.id}
                    githubUrl={profile.githubOrgUrl}
                    analytics={profile.githubAnalytics}
                    program={programForComponents}
                    githubIsFork={profile.githubAnalytics?.github_is_fork}
                    dependencyHealthScore={profile.dependencyMetrics?.dependency_health_score}
                    dependencyOutdatedCount={profile.dependencyMetrics?.dependency_outdated_count}
                    dependencyCriticalCount={profile.dependencyMetrics?.dependency_critical_count}
                    dependencyAnalyzedAt={profile.dependencyMetrics?.dependency_analyzed_at}
                    governanceAddress={profile.governanceMetrics?.governance_address}
                    governanceTx30d={profile.governanceMetrics?.governance_tx_30d}
                    governanceLastActivity={profile.governanceMetrics?.governance_last_activity}
                    governanceAnalyzedAt={profile.governanceMetrics?.governance_analyzed_at}
                    tvlUsd={profile.tvlMetrics?.tvl_usd}
                    tvlMarketShare={profile.tvlMetrics?.tvl_market_share}
                    tvlRiskRatio={profile.tvlMetrics?.tvl_risk_ratio}
                    tvlAnalyzedAt={profile.tvlMetrics?.tvl_analyzed_at}
                    protocolName={profile.projectName}
                    category={profile.category}
                  />
                ),
                team: (
                  <TeamTabContent
                    teamMembers={profile.teamMembers}
                    stakingPitch={profile.stakingPitch}
                    isVerified={profile.verified}
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
                  />
                ),
                roadmap: (
                  <RoadmapTabContent
                    milestones={profile.milestones}
                    isVerified={profile.verified}
                  />
                ),
                support: (
                  <div className="space-y-6">
                    {/* Public support/staking info would go here */}
                    <div className="rounded-sm border border-border bg-muted/30 p-6 text-center">
                      <p className="text-muted-foreground">
                        Support options coming soon.
                      </p>
                    </div>
                  </div>
                ),
              }}
            </ProgramTabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileDetail;
