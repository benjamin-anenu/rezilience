import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Calendar, FileText } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const C = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
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

async function fetchReportData(startDate: string, endDate: string) {
  const { data: newProfiles } = await supabase
    .from('claimed_profiles_public')
    .select('id, project_name, claim_status, resilience_score, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59Z');

  const { count: scoreEntries } = await supabase
    .from('score_history')
    .select('*', { count: 'exact', head: true })
    .gte('snapshot_date', startDate)
    .lte('snapshot_date', endDate + 'T23:59:59Z');

  const { count: analyticsEvents } = await supabase
    .from('admin_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59Z');

  const { data: sessions } = await supabase
    .from('admin_analytics')
    .select('session_id')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59Z');

  const uniqueSessions = new Set((sessions || []).map(s => s.session_id)).size;

  const profiles = newProfiles || [];
  const claimed = profiles.filter(p => p.claim_status === 'claimed').length;
  const avgScore = profiles.length > 0
    ? Math.round(profiles.reduce((s, p) => s + Number(p.resilience_score || 0), 0) / profiles.length * 10) / 10
    : 0;

  // Previous period comparison
  const periodDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400_000);
  const prevStart = new Date(new Date(startDate).getTime() - periodDays * 86400_000).toISOString().substring(0, 10);
  const prevEnd = new Date(new Date(startDate).getTime() - 86400_000).toISOString().substring(0, 10);

  const { data: prevProfiles } = await supabase
    .from('claimed_profiles_public')
    .select('id', { count: 'exact' })
    .gte('created_at', prevStart)
    .lte('created_at', prevEnd + 'T23:59:59Z');

  const { count: prevEvents } = await supabase
    .from('admin_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevStart)
    .lte('created_at', prevEnd + 'T23:59:59Z');

  const comparisonData = [
    { metric: 'Registrations', current: profiles.length, previous: (prevProfiles || []).length },
    { metric: 'Claimed', current: claimed, previous: 0 },
    { metric: 'Engagement', current: analyticsEvents || 0, previous: prevEvents || 0 },
    { metric: 'Visitors', current: uniqueSessions, previous: 0 },
  ];

  // Radar chart data
  const radarData = [
    { dim: 'Registrations', value: Math.min(profiles.length * 10, 100) },
    { dim: 'Claims', value: Math.min(claimed * 20, 100) },
    { dim: 'Avg Score', value: avgScore },
    { dim: 'Engagement', value: Math.min((analyticsEvents || 0) / 10, 100) },
    { dim: 'Visitors', value: Math.min(uniqueSessions * 5, 100) },
    { dim: 'Scoring', value: Math.min((scoreEntries || 0) / 50, 100) },
  ];

  return {
    newRegistrations: profiles.length, claimedInPeriod: claimed, avgScore,
    scoreEntries: scoreEntries || 0, engagementEvents: analyticsEvents || 0,
    uniqueVisitors: uniqueSessions, comparisonData, radarData, profiles,
  };
}

export function AdminReporter() {
  const reportRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().substring(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString().substring(0, 10);
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-report', startDate, endDate],
    queryFn: () => fetchReportData(startDate, endDate),
    staleTime: 60_000,
  });

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Period', `${startDate} to ${endDate}`],
      ['New Registrations', data.newRegistrations],
      ['Claimed Profiles', data.claimedInPeriod],
      ['Avg Resilience Score', data.avgScore],
      ['Score Snapshots', data.scoreEntries],
      ['Engagement Events', data.engagementEvents],
      ['Unique Visitors', data.uniqueVisitors],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rezilience-report-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!reportRef.current) return;
    reportRef.current.classList.add('print-report');
    window.print();
    setTimeout(() => reportRef.current?.classList.remove('print-report'), 500);
  };

  return (
    <div ref={reportRef} className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      {/* Print-only branded header */}
      <div className="hidden print-header">
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Rezilience — Milestone Report</h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>SOLANA FOUNDATION GRANT · {startDate} → {endDate} · Generated {new Date().toLocaleDateString()}</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Grant Reporter</h1>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SOLANA FOUNDATION MILESTONE REPORTING</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36 bg-background/50 font-mono text-[10px] h-8" />
          <span className="text-muted-foreground text-xs">→</span>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36 bg-background/50 font-mono text-[10px] h-8" />
          <Button onClick={() => refetch()} variant="outline" size="sm" className="font-mono text-[10px] h-8">GENERATE</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : data ? (
        <>
          {/* KPI Strip */}
          <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
            <StatCard compact title="Registrations" value={data.newRegistrations} />
            <StatCard compact title="Claimed" value={data.claimedInPeriod} />
            <StatCard compact title="Avg Score" value={data.avgScore} />
            <StatCard compact title="Score Snaps" value={data.scoreEntries.toLocaleString()} />
            <StatCard compact title="Events" value={data.engagementEvents.toLocaleString()} />
            <StatCard compact title="Visitors" value={data.uniqueVisitors.toLocaleString()} />
          </div>

          {/* Row: Comparison + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Period Comparison */}
            <div className="glass-chart p-5">
              <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Period vs Previous</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                    <Tooltip {...tip} />
                    <Bar dataKey="previous" fill={C.steel} radius={[3, 3, 0, 0]} name="Previous" />
                    <Bar dataKey="current" fill={C.teal} radius={[3, 3, 0, 0]} name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar */}
            <div className="glass-chart p-5">
              <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Dimension Summary</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke={C.grid} />
                    <PolarAngleAxis dataKey="dim" tick={{ fontSize: 9, fill: C.steel }} />
                    <Radar dataKey="value" stroke={C.teal} fill={C.teal} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="glass-chart p-5">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Milestone Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              During <span className="text-primary font-semibold">{startDate}</span> to <span className="text-primary font-semibold">{endDate}</span>,
              Rezilience registered <span className="text-primary font-semibold">{data.newRegistrations}</span> new projects,
              <span className="text-primary font-semibold"> {data.claimedInPeriod}</span> claimed by builders (avg score: <span className="text-primary font-semibold">{data.avgScore}</span>).
              The scoring engine produced <span className="text-primary font-semibold">{data.scoreEntries.toLocaleString()}</span> snapshots across
              <span className="text-primary font-semibold"> {data.engagementEvents.toLocaleString()}</span> engagement events from
              <span className="text-primary font-semibold"> {data.uniqueVisitors.toLocaleString()}</span> unique visitors.
            </p>
          </div>

          <div className="flex gap-3 no-print">
            <Button onClick={exportPDF} className="font-display">
              <FileText className="h-4 w-4 mr-2" /> EXPORT PDF
            </Button>
            <Button onClick={exportCSV} variant="outline" className="font-display">
              <Download className="h-4 w-4 mr-2" /> EXPORT CSV
            </Button>
          </div>

          {/* Print-only footer */}
          <div className="hidden print-footer">
            Rezilience · Solana Ecosystem Resilience Intelligence · rezilience.lovable.app · Confidential
          </div>
        </>
      ) : null}
    </div>
  );
}
