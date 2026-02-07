import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClaimedProfile } from '@/hooks/useClaimedProfiles';
import { useAuth } from '@/context/AuthContext';
import { ProfileHeroBanner } from '@/components/profile/ProfileHeroBanner';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { AboutTab, SettingsTab, MediaTab, BuildInPublicTab, DevelopmentTab } from '@/components/profile/tabs';
import { useEffect, useState } from 'react';

const MyProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: profile, isLoading, error, refetch } = useClaimedProfile(id || '');

  // Check if current user is the owner
  const isOwner = user?.id && profile?.xUserId && user.id === profile.xUserId;

  // Redirect if not authenticated or not owner
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/claim-profile');
      return;
    }
    
    // If profile loaded and user is not owner, redirect to public view
    if (profile && user && profile.xUserId !== user.id) {
      navigate(`/profile/${id}`);
    }
  }, [authLoading, isAuthenticated, profile, user, id, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading || authLoading) {
    return (
      <Layout>
        <div className="py-12">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <Skeleton className="mb-6 h-10 w-24" />
            <Skeleton className="mb-6 h-64 w-full" />
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
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!isOwner) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 lg:px-8">
          {/* Back Link */}
          <Button
            variant="ghost"
            className="mb-6 font-display text-xs uppercase tracking-wider"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Hero Banner */}
          <div className="mb-8">
            <ProfileHeroBanner
              profile={profile}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Tabbed Content */}
          <ProfileTabs>
            {{
              about: <AboutTab profile={profile} />,
              settings: <SettingsTab profile={profile} xUserId={user!.id} />,
              media: <MediaTab profile={profile} xUserId={user!.id} />,
              buildInPublic: <BuildInPublicTab profile={profile} xUserId={user!.id} />,
              development: <DevelopmentTab profile={profile} />,
            }}
          </ProfileTabs>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfileDetail;
