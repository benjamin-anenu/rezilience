import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, Calendar, Lock, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { ProgramHeader, UpgradeChart, RecentEvents, MetricCards, DescriptionSection, SocialPulseSection } from '@/components/program';
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
            <Skeleton className="mb-8 h-32 w-full" />
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

  const getCategoryLabel = (value: string) => {
    const category = PROJECT_CATEGORIES.find(c => c.value === value);
    return category?.label || value;
  };

  // Transform data to the format expected by existing components
  const programForComponents = {
    id: project?.id || claimedProfile?.id || '',
    name: displayName,
    programId: displayProgramId,
    score: Math.round(displayScore),
    livenessStatus: (project?.liveness_status?.toLowerCase() || claimedProfile?.livenessStatus || 'active') as 'active' | 'dormant' | 'degraded',
    originalityStatus: project?.is_fork ? 'fork' as const : isVerified ? 'verified' as const : 'unverified' as const,
    stakedAmount: project?.total_staked || 0,
    lastUpgrade: project?.github_last_commit || project?.updated_at || new Date().toISOString(),
    upgradeCount: 0,
    rank: 0,
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back link */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/explorer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explorer
              </Link>
            </Button>
          </div>

          {/* Verification Badge Banner */}
          {isVerified && (
            <div className="mb-6 flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/10 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-display font-bold uppercase tracking-wider">
                  VERIFIED TITAN
                </Badge>
                <span className="ml-3 text-sm text-muted-foreground">
                  GitHub connected • Score validated
                </span>
              </div>
              {claimedProfile && (
                <span className="font-mono text-xs text-muted-foreground">
                  Verified {new Date(claimedProfile.verifiedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <ProgramHeader 
              program={programForComponents}
              websiteUrl={displayWebsiteUrl}
              xUsername={claimedProfile?.xUsername}
              discordUrl={claimedProfile?.socials?.discordUrl}
              telegramUrl={claimedProfile?.socials?.telegramUrl}
              githubUrl={displayGithubUrl}
            />
          </div>

          {/* Description */}
          {displayDescription && (
            <DescriptionSection 
              description={displayDescription} 
              category={claimedProfile?.category}
              getCategoryLabel={getCategoryLabel}
            />
          )}

          {/* Upgrade Chart + Recent Events - always show, empty states handled by components */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UpgradeChart projectId={project?.id || claimedProfile?.id || ''} />
            </div>
            <div>
              <RecentEvents projectId={project?.id || claimedProfile?.id || ''} />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="mb-6">
            <MetricCards program={programForComponents} />
          </div>

          {/* Verified Timeline */}
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
                        className={`rounded-sm border p-4 ${
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

          {/* Website Preview */}
          {isVerified && displayWebsiteUrl && (
            <div className="mb-6">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                    Website
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
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={displayWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
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

          {/* Media Gallery & Social Pulse */}
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

          {/* Stake CTA */}
          <div className="mt-8 rounded-sm border border-primary/30 bg-primary/5 p-6 text-center">
            <h3 className="mb-2 font-display text-xl font-bold uppercase text-foreground">
              SUPPORT THIS PROJECT
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Stake SOL to increase the resilience score and earn rewards.
            </p>
            <Button asChild className="w-full font-display font-semibold uppercase tracking-wider sm:w-auto">
              <Link to={`/staking?program=${displayProgramId}`}>
                STAKE NOW
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramDetail;
