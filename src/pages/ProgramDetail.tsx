import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, Calendar, Lock, AlertTriangle, Zap } from 'lucide-react';
import { Layout } from '@/components/layout';
import { HeroBanner, QuickStats, RecentEvents, MetricCards, DescriptionSection, SocialPulseSection, PublicGitHubMetrics, AnalyticsCharts, StickyCTA, BuildInPublicSection, TwitterPulseSection } from '@/components/program';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject, useProjectById } from '@/hooks/useProjects';
import { useClaimedProfileByProgramId, useClaimedProfileByProjectId, useClaimedProfile } from '@/hooks/useClaimedProfiles';
import type { ClaimedProfile } from '@/types';
import { PROJECT_CATEGORIES } from '@/types';

const getEmbedUrl = (url: string, type: string) => {
  if (type === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

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

            {/* 3. Description Section */}
            {displayDescription && (
              <DescriptionSection 
                description={displayDescription} 
                category={claimedProfile?.category}
                getCategoryLabel={getCategoryLabel}
              />
            )}

            {/* 4. BUILD IN PUBLIC - Twitter video showcase */}
            {isVerified && claimedProfile?.buildInPublicVideos && claimedProfile.buildInPublicVideos.length > 0 && (
              <div className="mb-6">
                <BuildInPublicSection
                  videos={claimedProfile.buildInPublicVideos}
                  xUsername={claimedProfile.xUsername}
                />
              </div>
            )}

            {/* 5. Public GitHub Metrics - Development Health */}
            <div className="mb-6">
              <PublicGitHubMetrics 
                analytics={claimedProfile?.githubAnalytics}
                githubUrl={displayGithubUrl}
              />
            </div>

            {/* 6. Analytics Charts + Recent Events */}
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AnalyticsCharts 
                  projectId={project?.id || claimedProfile?.id || ''}
                  topContributors={claimedProfile?.githubAnalytics?.github_top_contributors}
                  recentEvents={claimedProfile?.githubAnalytics?.github_recent_events}
                />
              </div>
              <div>
                <RecentEvents 
                  projectId={project?.id || claimedProfile?.id || ''} 
                  githubEvents={claimedProfile?.githubAnalytics?.github_recent_events}
                />
              </div>
            </div>

            {/* 7. TWITTER PULSE - Social engagement metrics */}
            {isVerified && claimedProfile?.xUsername && (
              <div className="mb-6">
                <TwitterPulseSection
                  xUsername={claimedProfile.xUsername}
                  followers={claimedProfile.twitterMetrics?.followers}
                  engagementRate={claimedProfile.twitterMetrics?.engagementRate}
                  recentTweets={claimedProfile.twitterMetrics?.recentTweets}
                  lastSynced={claimedProfile.twitterMetrics?.lastSynced}
                />
              </div>
            )}

            {/* 8. Verified Timeline - Roadmap */}
            {isVerified && claimedProfile?.milestones && claimedProfile.milestones.length > 0 && (
              <div className="mb-6">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                      Verified Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {claimedProfile.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`rounded-sm border p-4 transition-all hover:scale-[1.02] ${
                            milestone.status === 'completed'
                              ? 'border-primary/30 bg-primary/10'
                              : milestone.status === 'overdue'
                              ? 'border-destructive/30 bg-destructive/10'
                              : 'border-border bg-muted/30'
                          }`}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            ) : milestone.status === 'overdue' ? (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-display text-sm font-semibold uppercase">
                              {milestone.title}
                            </span>
                            {milestone.isLocked && (
                              <Lock className="ml-auto h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
                            {milestone.varianceRequested && (
                              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">
                                Update Requested
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 7. Website Preview - Full width, preserved exactly */}
            {isVerified && displayWebsiteUrl && (
              <div className="mb-6">
                <Card className="border-border bg-card overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                      Website Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[16/10] overflow-hidden rounded-sm border border-border">
                      <iframe
                        src={displayWebsiteUrl}
                        className="h-full w-full"
                        title="Website preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <a
                          href={displayWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Launch Site
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 8. Media Gallery & Social Pulse */}
            {isVerified && claimedProfile && (
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {/* Media Gallery */}
                {claimedProfile.mediaAssets && claimedProfile.mediaAssets.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                        Media Gallery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {claimedProfile.mediaAssets
                            .sort((a, b) => a.order - b.order)
                            .map((asset) => (
                              <CarouselItem key={asset.id}>
                                <div className="aspect-video overflow-hidden rounded-sm border border-border bg-muted">
                                  {asset.type === 'image' ? (
                                    <img
                                      src={asset.url}
                                      alt="Project media"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : asset.type === 'youtube' ? (
                                    <iframe
                                      src={getEmbedUrl(asset.url, 'youtube')}
                                      className="h-full w-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title="YouTube video"
                                    />
                                  ) : (
                                    <video
                                      src={asset.url}
                                      controls
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                              </CarouselItem>
                            ))}
                        </CarouselContent>
                        {claimedProfile.mediaAssets.length > 1 && (
                          <>
                            <CarouselPrevious className="-left-4" />
                            <CarouselNext className="-right-4" />
                          </>
                        )}
                      </Carousel>
                    </CardContent>
                  </Card>
                )}

                {/* Social Pulse */}
                <SocialPulseSection 
                  programId={displayProgramId}
                  websiteUrl={displayWebsiteUrl}
                  xUsername={claimedProfile.xUsername}
                  discordUrl={claimedProfile.socials?.discordUrl}
                  telegramUrl={claimedProfile.socials?.telegramUrl}
                  githubUrl={displayGithubUrl}
                  isVerified={isVerified}
                />
              </div>
            )}

            {/* 9. Metric Cards - Trust signals */}
            <div className="mb-6">
              <MetricCards 
                program={programForComponents} 
                githubIsFork={claimedProfile?.githubAnalytics?.github_is_fork}
              />
            </div>

            {/* 10. Stake CTA - Desktop version */}
            <div className="hidden rounded-sm border border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8 text-center lg:block">
              <div className="mx-auto max-w-2xl">
                <h3 className="mb-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  SUPPORT THIS PROJECT
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Stake SOL to increase the resilience score and earn rewards. 
                  Your stake signals confidence in this project's long-term success.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="gap-2 px-8 font-display text-lg font-semibold uppercase tracking-wider shadow-lg glow-signal"
                >
                  <Link to={`/staking?program=${displayProgramId}`}>
                    <Zap className="h-5 w-5" />
                    STAKE NOW
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA for mobile */}
      <StickyCTA programId={displayProgramId} projectName={displayName} />
    </Layout>
  );
};

export default ProgramDetail;
