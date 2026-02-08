import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/hooks/useProjects';
import { useClaimedProfileByProgramId, useClaimedProfileByProjectId, useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAutoRefreshProfile } from '@/hooks/useAutoRefreshProfile';
import { PROJECT_CATEGORIES } from '@/types';

const ProgramDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  // Try to fetch project from projects table by program_id first
  const { data: projectByProgramId, isLoading: loadingByProgramId } = useProject(id || '');
  
  // Also try to fetch claimed profile directly by UUID (for registry entries)
  const { data: claimedProfileById, isLoading: loadingClaimedById } = useClaimedProfile(id || '');
  
  // Fetch claimed profile by program_id if we have one
  const { data: claimedProfileByProgram } = useClaimedProfileByProgramId(id || '');
  const { data: claimedProfileByProject } = useClaimedProfileByProjectId(projectByProgramId?.id || '');
  
  // Determine the best data source: project table OR claimed profile as fallback
  const project = projectByProgramId;
  const claimedProfile = claimedProfileByProgram || claimedProfileByProject || claimedProfileById;
  
  // Use claimed profile data if no project found (for registry-only entries)
  const hasData = project || claimedProfile;
  const isLoading = loadingByProgramId && loadingClaimedById;
  const isVerified = project?.verified || claimedProfile?.verified || searchParams.get('verified') === 'true';

  // Auto-refresh analytics when data is stale (> 30 minutes old)
  const { isRefreshing } = useAutoRefreshProfile(
    claimedProfile?.id,
    claimedProfile?.githubOrgUrl,
    claimedProfile?.githubAnalytics?.github_analyzed_at
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="mb-6 h-64 w-full" />
            <Skeleton className="mb-6 h-16 w-full" />
            <Skeleton className="mb-6 h-12 w-full" />
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-64 lg:col-span-2" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center lg:px-8">
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground">
            PROTOCOL NOT FOUND
          </h1>
          <p className="mb-8 text-muted-foreground">
            The protocol you're looking for doesn't exist in the registry.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/explorer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Registry
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/claim-profile">
                Register Protocol
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Build display data from either project or claimed profile
  const displayName = project?.program_name || claimedProfile?.projectName || 'Unknown Protocol';
  const displayProgramId = project?.program_id || claimedProfile?.programId || id || '';
  const displayScore = project?.resilience_score || claimedProfile?.score || 0;
  const displayDescription = claimedProfile?.description || project?.description;
  const displayWebsiteUrl = claimedProfile?.websiteUrl || project?.website_url;
  const displayGithubUrl = claimedProfile?.githubOrgUrl || project?.github_url;
  const displayLogoUrl = claimedProfile?.logoUrl || project?.logo_url;

  const getCategoryLabel = (value: string) => {
    const category = PROJECT_CATEGORIES.find(c => c.value === value);
    return category?.label || value;
  };

  // Determine if this is an on-chain Solana program
  const isValidSolanaProgramId = (programId: string) => {
    return programId && programId.length >= 32 && !programId.includes('-');
  };

  const hasOnChainProgram = isValidSolanaProgramId(displayProgramId);

  // Determine bytecode originality status based on on-chain presence
  const getBytecodeStatus = (): 'verified' | 'unverified' | 'fork' | 'not-deployed' => {
    if (!hasOnChainProgram) return 'not-deployed';
    if (project?.is_fork) return 'fork';
    if (isVerified) return 'verified';
    return 'unverified';
  };

  // Transform data to the format expected by existing components
  const programForComponents = {
    id: project?.id || claimedProfile?.id || '',
    name: displayName,
    programId: displayProgramId,
    score: Math.round(displayScore),
    livenessStatus: (project?.liveness_status?.toLowerCase() || claimedProfile?.livenessStatus || 'active') as 'active' | 'dormant' | 'degraded',
    originalityStatus: getBytecodeStatus(),
    stakedAmount: project?.total_staked || 0,
    lastUpgrade: project?.github_last_commit || project?.updated_at || new Date().toISOString(),
    upgradeCount: 0,
    rank: 0,
  };

  return (
    <Layout>
      {/* Add padding at bottom for sticky CTA on mobile */}
      <div className="pb-20 lg:pb-0">
        <div className="py-6 lg:py-8">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Back link */}
            <div className="mb-4">
              <Button variant="ghost" asChild className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <Link to="/explorer">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back to Registry
                </Link>
              </Button>
            </div>

            {/* 1. HERO BANNER - Premium immersive header */}
            <div className="mb-6">
              <HeroBanner
                program={programForComponents}
                websiteUrl={displayWebsiteUrl}
                xUsername={claimedProfile?.xUsername}
                discordUrl={claimedProfile?.socials?.discordUrl}
                telegramUrl={claimedProfile?.socials?.telegramUrl}
                githubUrl={displayGithubUrl}
                isVerified={isVerified}
                verifiedAt={claimedProfile?.verifiedAt}
                description={displayDescription}
                logoUrl={displayLogoUrl}
              />
            </div>

            {/* 2. QUICK STATS BAR - Key metrics at a glance */}
            <div className="mb-6">
              <QuickStats
                analytics={claimedProfile?.githubAnalytics}
                totalStaked={project?.total_staked}
              />
            </div>

            {/* 3. TABBED CONTENT - Premium organized sections */}
            <ProgramTabs
              children={{
                about: (
                  <AboutTabContent
                    description={displayDescription}
                    category={claimedProfile?.category}
                    country={(claimedProfile as { country?: string })?.country}
                    getCategoryLabel={getCategoryLabel}
                    websiteUrl={displayWebsiteUrl}
                    mediaAssets={claimedProfile?.mediaAssets}
                    isVerified={isVerified}
                  />
                ),
                development: (
                  <DevelopmentTabContent
                    projectId={project?.id || claimedProfile?.id || ''}
                    githubUrl={displayGithubUrl}
                    analytics={claimedProfile?.githubAnalytics}
                    program={programForComponents}
                    githubIsFork={claimedProfile?.githubAnalytics?.github_is_fork}
                    bytecodeMatchStatus={claimedProfile?.bytecodeMatchStatus}
                    bytecodeVerifiedAt={claimedProfile?.bytecodeVerifiedAt}
                    programId={displayProgramId}
                    profileId={claimedProfile?.id}
                  />
                ),
                team: (
                  <TeamTabContent
                    teamMembers={claimedProfile?.teamMembers}
                    stakingPitch={claimedProfile?.stakingPitch}
                    isVerified={isVerified}
                  />
                ),
                community: (
                  <CommunityTabContent
                    buildInPublicVideos={claimedProfile?.buildInPublicVideos}
                    xUsername={claimedProfile?.xUsername}
                    twitterFollowers={claimedProfile?.twitterMetrics?.followers}
                    twitterEngagementRate={claimedProfile?.twitterMetrics?.engagementRate}
                    twitterRecentTweets={claimedProfile?.twitterMetrics?.recentTweets}
                    twitterLastSynced={claimedProfile?.twitterMetrics?.lastSynced}
                    discordUrl={claimedProfile?.socials?.discordUrl}
                    telegramUrl={claimedProfile?.socials?.telegramUrl}
                    githubUrl={displayGithubUrl}
                    isVerified={isVerified}
                  />
                ),
                roadmap: (
                  <RoadmapTabContent
                    milestones={claimedProfile?.milestones}
                    isVerified={isVerified}
                  />
                ),
                support: (
                  <SupportTabContent
                    program={programForComponents}
                    isVerified={isVerified}
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA for mobile */}
      <StickyCTA programId={displayProgramId} projectName={displayName} />
    </Layout>
  );
};

export default ProgramDetail;
