import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RegistryCTABanner() {
  return (
    <div className="relative overflow-hidden rounded-sm border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-primary/5">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Activity className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            Is your project in the registry?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            166+ Solana protocols are already indexed. Claim yours to unlock your Rezilience Score, prove maintenance continuity, and build trust publicly.
          </p>
        </div>

        <Button
          asChild
          className="shrink-0 gap-2 font-display uppercase tracking-wider"
        >
          <Link to="/claim-profile">
            <ShieldCheck className="h-4 w-4" />
            Claim Your Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
