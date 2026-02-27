import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { DAOCard, PhaseTimeline } from '@/components/accountability';
import { useAccountabilityDAOs } from '@/hooks/useAccountabilityData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const Accountability = () => {
  const { data: daos, isLoading } = useAccountabilityDAOs();

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <PhaseTimeline />

          <div className="mb-8">
            <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              DAO ACCOUNTABILITY
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Track milestone delivery and governance accountability across Solana DAOs.
              Projects with a linked Realm DAO address surface here with their commitment progress.
            </p>
          </div>

          {isLoading ? (
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
