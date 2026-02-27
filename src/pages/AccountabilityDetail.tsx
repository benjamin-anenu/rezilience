import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ProjectMilestoneCard } from '@/components/accountability';
import { useAccountabilityDetail } from '@/hooks/useAccountabilityData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

const AccountabilityDetail = () => {
  const { realmAddress } = useParams<{ realmAddress: string }>();
  const { data: projects, isLoading, isError } = useAccountabilityDetail(realmAddress);

  const truncated = realmAddress
    ? realmAddress.slice(0, 6) + '...' + realmAddress.slice(-6)
    : '';

  const copyAddress = () => {
    if (realmAddress) {
      navigator.clipboard.writeText(realmAddress);
      toast.success('Address copied');
    }
  };

  const realmName = projects && projects.length > 0 ? projects[0].projectName : 'DAO';

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4 font-display text-xs uppercase">
              <Link to="/accountability">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
                  {realmName} DAO
                </h1>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{truncated}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={copyAddress}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {projects && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} registered
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="font-display text-xs uppercase" asChild>
                <a
                  href={`https://app.realms.today/dao/${realmAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  VIEW ON REALMS
                </a>
              </Button>
            </div>
          </div>

          {/* Projects */}
          {isError ? (
            <div className="py-16 text-center">
              <p className="mb-4 text-muted-foreground">Failed to load project data.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>RETRY</Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-sm" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="space-y-6">
              {projects.map((project) => (
                <ProjectMilestoneCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No projects found for this DAO address.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AccountabilityDetail;
