import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Search, MousePointer, Smartphone, Monitor, Tablet } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

const COLORS = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
};

const tooltipStyle = {
  background: 'hsl(214, 18%, 19%)',
  border: '1px solid hsl(214, 18%, 25%)',
  borderRadius: '2px',
  fontSize: 12,
};

async function fetchEngagementData() {
  const { data: events, error } = await supabase
    .from('admin_analytics')
    .select('event_type, event_target, device_type, session_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) throw error;
  const all = events || [];

  const totalEvents = all.length;
  const pageViews = all.filter(e => e.event_type === 'page_view').length;
  const clicks = all.filter(e => e.event_type === 'click').length;
  const searches = all.filter(e => e.event_type === 'search').length;
  const uniqueSessions = new Set(all.map(e => e.session_id)).size;

  // Device breakdown
  const devices = { desktop: 0, mobile: 0, tablet: 0 };
  all.forEach(e => {
    const d = (e.device_type || 'desktop') as keyof typeof devices;
    if (d in devices) devices[d]++;
  });

  // Page popularity
  const pageCounts: Record<string, number> = {};
  all.filter(e => e.event_type === 'page_view').forEach(e => {
    const page = e.event_target.split('?')[0];
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });
  const pagePopularity = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([page, count]) => ({ page, count }));

  // Daily events
  const dailyCounts: Record<string, number> = {};
  all.forEach(e => {
    const day = e.created_at.substring(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const dailyActivity = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // GPT stats
  const { count: conversations } = await supabase
    .from('chat_conversations')
    .select('*', { count: 'exact', head: true });
  const { count: messages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  return {
    totalEvents,
    pageViews,
    clicks,
    searches,
    uniqueSessions,
    devices,
    pagePopularity,
    dailyActivity,
    gptConversations: conversations || 0,
    gptMessages: messages || 0,
  };
}

export function AdminEngagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-engagement'],
    queryFn: fetchEngagementData,
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          User Engagement
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          TRACKING BUILDER, DEVELOPER & INVESTOR INTERACTIONS
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={data.totalEvents.toLocaleString()} icon={<MousePointer className="h-4 w-4" />} />
        <StatCard title="Page Views" value={data.pageViews.toLocaleString()} icon={<Eye className="h-4 w-4" />} />
        <StatCard title="Unique Sessions" value={data.uniqueSessions.toLocaleString()} />
        <StatCard title="Search Queries" value={data.searches.toLocaleString()} icon={<Search className="h-4 w-4" />} />
      </div>

      {/* Device + GPT Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Desktop" value={data.devices.desktop} icon={<Monitor className="h-4 w-4" />} />
        <StatCard title="Mobile" value={data.devices.mobile} icon={<Smartphone className="h-4 w-4" />} />
        <StatCard title="Tablet" value={data.devices.tablet} icon={<Tablet className="h-4 w-4" />} />
        <StatCard title="GPT Conversations" value={data.gptConversations} subtitle="ResilienceGPT" />
        <StatCard title="GPT Messages" value={data.gptMessages} subtitle="total processed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Daily Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyActivity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.steel }} />
                <YAxis tick={{ fontSize: 10, fill: COLORS.steel }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke={COLORS.teal} fill="url(#actGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Page Popularity */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Page Popularity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pagePopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: COLORS.steel }} />
                <YAxis dataKey="page" type="category" tick={{ fontSize: 9, fill: COLORS.steel }} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={COLORS.teal} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
