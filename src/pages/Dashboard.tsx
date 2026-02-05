import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Compass, LogOut } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import type { ClaimedProfile } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [verifiedProjects, setVerifiedProjects] = useState<ClaimedProfile[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/claim-profile');
      return;
    }

    // Load verified projects from localStorage
    const stored = localStorage.getItem('verifiedPrograms');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVerifiedProjects(Object.values(parsed));
      } catch {
        // Ignore parse errors
      }
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
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
                YOUR PROTOCOLS
              </h1>
              <p className="text-muted-foreground">
                Manage your verified projects and monitor Resilience Scores
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
                CLAIM NEW PROTOCOL
              </Link>
            </Button>
            <Button variant="outline" asChild className="font-display font-semibold uppercase tracking-wider">
              <Link to="/explorer">
                <Compass className="mr-2 h-4 w-4" />
                EXPLORE PROJECTS
              </Link>
            </Button>
          </div>

          {/* Verified Projects */}
          {verifiedProjects.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="mb-2 font-display text-lg uppercase tracking-tight text-muted-foreground">
                  No Verified Projects
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Claim your first protocol to get started
                </p>
                <Button asChild className="font-display font-semibold uppercase tracking-wider">
                  <Link to="/claim-profile">CLAIM NOW</Link>
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
    </Layout>
  );
};

export default Dashboard;
