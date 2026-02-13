import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, ChevronDown } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const C = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
  violet: 'hsl(270, 60%, 55%)',
  light: 'hsl(216, 33%, 94%)',
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

// Service cost rates per API call (USD)
const SERVICE_RATES: Record<string, number> = {
  'GitHub API': 0, // Free
  'DeFiLlama': 0, // Free
  'Solana RPC': 0.001,
  'Algolia Search': 0.0001,
  'X (Twitter) OAuth': 0,
  'Lovable Cloud': 0, // Fixed monthly
};

const INFRA_MONTHLY = 25; // Estimated monthly infra cost

async function fetchAutoCosts() {
  // AI costs from admin_ai_usage
  const { data: aiUsage } = await supabase
    .from('admin_ai_usage')
    .select('estimated_cost_usd, created_at')
    .order('created_at', { ascending: true });

  // API call counts from admin_service_health
  const { data: healthLogs } = await supabase
    .from('admin_service_health')
    .select('service_name, created_at')
    .order('created_at', { ascending: true });

  // Manual overrides
  const { data: manualCosts } = await supabase
    .from('admin_costs')
    .select('*')
    .order('period', { ascending: true });

  const ai = aiUsage || [];
  const health = healthLogs || [];
  const manual = manualCosts || [];

  // Monthly AI costs
  const monthlyAI: Record<string, number> = {};
  ai.forEach(r => {
    const m = r.created_at.substring(0, 7);
    monthlyAI[m] = (monthlyAI[m] || 0) + Number(r.estimated_cost_usd || 0);
  });

  // Monthly API costs (estimated)
  const monthlyAPI: Record<string, number> = {};
  const monthlyCallCounts: Record<string, Record<string, number>> = {};
  health.forEach(r => {
    const m = r.created_at.substring(0, 7);
    const rate = SERVICE_RATES[r.service_name] || 0;
    monthlyAPI[m] = (monthlyAPI[m] || 0) + rate;
    if (!monthlyCallCounts[m]) monthlyCallCounts[m] = {};
    monthlyCallCounts[m][r.service_name] = (monthlyCallCounts[m][r.service_name] || 0) + 1;
  });

  // Monthly manual costs
  const monthlyManual: Record<string, number> = {};
  manual.forEach(c => {
    monthlyManual[c.period] = (monthlyManual[c.period] || 0) + Number(c.amount_usd);
  });

  // Build unified timeline
  const allMonths = new Set<string>();
  Object.keys(monthlyAI).forEach(m => allMonths.add(m));
  Object.keys(monthlyAPI).forEach(m => allMonths.add(m));
  Object.keys(monthlyManual).forEach(m => allMonths.add(m));

  const sorted = [...allMonths].sort();
  let cumTotal = 0;
  const timeline = sorted.map(month => {
    const aiCost = Math.round((monthlyAI[month] || 0) * 100) / 100;
    const apiCost = Math.round((monthlyAPI[month] || 0) * 100) / 100;
    const manualCost = Math.round((monthlyManual[month] || 0) * 100) / 100;
    const infra = INFRA_MONTHLY;
    const total = aiCost + apiCost + manualCost + infra;
    cumTotal += total;
    return { month, ai: aiCost, api: apiCost, manual: manualCost, infra, total: Math.round(total * 100) / 100, cumulative: Math.round(cumTotal * 100) / 100 };
  });

  // Category breakdown for current month
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentData = timeline.find(t => t.month === currentMonth) || { ai: 0, api: 0, manual: 0, infra: INFRA_MONTHLY, total: INFRA_MONTHLY };
  const categoryBreakdown = [
    { name: 'AI Tokens', value: currentData.ai },
    { name: 'API Calls', value: currentData.api },
    { name: 'Infrastructure', value: currentData.infra },
    { name: 'Manual/Other', value: currentData.manual },
  ].filter(c => c.value > 0);

  // Total API calls by service
  const serviceCalls: Record<string, number> = {};
  health.forEach(r => { serviceCalls[r.service_name] = (serviceCalls[r.service_name] || 0) + 1; });
  const serviceCallData = Object.entries(serviceCalls)
    .sort(([, a], [, b]) => b - a)
    .map(([name, calls]) => ({ name, calls, cost: Math.round(calls * (SERVICE_RATES[name] || 0) * 100) / 100 }));

  const totalAllTime = timeline.reduce((s, t) => s + t.total, 0);

  return {
    timeline,
    categoryBreakdown,
    serviceCallData,
    totalMonthly: currentData.total,
    totalAllTime: Math.round(totalAllTime * 100) / 100,
    aiTotal: Math.round(ai.reduce((s, r) => s + Number(r.estimated_cost_usd || 0), 0) * 100) / 100,
    apiCalls: health.length,
    manualEntries: manual,
  };
}

export function AdminCosts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-costs-auto'], queryFn: fetchAutoCosts, staleTime: 60_000 });
  const [showManual, setShowManual] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPeriod, setNewPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [newNotes, setNewNotes] = useState('');

  const addMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('admin_costs').insert({ category: newCategory, amount_usd: parseFloat(newAmount), period: newPeriod, notes: newNotes || null });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-costs-auto'] }); setNewCategory(''); setNewAmount(''); setNewNotes(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('admin_costs').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-costs-auto'] }),
  });

  if (isLoading || !data) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const PIE_COLORS = [C.orange, C.teal, C.violet, C.steel];

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Platform Costs</h1>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">AUTO-COMPUTED FROM USAGE METRICS</p>
      </div>

      {/* KPI Strip */}
      <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
        <StatCard compact title="This Month" value={`$${data.totalMonthly.toFixed(2)}`} />
        <StatCard compact title="All-Time" value={`$${data.totalAllTime.toFixed(2)}`} />
        <StatCard compact title="AI Spend" value={`$${data.aiTotal}`} subtitle="token costs" />
        <StatCard compact title="API Calls" value={data.apiCalls.toLocaleString()} subtitle="total tracked" />
      </div>

      {/* HERO: Stacked Cost Area */}
      <div className="glass-chart p-5 glow-pulse">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Monthly Burn Breakdown</h3>
        <div className="h-72">
          {data.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="aiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.orange} stopOpacity={0.4} /><stop offset="100%" stopColor={C.orange} stopOpacity={0} /></linearGradient>
                  <linearGradient id="apiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} /></linearGradient>
                  <linearGradient id="infraFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.violet} stopOpacity={0.3} /><stop offset="100%" stopColor={C.violet} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v: number) => `$${v}`} />
                <Area type="monotone" dataKey="ai" stackId="1" stroke={C.orange} fill="url(#aiFill)" strokeWidth={2} name="AI Tokens" />
                <Area type="monotone" dataKey="api" stackId="1" stroke={C.teal} fill="url(#apiFill)" strokeWidth={2} name="API Calls" />
                <Area type="monotone" dataKey="infra" stackId="1" stroke={C.violet} fill="url(#infraFill)" strokeWidth={2} name="Infrastructure" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] font-mono text-muted-foreground/50">NO COST DATA YET</div>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-2">
          {[{ label: 'AI Tokens', color: C.orange }, { label: 'API Calls', color: C.teal }, { label: 'Infrastructure', color: C.violet }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] font-mono text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Category Donut + Service Call Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Cost Categories</h3>
          <div className="h-44 flex items-center justify-center">
            {data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tip} formatter={(v: number) => `$${v}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-[11px] font-mono text-muted-foreground/50">NO DATA</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {data.categoryBreakdown.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[9px] font-mono text-muted-foreground">{c.name} ${c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Service API Calls</h3>
          <div className="space-y-2">
            {data.serviceCallData.map((s, i) => {
              const maxCalls = data.serviceCallData[0]?.calls || 1;
              return (
                <div key={s.name} className="flex items-center gap-3 animate-card-enter" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="text-[10px] font-mono text-muted-foreground w-28 truncate text-right">{s.name}</span>
                  <div className="flex-1 h-5 bg-card/40 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${(s.calls / maxCalls) * 100}%`, background: `linear-gradient(90deg, ${C.teal}, hsl(174, 80%, 28%))` }} />
                  </div>
                  <span className="text-[10px] font-mono text-foreground w-12 text-right">{s.calls}</span>
                  <span className="text-[9px] font-mono text-muted-foreground w-14 text-right">${s.cost}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-sm px-4 py-2.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="text-[10px] font-mono text-muted-foreground">ESTIMATES BASED ON USAGE METRICS — ACTUAL COSTS MAY VARY</span>
      </div>

      {/* Manual Override Section (collapsible) */}
      <div className="glass-chart overflow-hidden">
        <button onClick={() => setShowManual(!showManual)} className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <span>Manual Cost Overrides ({data.manualEntries.length})</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showManual ? 'rotate-180' : ''}`} />
        </button>
        {showManual && (
          <div className="px-5 pb-5 space-y-3 border-t border-border/20 pt-3">
            <div className="grid grid-cols-4 gap-2">
              <Input placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-background/50 font-mono text-xs" />
              <Input placeholder="Amount" type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="bg-background/50 font-mono text-xs" />
              <Input type="month" value={newPeriod} onChange={e => setNewPeriod(e.target.value)} className="bg-background/50 font-mono text-xs" />
              <Button onClick={() => addMutation.mutate()} disabled={!newCategory || !newAmount} size="sm" className="font-mono text-xs">
                <Plus className="h-3 w-3 mr-1" /> ADD
              </Button>
            </div>
            {data.manualEntries.map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/10 pb-1">
                <span>{c.period} · {c.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-primary">${Number(c.amount_usd).toFixed(2)}</span>
                  <button onClick={() => deleteMutation.mutate(c.id)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
