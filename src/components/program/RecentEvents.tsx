import { ArrowUpCircle, Shield, Users, ArrowDownCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { formatDistanceToNow } from 'date-fns';

type EventType = 'score_update' | 'velocity_increase' | 'velocity_decrease' | 'status_change';

interface ScoreEvent {
  date: string;
  type: EventType;
  description: string;
  score: number;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'score_update':
      return <Activity className="h-4 w-4 text-primary" />;
    case 'velocity_increase':
      return <ArrowUpCircle className="h-4 w-4 text-primary" />;
    case 'velocity_decrease':
      return <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />;
    case 'status_change':
      return <Shield className="h-4 w-4 text-destructive" />;
  }
};

const getEventLabel = (type: EventType) => {
  switch (type) {
    case 'score_update':
      return 'SCORE';
    case 'velocity_increase':
      return 'ACTIVE';
    case 'velocity_decrease':
      return 'SLOW';
    case 'status_change':
      return 'STATUS';
  }
};

interface RecentEventsProps {
  projectId: string;
}

export function RecentEvents({ projectId }: RecentEventsProps) {
  const { data: scoreHistory, isLoading } = useScoreHistory(projectId);

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-lg uppercase tracking-tight">
            RECENT EVENTS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform score history into events
  const events: ScoreEvent[] = [];
  
  if (scoreHistory && scoreHistory.length > 0) {
    for (let i = 0; i < Math.min(scoreHistory.length, 5); i++) {
      const entry = scoreHistory[i];
      const prevEntry = scoreHistory[i + 1];
      
      let type: EventType = 'score_update';
      let description = `Resilience score recorded at ${Math.round(entry.score)}`;
      
      if (prevEntry) {
        const scoreDiff = entry.score - prevEntry.score;
        const velocityDiff = (entry.commit_velocity ?? 0) - (prevEntry.commit_velocity ?? 0);
        
        if (velocityDiff > 2) {
          type = 'velocity_increase';
          description = `Commit velocity increased by ${velocityDiff.toFixed(1)} commits/week`;
        } else if (velocityDiff < -2) {
          type = 'velocity_decrease';
          description = `Commit velocity decreased by ${Math.abs(velocityDiff).toFixed(1)} commits/week`;
        } else if (Math.abs(scoreDiff) >= 5) {
          type = 'status_change';
          description = `Score ${scoreDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreDiff).toFixed(1)} points`;
        }
      }
      
      events.push({
        date: entry.snapshot_date,
        type,
        description,
        score: entry.score,
      });
    }
  }

  const hasEvents = events.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display text-lg uppercase tracking-tight">
          RECENT EVENTS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasEvents ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Events will appear once the project is tracked
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
                    {getEventIcon(event.type)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="mt-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-primary">
                      {getEventLabel(event.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <code className="mt-1 inline-block font-mono text-xs text-muted-foreground/70">
                    score: {Math.round(event.score)}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
