import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Calendar, FileText } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import logoImg from '@/assets/logo.png';

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

  const radarData = [
    { dim: 'Registrations', value: Math.min(profiles.length * 10, 100) },
    { dim: 'Claims', value: Math.min(claimed * 20, 100) },
    { dim: 'Avg Score', value: avgScore },
    { dim: 'Engagement', value: Math.min((analyticsEvents || 0) / 10, 100) },
    { dim: 'Visitors', value: Math.min(uniqueSessions * 5, 100) },
    { dim: 'Scoring', value: Math.min((scoreEntries || 0) / 50, 100) },
  ];

  // All profiles for the project table
  const { data: allProfiles } = await supabase
    .from('claimed_profiles_public')
    .select('id, project_name, claim_status, resilience_score, created_at')
    .order('resilience_score', { ascending: false });

  return {
    newRegistrations: profiles.length, claimedInPeriod: claimed, avgScore,
    scoreEntries: scoreEntries || 0, engagementEvents: analyticsEvents || 0,
    uniqueVisitors: uniqueSessions, comparisonData, radarData, profiles,
    allProfiles: allProfiles || [],
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

  const getScoreColor = (score: number | null) => {
    const s = score || 0;
    if (s >= 70) return '#00C2B6';
    if (s >= 40) return '#C24E00';
    return '#8B949E';
  };

  return (
    <div ref={reportRef} className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">

      {/* ========== PRINT-ONLY: Cover Page ========== */}
      <div className="print-cover-page">
        <img src={logoImg} alt="Rezilience" className="print-cover-logo" />
        <div className="print-cover-accent" />
        <h1 className="print-cover-title">Milestone Report</h1>
        <p className="print-cover-subtitle">Solana Foundation Grant Program</p>
        <p className="print-cover-period">{startDate} → {endDate}</p>
        <p className="print-cover-date">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="print-cover-confidential">CONFIDENTIAL · REZILIENCE.FI</p>
      </div>

      {/* ========== PRINT-ONLY: Watermark ========== */}
      <div className="print-watermark">
        <img src={logoImg} alt="" />
      </div>

      {/* ========== PRINT-ONLY: Page number ========== */}
      <div className="print-page-number" />

      {/* Print-only branded header (page 2+) */}
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
          <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20 print-section">
            <StatCard compact title="Registrations" value={data.newRegistrations} />
            <StatCard compact title="Claimed" value={data.claimedInPeriod} />
            <StatCard compact title="Avg Score" value={data.avgScore} />
            <StatCard compact title="Score Snaps" value={data.scoreEntries.toLocaleString()} />
            <StatCard compact title="Events" value={data.engagementEvents.toLocaleString()} />
            <StatCard compact title="Visitors" value={data.uniqueVisitors.toLocaleString()} />
          </div>

          {/* Row: Comparison + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print-section">
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
          <div className="glass-chart p-5 print-section">
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

          {/* ========== Registered Projects Table ========== */}
          <div className="glass-chart p-5 print-section">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Registered Projects — Milestone Evidence
            </h3>
            <div className="rounded-sm border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-[9px] font-mono uppercase tracking-wider w-12">#</TableHead>
                    <TableHead className="text-[9px] font-mono uppercase tracking-wider">Project</TableHead>
                    <TableHead className="text-[9px] font-mono uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[9px] font-mono uppercase tracking-wider text-right">Score</TableHead>
                    <TableHead className="text-[9px] font-mono uppercase tracking-wider text-right">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.allProfiles.map((p, i) => (
                    <TableRow key={p.id} className="border-border/20 print-table-row">
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-sm">{p.project_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                          p.claim_status === 'claimed'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {p.claim_status || 'unclaimed'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold" style={{ color: getScoreColor(p.resilience_score) }}>
                        {p.resilience_score ?? '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-[9px] text-muted-foreground font-mono mt-2">
              {data.allProfiles.length} projects registered · Sorted by Rezilience Score (descending)
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
