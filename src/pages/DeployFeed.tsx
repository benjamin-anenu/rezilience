import { useState } from 'react';
import { Layout } from '@/components/layout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, ArrowUpCircle, XCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DeployEvent {
  signature: string;
  slot: number;
  blockTime: number | null;
  programId: string;
  authority: string | null;
  type: 'deploy' | 'upgrade' | 'close';
}

const typeConfig = {
  deploy: { label: 'Deploy', icon: Rocket, className: 'bg-primary/10 text-primary border-primary/20' },
  upgrade: { label: 'Upgrade', icon: ArrowUpCircle, className: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  close: { label: 'Close', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function truncate(s: string, n = 8) {
  if (s.length <= n * 2 + 3) return s;
  return `${s.slice(0, n)}...${s.slice(-n)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function DeployFeed() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['deploy-feed'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-deploy-feed');
      if (error) throw error;
      return data as { events: DeployEvent[]; fetchedAt: string };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const events = data?.events || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 lg:px-8">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-sm border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
            <Rocket className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-wider text-primary">Live Feed</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Deploy Feed
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Real-time program deployments and upgrades on Solana mainnet.
                See what just shipped across the ecosystem.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 gap-2 font-display uppercase tracking-wider"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary pills */}
        {!isLoading && events.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {(['deploy', 'upgrade', 'close'] as const).map((t) => {
              const count = events.filter((e) => e.type === t).length;
              if (count === 0) return null;
              const cfg = typeConfig[t];
              return (
                <div key={t} className={cn('flex items-center gap-1.5 rounded-sm border px-2.5 py-1', cfg.className)}>
                  <cfg.icon className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs font-medium">{count} {cfg.label}{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-muted-foreground">
              <span className="font-mono text-xs">Auto-refresh 30s</span>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-2">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))
            : events.length === 0
            ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-12 text-center">
                <Rocket className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <p className="font-display text-lg font-semibold text-foreground">No recent deploys found</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon — Solana never sleeps.</p>
              </div>
            )
            : events.map((event) => {
                const cfg = typeConfig[event.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={event.signature}
                    className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-card"
                  >
                    {/* Type badge */}
                    <Badge variant="outline" className={cn('shrink-0 gap-1.5 w-fit', cfg.className)}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </Badge>

                    {/* Program ID */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-sm text-foreground">{truncate(event.programId)}</span>
                      <CopyButton text={event.programId} />
                    </div>

                    {/* Authority */}
                    {event.authority && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="hidden lg:inline">Authority:</span>
                        <span className="font-mono">{truncate(event.authority, 4)}</span>
                      </div>
                    )}

                    {/* Slot & time */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="font-mono">Slot {event.slot.toLocaleString()}</span>
                      {event.blockTime && (
                        <span>{formatDistanceToNow(new Date(event.blockTime * 1000), { addSuffix: true })}</span>
                      )}
                    </div>

                    {/* Solscan link */}
                    <a
                      href={`https://solscan.io/tx/${event.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                );
              })}
        </div>
      </div>
    </Layout>
  );
}
