import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceResult {
  name: string;
  category: string;
  status: 'up' | 'degraded' | 'down';
  latency: number | null;
  http_status?: number;
  error?: string;
}

interface StatusData {
  results: ServiceResult[];
  summary: { total: number; up: number; degraded: number; down: number };
  checked_at: string;
}

const statusIcons = {
  up: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  degraded: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  down: <XCircle className="h-4 w-4 text-destructive" />,
};

const statusLabels = {
  up: { label: 'Operational', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  degraded: { label: 'Degraded', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  down: { label: 'Down', color: 'bg-destructive/20 text-destructive border-destructive/30' },
};

export function EcosystemStatus() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['ecosystem-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-ecosystem-status');
      if (error) throw error;
      return data as StatusData;
    },
    refetchInterval: 60000,
  });

  const categories = data
    ? [...new Set(data.results.map((r) => r.category))]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Ecosystem Status</h2>
          <p className="text-sm text-muted-foreground">
            Real-time operational status of major Solana services. Auto-refreshes every 60s.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary bar */}
      {data?.summary && (
        <div className="flex gap-4 flex-wrap">
          <SummaryPill label="Operational" count={data.summary.up} variant="up" />
          <SummaryPill label="Degraded" count={data.summary.degraded} variant="degraded" />
          <SummaryPill label="Down" count={data.summary.down} variant="down" />
        </div>
      )}

      {dataUpdatedAt > 0 && (
        <p className="text-xs text-muted-foreground/60 font-mono">
          Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                {cat}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {data!.results
                  .filter((r) => r.category === cat)
                  .map((service) => {
                    const config = statusLabels[service.status] || statusLabels.down;
                    return (
                      <Card key={service.name} className="border-border/50 bg-card/50">
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-2.5">
                            {statusIcons[service.status]}
                            <span className="text-sm font-medium text-foreground">{service.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {service.latency !== null && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {service.latency}ms
                              </span>
                            )}
                            <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryPill({ label, count, variant }: { label: string; count: number; variant: 'up' | 'degraded' | 'down' }) {
  const colors = {
    up: 'text-emerald-400',
    degraded: 'text-yellow-400',
    down: 'text-destructive',
  };
  return (
    <div className="flex items-center gap-1.5">
      {statusIcons[variant]}
      <span className={cn('font-mono text-sm font-semibold', colors[variant])}>{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
