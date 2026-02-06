import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout';
import { EcosystemStats, SearchBar, ProgramLeaderboard } from '@/components/explorer';
import { useExplorerProjects } from '@/hooks/useExplorerProjects';
import { Skeleton } from '@/components/ui/skeleton';

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const { data: projects, isLoading, error } = useExplorerProjects();

  const filteredPrograms = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.program_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || project.liveness_status === statusFilter.toUpperCase();

      const matchesVerification =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && project.verified) ||
        (verificationFilter === 'unverified' && !project.verified);

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [projects, searchQuery, statusFilter, verificationFilter]);

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                RESILIENCE REGISTRY
              </h1>
              <p className="text-muted-foreground">
                Browse verified protocols and their trust metrics across the Solana ecosystem.
              </p>
            </div>
          </div>

          {/* Ecosystem Stats */}
          <div className="mb-8">
            <EcosystemStats />
          </div>

          {/* Search & Filters */}
          <div className="mb-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              verificationFilter={verificationFilter}
              onVerificationFilterChange={setVerificationFilter}
            />
          </div>

          {/* Results count */}
          <div className="mb-4">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-mono text-foreground">{filteredPrograms.length}</span> registered protocols
              </p>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-center">
              <p className="text-sm text-destructive">
                Failed to load programs. Please try again later.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPrograms.length === 0 && (
            <div className="rounded-sm border border-border bg-card p-12 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="mb-2 font-display text-lg font-semibold uppercase text-foreground">
                  {searchQuery || statusFilter !== 'all' ? 'No Matches Found' : 'No Registered Protocols Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No protocols match your search criteria. Try adjusting your filters.'
                    : 'Be among the first builders to register your protocol in the Resilience Registry.'}
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {!isLoading && !error && filteredPrograms.length > 0 && (
            <ProgramLeaderboard projects={filteredPrograms} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Explorer;
