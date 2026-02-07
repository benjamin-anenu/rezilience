import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
} from '@/components/program';
import { SettingsTab, BuildInPublicTab } from '@/components/profile/tabs';
import { RoadmapManagement } from '@/components/profile/tabs/RoadmapManagement';
import { PROJECT_CATEGORIES } from '@/types';
import { useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAuth } from '@/context/AuthContext';

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: profile, isLoading, error, refetch } = useClaimedProfile(id || '');

  // Check if current user is the owner
  const isOwner = user?.id && profile?.xUserId && user.id === profile.xUserId;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
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
                    />
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
