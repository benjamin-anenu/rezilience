import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, RefreshCw, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface RPCResult {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number | null;
  slot: number | null;
  docs_url?: string;
  error?: string;
}

export function RPCHealthMonitor() {
  const [sortByLatency, setSortByLatency] = useState(true);
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['rpc-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-rpc-health');
      if (error) throw error;
      return data as { results: RPCResult[]; checked_at: string };
    },
    refetchInterval: 30000,
  });

  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    if (!sortByLatency) return data.results;
    return [...data.results].sort((a, b) => {
      // Healthy first, then by latency
      const statusOrder = { healthy: 0, degraded: 1, down: 2 };
      const aOrder = statusOrder[a.status] ?? 2;
      const bOrder = statusOrder[b.status] ?? 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.latency === null) return 1;
      if (b.latency === null) return -1;
      return a.latency - b.latency;
    });
  }, [data?.results, sortByLatency]);

  const statusConfig = {
    healthy: { label: 'Healthy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    degraded: { label: 'Degraded', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    down: { label: 'Down', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">RPC Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Live latency and status of major Solana RPC providers. Auto-refreshes every 30s.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSortByLatency(!sortByLatency)} className="gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortByLatency ? 'Sorted' : 'Sort'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {dataUpdatedAt > 0 && (
        <p className="text-xs text-muted-foreground/60 font-mono">
          Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          : sortedResults.map((rpc, index) => {
              const config = statusConfig[rpc.status] || statusConfig.down;
              return (
                <Card key={rpc.name} className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display">{rpc.name}</CardTitle>
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rpc.latency !== null ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-2xl font-bold text-foreground">{rpc.latency}</span>
                          <span className="text-xs text-muted-foreground">ms</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              rpc.latency < 200 ? 'bg-emerald-500' : rpc.latency < 500 ? 'bg-yellow-500' : 'bg-destructive'
                            )}
                            style={{ width: `${Math.min((rpc.latency / 1000) * 100, 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{rpc.error || 'Unreachable'}</p>
                    )}
                    {rpc.slot ? (
                      <p className="text-xs text-muted-foreground font-mono">
                        Slot: {rpc.slot.toLocaleString()}
                      </p>
                    ) : rpc.status !== 'down' ? (
                      <p className="text-xs text-muted-foreground/60 italic">
                        Reachable (slot unavailable)
                      </p>
                    ) : null}
                    {rpc.docs_url && (
                      <a
                        href={rpc.docs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        Get API Key <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <p className="text-xs text-muted-foreground/60 mt-2">
        Only truly public (no-auth) RPC endpoints are monitored. Providers like QuickNode, Alchemy, GetBlock, and Chainstack require API keys —{' '}
        visit their sites to get a free-tier key.
      </p>
    </div>
  );
}
