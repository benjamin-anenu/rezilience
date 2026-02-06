import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import type { RecentEvent } from '@/types';

interface ActivityAreaChartProps {
  events?: RecentEvent[];
}

interface DayData {
  date: string;
  PushEvent: number;
  IssuesEvent: number;
  PullRequestEvent: number;
  ReleaseEvent: number;
  Other: number;
}

const EVENT_COLORS = {
  PushEvent: 'hsl(var(--primary))',
  PullRequestEvent: 'hsl(var(--primary) / 0.7)',
  IssuesEvent: 'hsl(var(--primary) / 0.5)',
  ReleaseEvent: 'hsl(var(--primary) / 0.35)',
  Other: 'hsl(var(--muted-foreground) / 0.4)',
};

export function ActivityAreaChart({ events }: ActivityAreaChartProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No recent activity data available
        </p>
      </div>
    );
  }

  // Generate last 14 days of data
  const today = new Date();
  const dayMap = new Map<string, DayData>();

  // Initialize all days
  for (let i = 13; i >= 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    dayMap.set(date, {
      date,
      PushEvent: 0,
      IssuesEvent: 0,
      PullRequestEvent: 0,
      ReleaseEvent: 0,
      Other: 0,
    });
  }

  // Aggregate events by day and type
  events.forEach((event) => {
    try {
      // Use date or createdAt field
      const dateStr = event.date || event.createdAt;
      const eventDate = format(parseISO(dateStr), 'yyyy-MM-dd');
      const dayData = dayMap.get(eventDate);
      if (dayData) {
        const eventType = event.type as keyof DayData;
        if (eventType in dayData && eventType !== 'date') {
          (dayData[eventType] as number)++;
        } else if (eventType !== 'date') {
          dayData.Other++;
        }
      }
    } catch {
      // Skip invalid dates
    }
  });

  const chartData = Array.from(dayMap.values()).map((day) => ({
    ...day,
    displayDate: format(parseISO(day.date), 'MMM d'),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, item: any) => sum + item.value, 0);
      return (
        <div className="rounded-sm border border-border bg-card px-3 py-2 shadow-lg">
          <div className="mb-1.5 font-mono text-sm font-medium">{label}</div>
          {payload.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.dataKey}</span>
              </div>
              <span className="font-mono">{item.value}</span>
            </div>
          ))}
          <div className="mt-1.5 border-t border-border pt-1.5 text-xs">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-mono font-medium">{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            iconType="square"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="PushEvent"
            stackId="1"
            stroke={EVENT_COLORS.PushEvent}
            fill={EVENT_COLORS.PushEvent}
            fillOpacity={0.8}
            name="Push"
          />
          <Area
            type="monotone"
            dataKey="PullRequestEvent"
            stackId="1"
            stroke={EVENT_COLORS.PullRequestEvent}
            fill={EVENT_COLORS.PullRequestEvent}
            fillOpacity={0.8}
            name="Pull Request"
          />
          <Area
            type="monotone"
            dataKey="IssuesEvent"
            stackId="1"
            stroke={EVENT_COLORS.IssuesEvent}
            fill={EVENT_COLORS.IssuesEvent}
            fillOpacity={0.8}
            name="Issues"
          />
          <Area
            type="monotone"
            dataKey="ReleaseEvent"
            stackId="1"
            stroke={EVENT_COLORS.ReleaseEvent}
            fill={EVENT_COLORS.ReleaseEvent}
            fillOpacity={0.8}
            name="Release"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
