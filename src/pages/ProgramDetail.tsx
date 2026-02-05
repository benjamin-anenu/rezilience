import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, Github, MessageCircle, Send, Calendar, Lock, AlertTriangle, Youtube, Image as ImageIcon, Video } from 'lucide-react';
import { Layout } from '@/components/layout';
import { ProgramHeader, UpgradeChart, RecentEvents, MetricCards } from '@/components/program';
import { WebsitePreview } from '@/components/claim';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getProgramById, mockVerifiedProfiles } from '@/data/mockData';
import { useEffect, useState } from 'react';
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
  const program = getProgramById(id || '1');
  const [isVerified, setIsVerified] = useState(false);
  const [claimedProfile, setClaimedProfile] = useState<ClaimedProfile | null>(null);

  useEffect(() => {
    if (program) {
      const verifiedPrograms = JSON.parse(localStorage.getItem('verifiedPrograms') || '{}');
      
      // Direct lookup by programId
      let profile = verifiedPrograms[program.programId];
      
      // Fallback: search all profiles for matching programId
      if (!profile) {
        Object.values(verifiedPrograms).forEach((p: unknown) => {
          const prof = p as ClaimedProfile;
          if (prof.programId === program.programId) {
            profile = prof;
          }
        });
      }
      
      // Fallback: check mock verified profiles
      if (!profile && mockVerifiedProfiles[program.programId]) {
        profile = mockVerifiedProfiles[program.programId];
      }
      
      if (profile) {
        setIsVerified(true);
        setClaimedProfile(profile);
      }
    }

    // Check if just verified via URL param
    if (searchParams.get('verified') === 'true') {
      setIsVerified(true);
    }
  }, [program, searchParams]);

  if (!program) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center lg:px-8">
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground">
            PROGRAM NOT FOUND
          </h1>
          <p className="mb-8 text-muted-foreground">
            The program you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/explorer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explorer
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const getCategoryLabel = (value: string) => {
    const category = PROJECT_CATEGORIES.find(c => c.value === value);
    return category?.label || value;
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

          {/* Verification Badge Banner - Only show when verified */}
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
            <ProgramHeader program={program} />
          </div>

          {/* Description - only show when verified and has description */}
          {isVerified && claimedProfile?.description && (
            <div className="mb-6">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{claimedProfile.description}</p>
                  {claimedProfile.category && (
                    <Badge variant="outline" className="mt-2">
                      {getCategoryLabel(claimedProfile.category)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upgrade Chart + Recent Events - Operational Health */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <UpgradeChart />
            </div>
            <div>
              <RecentEvents />
            </div>
          </div>

          {/* Metric Cards - Key Stats */}
          <div className="mb-6">
            <MetricCards program={program} />
          </div>

          {/* Verified Timeline - only show when verified and has milestones */}
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

          {/* Media Gallery - only show when verified and has media */}
          {isVerified && claimedProfile?.mediaAssets && claimedProfile.mediaAssets.length > 0 && (
            <div className="mb-6">
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
            </div>
          )}

          {/* Website Snippet & Social Pulse - only show when verified */}
          {isVerified && claimedProfile && (
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              {/* Website Snippet */}
              {claimedProfile.websiteUrl && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                      Website
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebsitePreview url={claimedProfile.websiteUrl} />
                  </CardContent>
                </Card>
              )}

              {/* Social Pulse */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                    Social Pulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {claimedProfile.xUsername && (
                    <a
                      href={`https://x.com/${claimedProfile.xUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="text-lg font-bold">𝕏</span>
                      <span className="text-sm">@{claimedProfile.xUsername}</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {claimedProfile.socials?.discordUrl && (
                    <a
                      href={claimedProfile.socials.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <MessageCircle className="h-5 w-5 text-[#5865F2]" />
                      <span className="text-sm">Discord</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {claimedProfile.socials?.telegramUrl && (
                    <a
                      href={claimedProfile.socials.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <Send className="h-5 w-5 text-[#0088cc]" />
                      <span className="text-sm">Telegram</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {claimedProfile.githubOrgUrl && (
                    <a
                      href={claimedProfile.githubOrgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/10 px-4 py-3 transition-colors hover:bg-primary/20"
                    >
                      <Github className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-primary">GitHub Connected</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-primary" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stake CTA */}
          <div className="mt-8 rounded-sm border border-primary/30 bg-primary/5 p-6 text-center">
            <h3 className="mb-2 font-display text-xl font-bold uppercase text-foreground">
              SUPPORT THIS PROGRAM
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Stake SOL to increase the resilience score and earn rewards.
            </p>
            <Button asChild className="font-display font-semibold uppercase tracking-wider">
              <Link to={`/staking?program=${program.programId}`}>
                STAKE ON {program.name.toUpperCase()}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramDetail;
