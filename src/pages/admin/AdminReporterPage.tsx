import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Download, Calendar } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

async function fetchReportData(startDate: string, endDate: string) {
  // Profiles created in period
  const { data: newProfiles } = await supabase
    .from('claimed_profiles_public')
    .select('id, project_name, claim_status, resilience_score, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59Z');

  // Score history in period
  const { count: scoreEntries } = await supabase
    .from('score_history')
    .select('*', { count: 'exact', head: true })
    .gte('snapshot_date', startDate)
    .lte('snapshot_date', endDate + 'T23:59:59Z');

  // Analytics events in period
  const { count: analyticsEvents } = await supabase
    .from('admin_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59Z');

  // Unique sessions in period
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

  return {
    newRegistrations: profiles.length,
    claimedInPeriod: claimed,
    avgScore,
    scoreEntries: scoreEntries || 0,
    engagementEvents: analyticsEvents || 0,
    uniqueVisitors: uniqueSessions,
    profiles,
  };
}

export function AdminReporter() {
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Grant Reporter
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            SOLANA FOUNDATION MILESTONE REPORTING
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40 bg-background/50 font-mono text-xs" />
            <span className="text-muted-foreground">→</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40 bg-background/50 font-mono text-xs" />
          </div>
          <Button onClick={() => refetch()} variant="outline" className="font-mono text-xs">
            GENERATE
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="New Registrations" value={data.newRegistrations} icon={<FileText className="h-4 w-4" />} subtitle={`${startDate} → ${endDate}`} />
            <StatCard title="Profiles Claimed" value={data.claimedInPeriod} />
            <StatCard title="Avg Resilience Score" value={data.avgScore} />
            <StatCard title="Score Snapshots" value={data.scoreEntries.toLocaleString()} />
            <StatCard title="Engagement Events" value={data.engagementEvents.toLocaleString()} />
            <StatCard title="Unique Visitors" value={data.uniqueVisitors.toLocaleString()} />
          </div>

          {/* Narrative Summary */}
          <div className="rounded-sm border border-border bg-card/80 p-6">
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Milestone Summary
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-foreground leading-relaxed">
                During the reporting period <span className="text-primary font-semibold">{startDate}</span> to <span className="text-primary font-semibold">{endDate}</span>,
                the Rezilience platform registered <span className="text-primary font-semibold">{data.newRegistrations}</span> new projects
                in the ecosystem registry, of which <span className="text-primary font-semibold">{data.claimedInPeriod}</span> were actively claimed by builders.
                The average Rezilience Score across new registrations was <span className="text-primary font-semibold">{data.avgScore}</span>.
                The scoring engine produced <span className="text-primary font-semibold">{data.scoreEntries.toLocaleString()}</span> score snapshots,
                and the platform recorded <span className="text-primary font-semibold">{data.engagementEvents.toLocaleString()}</span> user engagement events
                from <span className="text-primary font-semibold">{data.uniqueVisitors.toLocaleString()}</span> unique visitors.
              </p>
            </div>
          </div>

          {/* Export */}
          <div className="flex gap-3">
            <Button onClick={exportCSV} className="font-display">
              <Download className="h-4 w-4 mr-2" />
              EXPORT CSV
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
