import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Package, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DependencyTreeCanvas } from '@/components/dependency-tree';
import { useDependencyGraph } from '@/hooks/useDependencyGraph';

export default function DependencyTree() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useDependencyGraph(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center gap-4">
          <Package className="h-12 w-12 animate-pulse text-primary" />
          <Skeleton className="h-6 w-48" />
          <p className="text-sm text-muted-foreground">Loading dependency graph...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              Unable to Load Dependencies
            </h2>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'The dependency graph could not be loaded.'}
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" asChild>
                <Link to="/explorer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Explorer
                </Link>
              </Button>
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const noDependencies = data.dependencies.length === 0;

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 px-4 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/explorer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Explorer
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                  Dependency Tree
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.projectName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {data.dependencies.length} dependencies
              </span>
              {data.analyzedAt && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-muted-foreground">
                    Updated {new Date(data.analyzedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Canvas or Empty State */}
        <div className="flex-1 relative">
          {noDependencies ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  No Dependencies Found
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  This project either doesn't have a Cargo.toml file, is not a Rust/Solana project,
                  or the dependency analysis hasn't been run yet.
                </p>
              </div>
              <Button variant="outline" asChild className="mt-4">
                <Link to={`/program/${id}`}>
                  View Project Profile
                </Link>
              </Button>
            </div>
          ) : (
            <DependencyTreeCanvas data={data} />
          )}
        </div>
      </div>
    </Layout>
  );
}
