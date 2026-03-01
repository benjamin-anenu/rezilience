import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { DAOCard, PhaseTimeline } from '@/components/accountability';
import { useAccountabilityDAOs } from '@/hooks/useAccountabilityData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ArrowRight, Coins, BookOpen, Target, Vote } from 'lucide-react';

const Accountability = () => {
  const { data: daos, isLoading, isError } = useAccountabilityDAOs();

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <PhaseTimeline />

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                DAO ACCOUNTABILITY
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Track milestone delivery and governance accountability across Solana DAOs.
                Projects with a linked Realm DAO address surface here with their commitment progress.
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0 font-display uppercase tracking-wider">
              <Link to="/bounty-board">
                <Coins className="mr-2 h-4 w-4" />
                BOUNTY BOARD
              </Link>
            </Button>
          </div>

          {/* Educational How-It-Works section */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                  How DAO Accountability Works
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-display text-xs font-semibold uppercase">1. Link Your DAO</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    During registration, paste your <span className="font-semibold text-foreground">Realm DAO address</span> from{' '}
                    <a href="https://app.realms.today" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">app.realms.today</a>.
                    Find it in your DAO's URL.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-display text-xs font-semibold uppercase">2. Request Funding</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set milestones and allocate SOL per milestone. A governance proposal is submitted for your DAO to vote on.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Vote className="h-4 w-4 text-primary" />
                    <span className="font-display text-xs font-semibold uppercase">3. Deliver & Earn</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submit evidence for each milestone. The DAO votes to release escrowed SOL. Your delivery rate builds reputation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isError ? (
            <div className="py-16 text-center">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-destructive/40" />
              <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                FAILED TO LOAD
              </h2>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                Could not fetch DAO accountability data. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                RETRY
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-sm" />
              ))}
            </div>
          ) : daos && daos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {daos.map((dao) => (
                <DAOCard key={dao.realmAddress} dao={dao} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                NO DAOS TRACKED YET
              </h2>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                Projects need to link their Realm DAO address during registration to appear here.
                Join the registry and add your governance address.
              </p>
              <Button asChild>
                <Link to="/claim-profile">
                  JOIN THE REGISTRY
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Accountability;
