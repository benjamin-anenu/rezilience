import { useState, useMemo } from 'react';
import { ExternalLink, Gift, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { solanaAirdrops, lastUpdated, type SolanaAirdrop } from '@/data/solana-airdrops';
import { cn } from '@/lib/utils';

/* ─── Config ─────────────────────────────────────────── */

type StatusFilter = 'all' | 'ongoing' | 'upcoming' | 'completed';
type CategoryFilter = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: 'COMPLETED', className: 'border-muted-foreground/40 bg-muted/30 text-muted-foreground' },
  ongoing: { label: 'ONGOING', className: 'border-primary/40 bg-primary/10 text-primary' },
  upcoming: { label: 'UPCOMING', className: 'border-chart-4/40 bg-chart-4/10 text-chart-4' },
  speculated: { label: 'SPECULATED', className: 'border-destructive/40 bg-destructive/10 text-destructive' },
};

const categories = ['All', 'DeFi', 'Trading', 'DePIN', 'AI', 'Infrastructure', 'Mobile', 'Social'];

/* ─── Card ───────────────────────────────────────────── */

function AirdropCard({ airdrop }: { airdrop: SolanaAirdrop }) {
  const status = statusConfig[airdrop.status] || statusConfig.ongoing;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-primary/30 bg-transparent transition-all duration-300 hover:border-primary/60">
      {/* Header */}
      <div className="border-b border-primary/20 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{airdrop.logoEmoji}</span>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {airdrop.project}
              </p>
            </div>
            <h3 className="mt-1.5 font-display text-sm font-semibold leading-snug text-foreground">
              {airdrop.name}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 rounded-sm text-[9px] font-bold uppercase tracking-widest', status.className)}
          >
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-sm border-border text-[9px] uppercase tracking-wider">
            {airdrop.category}
          </Badge>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {airdrop.dateRange}
          </span>
        </div>

        {/* Eligibility */}
        <p className="text-xs leading-relaxed text-muted-foreground">{airdrop.eligibility}</p>

        {/* Token info */}
        {(airdrop.tokenSymbol || airdrop.estimatedValue) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {airdrop.tokenSymbol && (
              <span className="text-foreground">
                Token: <span className="font-mono font-semibold text-primary">${airdrop.tokenSymbol}</span>
              </span>
            )}
            {airdrop.estimatedValue && (
              <span className="text-muted-foreground">Est: {airdrop.estimatedValue}</span>
            )}
          </div>
        )}

        {airdrop.totalAllocation && (
          <p className="text-[10px] text-muted-foreground/70">Allocation: {airdrop.totalAllocation}</p>
        )}

        {/* How to qualify */}
        {airdrop.status !== 'completed' && airdrop.howToQualify.length > 0 && (
          <div className="mt-auto">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              How to qualify
            </p>
            <ol className="space-y-1">
              {airdrop.howToQualify.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/30 font-mono text-[9px] text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-primary/20 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
          asChild
        >
          <a href={airdrop.projectUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            Website
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
          asChild
        >
          <a href={airdrop.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            Source
          </a>
        </Button>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */

export default function AirdropCalendar() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    return solanaAirdrops.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      return true;
    });
  }, [statusFilter, categoryFilter]);

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: solanaAirdrops.length },
    { key: 'ongoing', label: 'Ongoing', count: solanaAirdrops.filter((a) => a.status === 'ongoing').length },
    { key: 'upcoming', label: 'Upcoming', count: solanaAirdrops.filter((a) => a.status === 'upcoming').length },
    { key: 'completed', label: 'Completed', count: solanaAirdrops.filter((a) => a.status === 'completed').length },
  ];

  return (
    <Layout>
      <div className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="h-6 w-6 text-primary" />
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                Airdrop & Token Launch Calendar
              </p>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Solana Airdrops
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A curated directory of verified Solana ecosystem airdrops and token launches.
              Explore completed drops for historical context and ongoing campaigns you can still qualify for.
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* DYOR Disclaimer */}
          <div className="mb-8 flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 px-5 py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-destructive">DYOR — </span>
              Airdrop criteria and eligibility may change without notice. Always verify directly with the project.
              This list is for informational purposes only and does not constitute financial advice.
              Never share private keys or seed phrases to "claim" an airdrop.
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
                  statusFilter === tab.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors',
                  categoryFilter === cat
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground/60 hover:border-border hover:text-muted-foreground',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-mono text-sm text-muted-foreground">No airdrops match the selected filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((airdrop) => (
                <AirdropCard key={airdrop.id} airdrop={airdrop} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
