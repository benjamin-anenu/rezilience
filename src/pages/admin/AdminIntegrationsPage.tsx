import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plug, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

const SERVICES = [
  { name: 'GitHub API', endpoint: 'api.github.com', dashboardUrl: 'https://github.com/settings/tokens', costEstimate: 'Free tier' },
  { name: 'DeFiLlama', endpoint: 'api.llama.fi', dashboardUrl: 'https://defillama.com', costEstimate: 'Free' },
  { name: 'Solana RPC', endpoint: 'api.mainnet-beta.solana.com', dashboardUrl: '#', costEstimate: 'Variable' },
  { name: 'Algolia Search', endpoint: 'algolia.com', dashboardUrl: 'https://dashboard.algolia.com', costEstimate: '$0-29/mo' },
  { name: 'X (Twitter) OAuth', endpoint: 'api.x.com', dashboardUrl: 'https://developer.x.com', costEstimate: 'Free' },
  { name: 'Lovable Cloud', endpoint: 'supabase.co', dashboardUrl: '#', costEstimate: 'Included' },
];

async function fetchServiceHealth() {
  const { data: healthLogs } = await supabase
    .from('admin_service_health')
    .select('service_name, status_code, latency_ms, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const logs = healthLogs || [];

  return SERVICES.map(service => {
    const serviceLogs = logs.filter(l => l.service_name === service.name);
    const lastLog = serviceLogs[0];
    const last24h = serviceLogs.filter(l => {
      const d = new Date(l.created_at);
      return d > new Date(Date.now() - 24 * 60 * 60 * 1000);
    });
    const errorsLast24h = last24h.filter(l => (l.status_code || 200) >= 400).length;
    const avgLatency = last24h.length > 0
      ? Math.round(last24h.reduce((s, l) => s + (l.latency_ms || 0), 0) / last24h.length)
      : null;

    let status: 'operational' | 'degraded' | 'down' | 'unknown' = 'unknown';
    if (lastLog) {
      const age = Date.now() - new Date(lastLog.created_at).getTime();
      if (age < 3600_000 && (lastLog.status_code || 200) < 400) status = 'operational';
      else if (age < 86400_000) status = errorsLast24h > 3 ? 'degraded' : 'operational';
      else status = 'degraded';
    }

    return {
      ...service,
      status,
      lastCall: lastLog?.created_at || null,
      errorsLast24h,
      avgLatency,
    };
  });
}

export function AdminIntegrations() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-integrations'],
    queryFn: fetchServiceHealth,
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'operational') return <CheckCircle className="h-5 w-5 text-primary" />;
    if (status === 'degraded') return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (status === 'down') return <XCircle className="h-5 w-5 text-destructive" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Integration Status
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            THIRD-PARTY SERVICE HEALTH MONITORING
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">{data.length} SERVICES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(service => (
          <div key={service.name} className="rounded-sm border border-border bg-card/80 p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <StatusIcon status={service.status} />
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{service.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{service.endpoint}</p>
                </div>
              </div>
              {service.dashboardUrl !== '#' && (
                <a href={service.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={service.status === 'operational' ? 'text-primary' : service.status === 'unknown' ? 'text-muted-foreground' : 'text-destructive'}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors (24h)</span>
                <span className={service.errorsLast24h > 0 ? 'text-destructive' : 'text-foreground'}>{service.errorsLast24h}</span>
              </div>
              {service.avgLatency !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Latency</span>
                  <span className="text-foreground">{service.avgLatency}ms</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="text-foreground">{service.costEstimate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Call</span>
                <span className="text-foreground">{service.lastCall ? new Date(service.lastCall).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
