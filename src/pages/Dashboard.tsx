import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Compass, LogOut, Loader2, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useVerifiedProfiles } from '@/hooks/useClaimedProfiles';
import { useDeleteProfile } from '@/hooks/useDeleteProfile';
import { DeleteProfileDialog } from '@/components/dashboard/DeleteProfileDialog';

interface ProfileToDelete {
  id: string;
  projectName: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const [profileToDelete, setProfileToDelete] = useState<ProfileToDelete | null>(null);
  
  // Fetch verified profiles from database
  const { data: verifiedProjects = [], isLoading: profilesLoading } = useVerifiedProfiles();
  const deleteProfile = useDeleteProfile();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/claim-profile');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loading = authLoading || profilesLoading;

  const handleDeleteConfirm = () => {
    if (profileToDelete && user?.id) {
      deleteProfile.mutate(
        { profileId: profileToDelete.id, xUserId: user.id },
        {
          onSuccess: () => {
            setProfileToDelete(null);
          },
        }
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto max-w-4xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                BUILDER DASHBOARD
              </h1>
              <p className="text-muted-foreground">
                Manage your registered protocols and monitor Resilience Scores
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex flex-wrap gap-4">
            <Button asChild className="font-display font-semibold uppercase tracking-wider">
              <Link to="/claim-profile">
                <Plus className="mr-2 h-4 w-4" />
                REGISTER PROTOCOL
              </Link>
            </Button>
            <Button variant="outline" asChild className="font-display font-semibold uppercase tracking-wider">
              <Link to="/explorer">
                <Compass className="mr-2 h-4 w-4" />
                EXPLORE REGISTRY
              </Link>
            </Button>
          </div>

          {/* Verified Projects */}
          {verifiedProjects.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="mb-2 font-display text-lg uppercase tracking-tight text-muted-foreground">
                  No Registered Protocols
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Register your first protocol to get started
                </p>
                <Button asChild className="font-display font-semibold uppercase tracking-wider">
                  <Link to="/claim-profile">REGISTER NOW</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {verifiedProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer border-border bg-card transition-colors hover:border-primary/50"
                  onClick={() => navigate(`/profile/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-lg uppercase tracking-tight">
                        {project.projectName || 'Unknown Project'}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-bold text-primary">
                          {project.score}/100
                        </span>
                        <span
                          className={`rounded-sm px-2 py-0.5 text-xs font-mono uppercase ${
                            project.livenessStatus === 'active'
                              ? 'bg-primary/20 text-primary'
                              : project.livenessStatus === 'degraded'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {project.livenessStatus}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileToDelete({
                              id: project.id,
                              projectName: project.projectName || 'Unknown Project',
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.programId || project.id}
                    </p>
                    {project.verifiedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Verified {new Date(project.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteProfileDialog
        open={!!profileToDelete}
        onOpenChange={(open) => !open && setProfileToDelete(null)}
        protocolName={profileToDelete?.projectName || ''}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProfile.isPending}
      />
    </Layout>
  );
};

export default Dashboard;
