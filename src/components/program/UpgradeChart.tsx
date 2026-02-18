import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreTrendChart } from './ScoreTrendChart';

interface UpgradeChartProps {
  projectId: string;
}

export function UpgradeChart({ projectId }: UpgradeChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg uppercase tracking-tight">
          SCORE HISTORY
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScoreTrendChart projectId={projectId} />
      </CardContent>
    </Card>
  );
}
