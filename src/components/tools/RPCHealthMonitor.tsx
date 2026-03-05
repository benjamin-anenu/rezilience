import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ExternalLink, ArrowUpDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface RPCResult {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'private';
  latency: number | null;
  slot: number | null;
  docs_url?: string;
  requires_key?: boolean;
  error?: string;
}

const MAX_HISTORY = 20; // keep last 20 readings (~10 min at 30s intervals)

function LatencySparkline({ history, status }: { history: number[]; status: string }) {
  if (history.length < 2) return null;

  const chartData = history.map((v, i) => ({ i, v }));
  const strokeColor = status === 'private'
    ? 'hsl(var(--primary))'
    : status === 'degraded'
      ? 'hsl(45 93% 47%)'
      : 'hsl(160 60% 45%)';

  return (
    <div className="h-8 w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Area
            type="monotone"
            dataKey="v"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#spark-${status})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RPCHealthMonitor() {
  const [sortByLatency, setSortByLatency] = useState(true);
  const historyRef = useRef<Record<string, number[]>>({});
  const [latencyHistory, setLatencyHistory] = useState<Record<string, number[]>>({});

  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['rpc-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-rpc-health');
      if (error) throw error;
      return data as { results: RPCResult[]; checked_at: string };
    },
    refetchInterval: 30000,
  });

  // Accumulate latency history from each poll
  useEffect(() => {
    if (!data?.results) return;
    const updated = { ...historyRef.current };
    for (const rpc of data.results) {
      if (rpc.latency === null) continue;
      const prev = updated[rpc.name] || [];
      updated[rpc.name] = [...prev.slice(-(MAX_HISTORY - 1)), rpc.latency];
    }
    historyRef.current = updated;
    setLatencyHistory({ ...updated });
  }, [data]);

  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    if (!sortByLatency) return data.results;
    return [...data.results].sort((a, b) => {
      const statusOrder: Record<string, number> = { healthy: 0, degraded: 1, private: 2, down: 3 };
      const aOrder = statusOrder[a.status] ?? 3;
      const bOrder = statusOrder[b.status] ?? 3;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.latency === null) return 1;
      if (b.latency === null) return -1;
      return a.latency - b.latency;
    });
  }, [data?.results, sortByLatency]);

  const statusConfig: Record<string, { label: string; color: string }> = {
    healthy: { label: 'Healthy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    degraded: { label: 'Degraded', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    down: { label: 'Down', color: 'bg-destructive/20 text-destructive border-destructive/30' },
    private: { label: 'Requires Key', color: 'bg-primary/20 text-primary border-primary/30' },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          : sortedResults.map((rpc) => {
              const config = statusConfig[rpc.status] || statusConfig.down;
              const history = latencyHistory[rpc.name] || [];
              return (
                <Card key={rpc.name} className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-display flex items-center gap-1.5">
                        {rpc.requires_key && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        {rpc.name}
                      </CardTitle>
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
                          {history.length >= 2 && (
                            <span className="text-xs text-muted-foreground/60 ml-auto font-mono">
                              avg {Math.round(history.reduce((a, b) => a + b, 0) / history.length)}ms
                            </span>
                          )}
                        </div>
                        <LatencySparkline history={history} status={rpc.status} />
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              rpc.status === 'private'
                                ? 'bg-primary'
                                : rpc.latency < 200 ? 'bg-emerald-500' : rpc.latency < 500 ? 'bg-yellow-500' : 'bg-destructive'
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
                    ) : rpc.status === 'private' ? (
                      <p className="text-xs text-muted-foreground/60 italic">
                        Reachable · API key required for full access
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
                        {rpc.requires_key ? 'Get API Key' : 'Docs'} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <p className="text-xs text-muted-foreground/60 mt-2">
        Endpoints marked with <Lock className="inline h-3 w-3" /> require an API key for full RPC access.
        Visit their sites to obtain a free-tier key.
        {Object.values(latencyHistory).some(h => h.length >= 2) && (
          <span className="block mt-1">Sparklines show latency history from this session (up to {MAX_HISTORY} readings).</span>
        )}
      </p>
    </div>
  );
}
