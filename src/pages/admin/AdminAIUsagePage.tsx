import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bot, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
};

const tooltipStyle = {
  background: 'hsl(214, 18%, 19%)',
  border: '1px solid hsl(214, 18%, 25%)',
  borderRadius: '2px',
  fontSize: 12,
};

async function fetchAIUsageData() {
  // Conversations & messages from existing tables
  const { count: totalConversations } = await supabase
    .from('chat_conversations')
    .select('*', { count: 'exact', head: true });

  const { count: totalMessages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  const convCount = totalConversations || 0;
  const msgCount = totalMessages || 0;
  const avgMessagesPerConvo = convCount > 0 ? Math.round((msgCount / convCount) * 10) / 10 : 0;

  // AI usage from admin_ai_usage table
  const { data: aiUsage } = await supabase
    .from('admin_ai_usage')
    .select('model, input_tokens, output_tokens, estimated_cost_usd, latency_ms, status_code, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  const usage = aiUsage || [];

  const totalInputTokens = usage.reduce((s, r) => s + (r.input_tokens || 0), 0);
  const totalOutputTokens = usage.reduce((s, r) => s + (r.output_tokens || 0), 0);
  const totalCost = usage.reduce((s, r) => s + Number(r.estimated_cost_usd || 0), 0);
  const avgLatency = usage.length > 0
    ? Math.round(usage.reduce((s, r) => s + (r.latency_ms || 0), 0) / usage.length)
    : 0;
  const errorCount = usage.filter(r => (r.status_code || 200) >= 400).length;

  // Model distribution
  const modelCounts: Record<string, number> = {};
  usage.forEach(r => {
    const m = r.model || 'unknown';
    modelCounts[m] = (modelCounts[m] || 0) + 1;
  });
  const modelDistribution = Object.entries(modelCounts).map(([name, value]) => ({ name, value }));

  // Daily cost
  const dailyCost: Record<string, number> = {};
  usage.forEach(r => {
    const day = r.created_at.substring(0, 10);
    dailyCost[day] = (dailyCost[day] || 0) + Number(r.estimated_cost_usd || 0);
  });
  const costOverTime = Object.entries(dailyCost)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 1000) / 1000 }));

  // Daily token usage
  const dailyTokens: Record<string, { input: number; output: number }> = {};
  usage.forEach(r => {
    const day = r.created_at.substring(0, 10);
    if (!dailyTokens[day]) dailyTokens[day] = { input: 0, output: 0 };
    dailyTokens[day].input += r.input_tokens || 0;
    dailyTokens[day].output += r.output_tokens || 0;
  });
  const tokenOverTime = Object.entries(dailyTokens)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, t]) => ({ date, input: t.input, output: t.output }));

  return {
    totalConversations: convCount,
    totalMessages: msgCount,
    avgMessagesPerConvo,
    totalInputTokens,
    totalOutputTokens,
    totalCost: Math.round(totalCost * 100) / 100,
    avgLatency,
    errorCount,
    modelDistribution,
    costOverTime,
    tokenOverTime,
  };
}

export function AdminAIUsage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ai-usage'],
    queryFn: fetchAIUsageData,
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const PIE_COLORS = [COLORS.teal, COLORS.orange, COLORS.steel, COLORS.light];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          AI Consumption
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          TOKEN USAGE • COST TRACKING • MODEL DISTRIBUTION
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Conversations" value={data.totalConversations} icon={<Bot className="h-4 w-4" />} />
        <StatCard title="Messages" value={data.totalMessages.toLocaleString()} icon={<MessageSquare className="h-4 w-4" />} />
        <StatCard title="Avg Msgs/Convo" value={data.avgMessagesPerConvo} />
        <StatCard title="Total AI Spend" value={`$${data.totalCost}`} icon={<DollarSign className="h-4 w-4" />} subtitle="estimated" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Input Tokens" value={data.totalInputTokens.toLocaleString()} />
        <StatCard title="Output Tokens" value={data.totalOutputTokens.toLocaleString()} />
        <StatCard title="Avg Latency" value={`${data.avgLatency}ms`} icon={<Clock className="h-4 w-4" />} />
        <StatCard title="Errors (4xx/5xx)" value={data.errorCount} trend={data.errorCount > 0 ? 'down' : 'up'} trendValue={data.errorCount === 0 ? 'zero errors' : `${data.errorCount} failures`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Over Time */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            AI Cost Over Time
          </h3>
          <div className="h-64">
            {data.costOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.costOverTime}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.steel }} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.steel }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="cost" stroke={COLORS.orange} fill="url(#costGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground font-mono">
                NO AI USAGE DATA YET
              </div>
            )}
          </div>
        </div>

        {/* Token Usage Breakdown */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Token Usage (Input vs Output)
          </h3>
          <div className="h-64">
            {data.tokenOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.tokenOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.steel }} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.steel }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="input" stackId="1" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="output" stackId="1" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground font-mono">
                NO TOKEN DATA YET
              </div>
            )}
          </div>
        </div>

        {/* Model Distribution */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Model Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {data.modelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.modelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {data.modelDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground font-mono">NO MODEL DATA YET</p>
            )}
          </div>
          {data.modelDistribution.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {data.modelDistribution.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs font-mono text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Disclaimer */}
        <div className="rounded-sm border border-border bg-card/80 p-5 flex items-center">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Cost Estimation Note
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All cost figures are <span className="text-primary font-semibold">estimates</span> based on published token pricing for each model. Actual billing may differ based on caching, batching, and provider-specific discounts.
            </p>
            <div className="flex items-center gap-2 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono text-primary">ESTIMATES ONLY — NOT ACTUAL INVOICES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
