import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopContributor } from '@/types';

interface ContributorsPieChartProps {
  data?: TopContributor[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.25)',
  'hsl(var(--muted-foreground) / 0.5)',
];

export function ContributorsPieChart({ data }: ContributorsPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No contributor data available
        </p>
      </div>
    );
  }

  // Take top 5 and aggregate the rest as "Others"
  const topContributors = data.slice(0, 5);
  const pieData = topContributors.map((c) => ({
    name: c.login,
    value: c.contributions,
    avatar: c.avatar,
  }));

  if (data.length > 5) {
    const othersTotal = data
      .slice(5)
      .reduce((sum, c) => sum + c.contributions, 0);
    if (othersTotal > 0) {
      pieData.push({ name: 'Others', value: othersTotal, avatar: undefined });
    }
  }

  const totalContributions = pieData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalContributions) * 100).toFixed(1);
      return (
        <div className="rounded-sm border border-border bg-card px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            {data.avatar && (
              <img
                src={data.avatar}
                alt={data.name}
                className="h-5 w-5 rounded-full"
              />
            )}
            <span className="font-mono text-sm font-medium">{data.name}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {data.value.toLocaleString()} commits ({percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 px-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
