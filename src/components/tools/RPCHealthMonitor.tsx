import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RPCResult {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number | null;
  slot: number | null;
  error?: string;
}

export function RPCHealthMonitor() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['rpc-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-rpc-health');
      if (error) throw error;
      return data as { results: RPCResult[]; checked_at: string };
    },
    refetchInterval: 30000,
  });

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
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {dataUpdatedAt > 0 && (
        <p className="text-xs text-muted-foreground/60 font-mono">
          Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
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
          : data?.results.map((rpc) => {
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
                    {rpc.slot && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Slot: {rpc.slot.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
