import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plug, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const SERVICES = [
  { name: 'GitHub API', endpoint: 'api.github.com', dashboardUrl: 'https://github.com/settings/tokens', costEstimate: 'Free tier' },
  { name: 'DeFiLlama API', endpoint: 'api.llama.fi', dashboardUrl: 'https://defillama.com', costEstimate: 'Free' },
  { name: 'Solana RPC', endpoint: 'api.mainnet-beta.solana.com', dashboardUrl: '#', costEstimate: 'Variable' },
  { name: 'Lovable AI Gateway', endpoint: 'ai-gateway.lovable.dev', dashboardUrl: '#', costEstimate: 'Included' },
  { name: 'OtterSec API', endpoint: 'osec.io', dashboardUrl: 'https://osec.io', costEstimate: 'Free' },
  { name: 'OpenSSF Scorecard', endpoint: 'api.scorecard.dev', dashboardUrl: 'https://scorecard.dev', costEstimate: 'Free' },
  { name: 'Crates.io API', endpoint: 'crates.io', dashboardUrl: 'https://crates.io', costEstimate: 'Free' },
  { name: 'X (Twitter) API', endpoint: 'api.x.com', dashboardUrl: 'https://developer.x.com', costEstimate: 'Free' },
  { name: 'Algolia Search', endpoint: 'algolia.net', dashboardUrl: 'https://dashboard.algolia.com', costEstimate: '$0-29/mo' },
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
    const last24h = serviceLogs.filter(l => new Date(l.created_at) > new Date(Date.now() - 86400_000));
    const errorsLast24h = last24h.filter(l => (l.status_code || 200) >= 400).length;
    const avgLatency = last24h.length > 0
      ? Math.round(last24h.reduce((s, l) => s + (l.latency_ms || 0), 0) / last24h.length)
      : null;

    // Sparkline data (last 20 calls, latency)
    const sparkline = serviceLogs.slice(0, 20).reverse().map((l, i) => ({ i, v: l.latency_ms || 0 }));

    let status: 'operational' | 'degraded' | 'down' | 'unknown' = 'unknown';
    if (lastLog) {
      const age = Date.now() - new Date(lastLog.created_at).getTime();
      if (age < 3600_000 && (lastLog.status_code || 200) < 400) status = 'operational';
      else if (age < 86400_000) status = errorsLast24h > 3 ? 'degraded' : 'operational';
      else status = 'degraded';
    }

    return { ...service, status, lastCall: lastLog?.created_at || null, errorsLast24h, avgLatency, sparkline };
  });
}

export function AdminIntegrations() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-integrations'], queryFn: fetchServiceHealth, staleTime: 30_000 });

  if (isLoading || !data) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const statusColor = (s: string) => s === 'operational' ? 'bg-primary' : s === 'degraded' ? 'bg-destructive' : s === 'down' ? 'bg-destructive' : 'bg-muted-foreground/30';
  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'operational') return <CheckCircle className="h-4 w-4 text-primary" />;
    if (status === 'degraded') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (status === 'down') return <XCircle className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Integration Status</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">THIRD-PARTY SERVICE HEALTH MONITORING</p>
        </div>
        <div className="flex items-center gap-2">
          <Plug className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono text-muted-foreground">{data.length} SERVICES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(service => (
          <div key={service.name} className="glass-chart p-5 hover:border-primary/20 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Pulsing status dot */}
                <div className="relative">
                  <span className={`block h-2.5 w-2.5 rounded-full ${statusColor(service.status)}`} />
                  {service.status === 'operational' && (
                    <span className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-primary pulse-subtle" />
                  )}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{service.name}</p>
                  <p className="text-[9px] font-mono text-muted-foreground/60">{service.endpoint}</p>
                </div>
              </div>
              {service.dashboardUrl !== '#' && (
                <a href={service.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Latency Sparkline */}
            {service.sparkline.length > 1 && (
              <div className="h-10 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={service.sparkline}>
                    <defs>
                      <linearGradient id={`spark-${service.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(174, 100%, 38%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="hsl(174, 100%, 38%)" fill={`url(#spark-${service.name})`} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Status</span>
                <span className={service.status === 'operational' ? 'text-primary' : service.status === 'unknown' ? 'text-muted-foreground' : 'text-destructive'}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Errors (24h)</span>
                <span className={service.errorsLast24h > 0 ? 'text-destructive' : 'text-foreground'}>{service.errorsLast24h}</span>
              </div>
              {service.avgLatency !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Avg Latency</span>
                  <span className="text-foreground">{service.avgLatency}ms</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">Cost</span>
                <span className="text-foreground">{service.costEstimate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
