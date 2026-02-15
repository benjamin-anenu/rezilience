import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const C = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  light: 'hsl(216, 33%, 94%)',
  violet: 'hsl(270, 60%, 55%)',
  grid: 'hsl(214, 18%, 20%)',
};

const tip = {
  contentStyle: {
    background: 'hsl(214, 18%, 12%)',
    border: '1px solid hsl(214, 18%, 22%)',
    borderRadius: '4px',
    fontSize: 11,
    fontFamily: 'JetBrains Mono, monospace',
  },
};

async function fetchAIUsageData() {
  const { count: totalConversations } = await supabase.from('chat_conversations').select('*', { count: 'exact', head: true });
  const { count: totalMessages } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true });
  const convCount = totalConversations || 0;
  const msgCount = totalMessages || 0;

  const { data: aiUsage } = await supabase
    .from('admin_ai_usage')
    .select('model, input_tokens, output_tokens, estimated_cost_usd, latency_ms, status_code, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  const usage = aiUsage || [];
  const totalInputTokens = usage.reduce((s, r) => s + (r.input_tokens || 0), 0);
  const totalOutputTokens = usage.reduce((s, r) => s + (r.output_tokens || 0), 0);
  const totalCost = usage.reduce((s, r) => s + Number(r.estimated_cost_usd || 0), 0);
  const avgLatency = usage.length > 0 ? Math.round(usage.reduce((s, r) => s + (r.latency_ms || 0), 0) / usage.length) : 0;

  // Model distribution
  const modelCounts: Record<string, number> = {};
  usage.forEach(r => { modelCounts[r.model || 'unknown'] = (modelCounts[r.model || 'unknown'] || 0) + 1; });
  const modelDistribution = Object.entries(modelCounts).map(([name, value]) => ({ name: name.split('/').pop() || name, value }));

  // Cumulative cost over time
  const dailyCost: Record<string, number> = {};
  usage.forEach(r => { const d = r.created_at.substring(0, 10); dailyCost[d] = (dailyCost[d] || 0) + Number(r.estimated_cost_usd || 0); });
  let cumCost = 0;
  const costOverTime = Object.entries(dailyCost).sort(([a], [b]) => a.localeCompare(b)).map(([date, cost]) => {
    cumCost += cost;
    return { date, daily: Math.round(cost * 1000) / 1000, cumulative: Math.round(cumCost * 100) / 100 };
  });

  // Token stacked area
  const dailyTokens: Record<string, { input: number; output: number }> = {};
  usage.forEach(r => {
    const d = r.created_at.substring(0, 10);
    if (!dailyTokens[d]) dailyTokens[d] = { input: 0, output: 0 };
    dailyTokens[d].input += r.input_tokens || 0;
    dailyTokens[d].output += r.output_tokens || 0;
  });
  const tokenOverTime = Object.entries(dailyTokens).sort(([a], [b]) => a.localeCompare(b)).map(([date, t]) => ({ date, ...t }));

  // Latency histogram
  const buckets = [0, 500, 1000, 2000, 3000, 5000, 10000];
  const latencyHist = buckets.slice(0, -1).map((min, i) => {
    const max = buckets[i + 1];
    return { range: `${min / 1000}-${max / 1000}s`, count: usage.filter(r => (r.latency_ms || 0) >= min && (r.latency_ms || 0) < max).length };
  });
  latencyHist.push({ range: '10s+', count: usage.filter(r => (r.latency_ms || 0) >= 10000).length });

  return {
    convCount, msgCount, totalInputTokens, totalOutputTokens,
    totalCost: Math.round(totalCost * 100) / 100, avgLatency,
    modelDistribution, costOverTime, tokenOverTime, latencyHist,
  };
}

export function AdminAIUsage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-ai-usage'], queryFn: fetchAIUsageData, staleTime: 60_000 });

  if (isLoading || !data) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const PIE_COLORS = [C.teal, C.orange, C.violet, C.steel, C.light];

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">AI Consumption</h1>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">TOKEN USAGE • COST TRACKING • MODEL DISTRIBUTION</p>
      </div>

      {/* KPI Strip */}
      <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
        <StatCard compact title="Conversations" value={data.convCount} />
        <StatCard compact title="Messages" value={data.msgCount.toLocaleString()} />
        <StatCard compact title="Input Tokens" value={(data.totalInputTokens / 1000).toFixed(1) + 'K'} />
        <StatCard compact title="Output Tokens" value={(data.totalOutputTokens / 1000).toFixed(1) + 'K'} />
        <StatCard compact title="Total Spend" value={`$${data.totalCost}`} subtitle="estimated" />
        <StatCard compact title="Avg Latency" value={`${data.avgLatency}ms`} />
      </div>

      {/* HERO: Cumulative Cost Curve */}
      <div className="glass-chart p-5 glow-pulse">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Cost Accumulation</h3>
        <div className="h-72">
          {data.costOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d: string) => { const [, m, day] = d.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m) - 1]} ${parseInt(day)}`; }} tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v: number) => `$${v}`} />
                <Bar dataKey="daily" fill={C.teal} radius={[3, 3, 0, 0]} name="Daily $" />
                <Bar dataKey="cumulative" fill={C.orange} radius={[3, 3, 0, 0]} name="Cumulative $" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] font-mono text-muted-foreground/50">NO AI USAGE DATA YET</div>
          )}
        </div>
      </div>

      {/* Row 2: Token Flow + Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Token Flow (Input vs Output)</h3>
          <div className="h-56">
            {data.tokenOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tokenOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => { const [, m, day] = d.split('-'); const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${months[parseInt(m) - 1]} ${parseInt(day)}`; }} tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                  <Tooltip {...tip} />
                  <Bar dataKey="input" stackId="1" fill={C.teal} name="Input" />
                  <Bar dataKey="output" stackId="1" fill={C.orange} name="Output" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] font-mono text-muted-foreground/50">NO TOKEN DATA</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Model Distribution</h3>
          <div className="h-44 flex items-center justify-center">
            {data.modelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.modelDistribution} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {data.modelDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground/50">NO MODEL DATA</span>
            )}
          </div>
          {data.modelDistribution.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {data.modelDistribution.map((e, i) => (
                <div key={e.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[9px] font-mono text-muted-foreground">{e.name} ({e.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Latency Distribution */}
      <div className="glass-chart p-5">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Response Latency Distribution</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.latencyHist}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Bar dataKey="count" fill={C.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-sm px-4 py-2.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="text-[10px] font-mono text-muted-foreground">ESTIMATES BASED ON PUBLISHED TOKEN PRICING — NOT ACTUAL INVOICES</span>
      </div>
    </div>
  );
}
