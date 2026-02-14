import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { WorldMap } from '@/components/admin/WorldMap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
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

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function fetchEngagementData() {
  const { data: events } = await supabase
    .from('admin_analytics')
    .select('event_type, event_target, device_type, session_id, created_at, country, city')
    .order('created_at', { ascending: false })
    .limit(1000);

  const all = events || [];
  const pageViews = all.filter(e => e.event_type === 'page_view').length;
  const clicks = all.filter(e => e.event_type === 'click').length;
  const searches = all.filter(e => e.event_type === 'search').length;
  const featureUses = all.filter(e => e.event_type === 'feature_use' || e.event_type === 'tab_change').length;
  const uniqueSessions = new Set(all.map(e => e.session_id)).size;

  // Session durations
  const sessionMap: Record<string, { first: number; last: number }> = {};
  all.forEach(e => {
    const ts = new Date(e.created_at).getTime();
    if (!sessionMap[e.session_id]) {
      sessionMap[e.session_id] = { first: ts, last: ts };
    } else {
      if (ts < sessionMap[e.session_id].first) sessionMap[e.session_id].first = ts;
      if (ts > sessionMap[e.session_id].last) sessionMap[e.session_id].last = ts;
    }
  });
  const durations = Object.values(sessionMap)
    .map(s => (s.last - s.first) / 1000)
    .filter(d => d > 0);
  const avgSession = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const medianSession = median(durations);

  // Device breakdown
  const devices: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
  all.forEach(e => {
    const d = (e.device_type || 'desktop') as string;
    if (d in devices) devices[d]++;
  });
  const deviceData = Object.entries(devices).map(([name, value]) => ({ name, value }));

  // Daily activity
  const dailyMap: Record<string, { views: number; clicks: number; searches: number; features: number }> = {};
  all.forEach(e => {
    const day = e.created_at.substring(0, 10);
    if (!dailyMap[day]) dailyMap[day] = { views: 0, clicks: 0, searches: 0, features: 0 };
    if (e.event_type === 'page_view') dailyMap[day].views++;
    else if (e.event_type === 'click') dailyMap[day].clicks++;
    else if (e.event_type === 'search') dailyMap[day].searches++;
    else if (e.event_type === 'feature_use' || e.event_type === 'tab_change') dailyMap[day].features++;
  });
  const dailyActivity = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, ...d }));

  // Library engagement
  const libraryPages = all.filter(e => e.event_target.includes('/library'));
  const libBreakdown: Record<string, number> = {};
  libraryPages.forEach(e => {
    const parts = e.event_target.split('/');
    const room = parts[2] || 'overview';
    const label = room.charAt(0).toUpperCase() + room.slice(1);
    libBreakdown[label] = (libBreakdown[label] || 0) + 1;
  });
  const libraryData = Object.entries(libBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));

  // Page popularity top 10
  const pageCounts: Record<string, number> = {};
  all.filter(e => e.event_type === 'page_view').forEach(e => {
    const page = e.event_target.split('?')[0];
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });
  const pagePopularity = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }));

  // Geo breakdown
  const countryCounts: Record<string, number> = {};
  all.forEach(e => {
    const c = (e as any).country as string | null;
    if (c) countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const geoData = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  // GPT stats
  const { count: conversations } = await supabase
    .from('chat_conversations')
    .select('*', { count: 'exact', head: true });
  const { count: messages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  return {
    totalEvents: all.length, pageViews, clicks, searches, featureUses, uniqueSessions,
    avgSession, medianSession,
    deviceData, dailyActivity, libraryData, pagePopularity, geoData,
    gptConversations: conversations || 0, gptMessages: messages || 0,
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

  const DEVICE_COLORS = [C.teal, C.orange, C.violet];

  return (
    <div className="p-6 lg:p-8 space-y-5 admin-gradient-bg min-h-full">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">User Engagement</h1>
        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">BUILDER, DEVELOPER & INVESTOR INTERACTIONS</p>
      </div>

      {/* KPI Strip */}
      <div className="glass-card rounded-sm kpi-strip divide-x divide-border/20">
        <StatCard compact title="Events" value={data.totalEvents.toLocaleString()} />
        <StatCard compact title="Page Views" value={data.pageViews.toLocaleString()} />
        <StatCard compact title="Clicks" value={data.clicks.toLocaleString()} />
        <StatCard compact title="Searches" value={data.searches.toLocaleString()} />
        <StatCard compact title="Features" value={data.featureUses.toLocaleString()} />
        <StatCard compact title="Sessions" value={data.uniqueSessions.toLocaleString()} />
        <StatCard compact title="Avg Session" value={formatDuration(data.avgSession)} />
        <StatCard compact title="Median Session" value={formatDuration(data.medianSession)} />
        <StatCard compact title="GPT Convos" value={data.gptConversations} />
        <StatCard compact title="GPT Msgs" value={data.gptMessages} />
      </div>

      {/* HERO: Daily Activity */}
      <div className="glass-chart p-5 glow-pulse">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Daily Activity Breakdown
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyActivity}>
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.orange} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.orange} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="featuresFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.violet} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="views" stackId="1" stroke={C.teal} fill="url(#viewsFill)" strokeWidth={2} name="Page Views" />
              <Area type="monotone" dataKey="clicks" stackId="1" stroke={C.orange} fill="url(#clicksFill)" strokeWidth={2} name="Clicks" />
              <Area type="monotone" dataKey="features" stackId="1" stroke={C.violet} fill="url(#featuresFill)" strokeWidth={2} name="Features" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          {[
            { label: 'Views', color: C.teal },
            { label: 'Clicks', color: C.orange },
            { label: 'Features', color: C.violet },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] font-mono text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Library Engagement + Device Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Library Room Engagement
          </h3>
          {data.libraryData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.libraryData} layout="vertical">
                  <defs>
                    <linearGradient id="libBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={C.teal} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={C.teal} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: C.steel }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: C.steel }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip {...tip} />
                  <Bar dataKey="count" fill="url(#libBar)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-[11px] font-mono text-muted-foreground/50">
              NO LIBRARY ENGAGEMENT DATA YET
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-chart p-5">
          <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Device Distribution
          </h3>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {data.deviceData.map((_, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {data.deviceData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: DEVICE_COLORS[i] }} />
                <span className="text-[10px] font-mono text-muted-foreground">{d.name} <span className="text-foreground font-semibold">{d.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Page Popularity */}
      <div className="glass-chart p-5">
        <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Page Popularity
        </h3>
        <div className="space-y-1.5">
          {data.pagePopularity.map((p, i) => {
            const maxVal = data.pagePopularity[0]?.count || 1;
            const pct = (p.count / maxVal) * 100;
            return (
              <div key={p.page} className="flex items-center gap-3 animate-card-enter" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="text-[9px] font-mono text-muted-foreground w-32 truncate text-right">{p.page}</span>
                <div className="flex-1 h-5 bg-card/40 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.teal}, hsl(174, 80%, 28%))` }} />
                </div>
                <span className="text-[10px] font-mono text-foreground font-semibold w-8 text-right">{p.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: Visitor Locations — World Map + Bar Chart */}
      {data.geoData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 glass-chart p-5">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Visitor Map
            </h3>
            <div className="h-56">
              <WorldMap data={data.geoData} />
            </div>
          </div>

          <div className="lg:col-span-2 glass-chart p-5">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Top Locations
            </h3>
            <div className="space-y-1.5">
              {data.geoData.map((g, i) => {
                const maxVal = data.geoData[0]?.count || 1;
                const pct = (g.count / maxVal) * 100;
                return (
                  <div key={g.country} className="flex items-center gap-3 animate-card-enter" style={{ animationDelay: `${i * 30}ms` }}>
                    <span className="text-[9px] font-mono text-muted-foreground w-24 truncate text-right">{g.country}</span>
                    <div className="flex-1 h-5 bg-card/40 rounded-sm overflow-hidden">
                      <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.orange}, hsl(24, 80%, 28%))` }} />
                    </div>
                    <span className="text-[10px] font-mono text-foreground font-semibold w-8 text-right">{g.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
