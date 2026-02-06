import { 
  ArrowUpCircle, 
  Shield, 
  ArrowDownCircle, 
  Activity,
  GitCommit,
  GitPullRequest,
  CircleDot,
  Package,
  Star,
  GitFork,
  Trophy,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useScoreHistory } from '@/hooks/useScoreHistory';
import { formatDistanceToNow } from 'date-fns';
import type { RecentEvent } from '@/types';

// Unified event type combining score-derived and GitHub events
type EventType = 
  | 'score_update' 
  | 'velocity_increase' 
  | 'velocity_decrease' 
  | 'status_change'
  | 'liveness_change'
  | 'score_milestone'
  | 'push'
  | 'pull_request'
  | 'issue'
  | 'release'
  | 'star'
  | 'fork'
  | 'create'
  | 'delete';

interface UnifiedEvent {
  date: string;
  type: EventType;
  description: string;
  score?: number;
  actor?: string;
  source: 'score_history' | 'github';
  metadata?: {
    action?: string;
    ref?: string;
    commits?: number;
  };
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'push':
      return <GitCommit className="h-4 w-4 text-primary" />;
    case 'pull_request':
      return <GitPullRequest className="h-4 w-4 text-primary" />;
    case 'issue':
      return <CircleDot className="h-4 w-4 text-warning" />;
    case 'release':
      return <Package className="h-4 w-4 text-primary" />;
    case 'star':
      return <Star className="h-4 w-4 text-warning" />;
    case 'fork':
      return <GitFork className="h-4 w-4 text-accent-foreground" />;
    case 'create':
      return <Plus className="h-4 w-4 text-primary" />;
    case 'delete':
      return <Trash2 className="h-4 w-4 text-muted-foreground" />;
    case 'score_milestone':
      return <Trophy className="h-4 w-4 text-warning" />;
    case 'liveness_change':
    case 'status_change':
      return <Shield className="h-4 w-4 text-destructive" />;
    case 'velocity_increase':
      return <ArrowUpCircle className="h-4 w-4 text-primary" />;
    case 'velocity_decrease':
      return <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />;
    case 'score_update':
    default:
      return <Activity className="h-4 w-4 text-primary" />;
  }
};

const getEventLabel = (type: EventType): string => {
  switch (type) {
    case 'push':
      return 'PUSH';
    case 'pull_request':
      return 'PR';
    case 'issue':
      return 'ISSUE';
    case 'release':
      return 'RELEASE';
    case 'star':
      return 'STAR';
    case 'fork':
      return 'FORK';
    case 'create':
      return 'CREATE';
    case 'delete':
      return 'DELETE';
    case 'score_milestone':
      return 'MILESTONE';
    case 'liveness_change':
    case 'status_change':
      return 'STATUS';
    case 'velocity_increase':
      return 'ACTIVE';
    case 'velocity_decrease':
      return 'SLOW';
    case 'score_update':
    default:
      return 'SCORE';
  }
};

const getLabelVariant = (type: EventType): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type) {
    case 'release':
    case 'score_milestone':
      return 'default';
    case 'status_change':
    case 'liveness_change':
      return 'destructive';
    case 'velocity_decrease':
    case 'delete':
      return 'outline';
    default:
      return 'secondary';
  }
};

// Map GitHub event types to our unified types
const mapGitHubEventType = (ghType: string): EventType => {
  switch (ghType) {
    case 'PushEvent':
      return 'push';
    case 'PullRequestEvent':
      return 'pull_request';
    case 'IssuesEvent':
    case 'IssueCommentEvent':
      return 'issue';
    case 'ReleaseEvent':
      return 'release';
    case 'WatchEvent':
      return 'star';
    case 'ForkEvent':
      return 'fork';
    case 'CreateEvent':
      return 'create';
    case 'DeleteEvent':
      return 'delete';
    default:
      return 'push';
  }
};

const getGitHubEventDescription = (event: RecentEvent): string => {
  const actor = event.actor || 'Unknown';
  const eventType = event.type;
  
  switch (eventType) {
    case 'PushEvent':
      return `${actor} pushed commits`;
    case 'PullRequestEvent':
      return `${actor} opened a pull request`;
    case 'IssuesEvent':
      return `${actor} opened an issue`;
    case 'IssueCommentEvent':
      return `${actor} commented on an issue`;
    case 'ReleaseEvent':
      return `${actor} published a new release`;
    case 'WatchEvent':
      return `${actor} starred the repository`;
    case 'ForkEvent':
      return `${actor} forked the repository`;
    case 'CreateEvent':
      return `${actor} created a branch`;
    case 'DeleteEvent':
      return `${actor} deleted a branch`;
    case 'MemberEvent':
      return `${actor} was added as collaborator`;
    case 'PublicEvent':
      return `Repository was made public`;
    default:
      return event.message || `${actor} performed an action`;
  }
};

interface RecentEventsProps {
  projectId: string;
  githubEvents?: RecentEvent[] | null;
}

export function RecentEvents({ projectId, githubEvents }: RecentEventsProps) {
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
  const scoreEvents: UnifiedEvent[] = [];
  
  if (scoreHistory && scoreHistory.length > 0) {
    for (let i = 0; i < Math.min(scoreHistory.length, 5); i++) {
      const entry = scoreHistory[i];
      const prevEntry = scoreHistory[i + 1];
      
      let type: EventType = 'score_update';
      let description = `Resilience score recorded at ${Math.round(entry.score)}`;
      
      if (prevEntry) {
        const scoreDiff = entry.score - prevEntry.score;
        const velocityDiff = (entry.commit_velocity ?? 0) - (prevEntry.commit_velocity ?? 0);
        
        // Check for score milestones (crossing 50, 75, 90)
        const milestones = [50, 75, 90];
        for (const milestone of milestones) {
          if (prevEntry.score < milestone && entry.score >= milestone) {
            type = 'score_milestone';
            description = `Reached ${milestone}+ Resilience Score milestone!`;
            break;
          }
        }
        
        if (type === 'score_update') {
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
      }
      
      scoreEvents.push({
        date: entry.snapshot_date,
        type,
        description,
        score: entry.score,
        source: 'score_history',
      });
    }
  }

  // Transform GitHub events
  const ghEvents: UnifiedEvent[] = (githubEvents || []).map((event) => ({
    date: event.date || event.createdAt,
    type: mapGitHubEventType(event.type),
    description: getGitHubEventDescription(event),
    actor: event.actor,
    source: 'github' as const,
  }));

  // Merge and sort all events by date
  const allEvents = [...scoreEvents, ...ghEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Limit to 10 most recent

  const hasEvents = allEvents.length > 0;

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
            {allEvents.map((event, index) => (
              <div key={`${event.source}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
                    {getEventIcon(event.type)}
                  </div>
                  {index < allEvents.length - 1 && (
                    <div className="mt-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <Badge variant={getLabelVariant(event.type)} className="font-mono text-xs">
                      {getEventLabel(event.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                    </span>
                    {event.source === 'github' && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        GitHub
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.actor && (
                      <Avatar className="h-5 w-5">
                        <AvatarImage 
                          src={`https://github.com/${event.actor}.png?size=40`} 
                          alt={event.actor} 
                        />
                        <AvatarFallback className="text-xs">
                          {event.actor.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  {event.score !== undefined && (
                    <code className="mt-1 inline-block font-mono text-xs text-muted-foreground/70">
                      score: {Math.round(event.score)}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
