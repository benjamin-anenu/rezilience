import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Github,
  MessageCircle,
  Send,
  Calendar,
  Lock,
  AlertTriangle,
  Youtube,
  Image,
  Video,
  Loader2,
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PROJECT_CATEGORIES } from '@/types';
import { useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAuth } from '@/context/AuthContext';
import { GitHubAnalyticsCard } from '@/components/dashboard/GitHubAnalyticsCard';

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const { data: profile, isLoading, error, refetch } = useClaimedProfile(id || '');
  const justVerified = searchParams.get('verified') === 'true';

  // Check if current user is the owner
  const isOwner = user?.id && profile?.xUserId && user.id === profile.xUserId;

  if (isLoading) {
    return (
      <Layout>
        <div className="py-12">
          <div className="container mx-auto max-w-4xl px-4 lg:px-8">
            <Skeleton className="mb-6 h-10 w-24" />
            <Skeleton className="mb-6 h-32 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
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

  const categoryLabel = PROJECT_CATEGORIES.find(c => c.value === profile.category)?.label || profile.category;

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      default:
        return <Image className="h-6 w-6" />;
    }
  };

  const getEmbedUrl = (url: string, type: string) => {
    if (type === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return url;
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto max-w-4xl px-4 lg:px-8">
          {/* Back Link */}
          <Button
            variant="ghost"
            className="mb-6 font-display text-xs uppercase tracking-wider"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Just Verified Banner */}
          {justVerified && (
            <Card className="mb-6 border-primary bg-primary/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span className="font-display text-lg uppercase tracking-tight text-primary">
                    VERIFIED TITAN
                  </span>
                </div>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Your profile is now verified and visible to the community
                </p>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <Card className="mb-6 border-border bg-card">
            <CardContent className="py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt={profile.projectName}
                      className="h-16 w-16 rounded-sm border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-muted">
                      <span className="font-display text-2xl text-muted-foreground">
                        {profile.projectName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
                        {profile.projectName}
                      </h1>
                      {profile.verified && (
                        <Badge className="bg-primary/20 text-primary">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          VERIFIED
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{categoryLabel}</Badge>
                      <span>•</span>
                      <span>@{profile.xUsername}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-center sm:text-right">
                  <div className="font-mono text-4xl font-bold text-primary">
                    {profile.score}/100
                  </div>
                  <div className="text-xs text-muted-foreground">Resilience Score</div>
                  <Badge
                    className={`mt-1 ${
                      profile.livenessStatus === 'active'
                        ? 'bg-primary/20 text-primary'
                        : profile.livenessStatus === 'degraded'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {profile.livenessStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {profile.description && (
                <div 
                  className="mt-4 prose prose-sm prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: profile.description }}
                />
              )}
            </CardContent>
          </Card>

          {/* Media Gallery */}
          {profile.mediaAssets.length > 0 && (
            <Card className="mb-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-tight">
                  Media Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel className="mx-auto max-w-2xl">
                  <CarouselContent>
                    {profile.mediaAssets.map((asset) => (
                      <CarouselItem key={asset.id}>
                        <div className="aspect-video overflow-hidden rounded-sm bg-muted">
                          {asset.type === 'youtube' ? (
                            <iframe
                              src={getEmbedUrl(asset.url, asset.type)}
                              className="h-full w-full"
                              allowFullScreen
                              title={asset.title || 'Video'}
                            />
                          ) : asset.type === 'video' ? (
                            <video
                              src={asset.url}
                              controls
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src={asset.url}
                              alt={asset.title || 'Media'}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        {asset.title && (
                          <p className="mt-2 text-center text-sm text-muted-foreground">
                            {asset.title}
                          </p>
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Website Snippet */}
            {profile.websiteUrl && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-lg uppercase tracking-tight">
                    Website
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-48 overflow-hidden rounded-sm border border-border bg-muted">
                    <iframe
                      src={profile.websiteUrl}
                      className="h-full w-full scale-50 origin-top-left"
                      style={{ width: '200%', height: '200%' }}
                      sandbox="allow-scripts allow-same-origin"
                      title="Website Preview"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="mt-3 w-full font-display text-xs uppercase tracking-wider"
                    onClick={() => window.open(profile.websiteUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Site
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Social Pulse */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-tight">
                  Social Pulse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://twitter.com/${profile.socials.xHandle}`, '_blank')}
                    className="font-mono text-xs"
                  >
                    <span className="mr-2">𝕏</span>
                    @{profile.socials.xHandle}
                  </Button>

                  {profile.githubOrgUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.githubOrgUrl, '_blank')}
                      className="font-mono text-xs"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  )}

                  {profile.socials.discordUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.socials.discordUrl, '_blank')}
                      className="font-mono text-xs"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Discord
                    </Button>
                  )}

                  {profile.socials.telegramUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.socials.telegramUrl, '_blank')}
                      className="font-mono text-xs"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Telegram
                    </Button>
                  )}
                </div>

                {profile.programId && (
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Program ID</p>
                    <p className="mt-1 font-mono text-xs">{profile.programId}</p>
                  </div>
                )}

                {profile.walletAddress && (
                  <div className="rounded-sm border border-border bg-muted/30 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Wallet</p>
                    <p className="mt-1 font-mono text-xs">{profile.walletAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verified Timeline */}
          {profile.milestones.length > 0 && (
            <Card className="mt-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-tight">
                  Verified Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.milestones.map((milestone) => {
                    const targetDate = new Date(milestone.targetDate);
                    const isOverdue = targetDate < new Date() && milestone.status !== 'completed';

                    return (
                      <div
                        key={milestone.id}
                        className={`flex items-center justify-between rounded-sm border p-3 ${
                          milestone.status === 'completed'
                            ? 'border-primary/30 bg-primary/5'
                            : isOverdue
                            ? 'border-destructive/30 bg-destructive/5'
                            : milestone.varianceRequested
                            ? 'border-yellow-500/30 bg-yellow-500/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : isOverdue ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          ) : milestone.isLocked ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="font-mono text-sm">{milestone.title}</span>
                          {milestone.varianceRequested && (
                            <Badge className="bg-yellow-500/20 text-yellow-500">
                              TIMELINE VARIANCE
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge className="bg-destructive/20 text-destructive">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {targetDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* GitHub Analytics - Owner Only */}
          {isOwner && profile.githubAnalytics && (
            <div className="mt-6">
              <GitHubAnalyticsCard
                profileId={profile.id}
                analytics={profile.githubAnalytics}
                onRefresh={() => refetch()}
              />
            </div>
          )}

          {/* Development Stats */}
          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-lg uppercase tracking-tight">
                Development Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
                  <div className="font-mono text-3xl font-bold text-primary">{profile.score}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Resilience Score</div>
                </div>
                <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
                  <div className="font-mono text-3xl font-bold text-foreground">
                    {profile.livenessStatus === 'active' ? '94%' : profile.livenessStatus === 'degraded' ? '72%' : '45%'}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Survival Rate</div>
                </div>
                <div className="rounded-sm border border-border bg-muted/30 p-4 text-center">
                  <div className="font-mono text-3xl font-bold text-foreground">
                    {new Date(profile.verifiedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Verified Date</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileDetail;
