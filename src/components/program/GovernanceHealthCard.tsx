import { Shield, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface GovernanceHealthCardProps {
  governanceAddress?: string | null;
  transactions30d: number;
  lastActivity?: string | null;
  analyzedAt?: string | null;
}

export function GovernanceHealthCard({
  governanceAddress,
  transactions30d,
  lastActivity,
  analyzedAt,
}: GovernanceHealthCardProps) {
  // Calculate health status
  const getHealthStatus = () => {
    if (!governanceAddress) {
      return { 
        label: 'No Governance', 
        score: 0, 
        icon: XCircle, 
        color: 'text-muted-foreground/50',
        description: 'No multisig or DAO governance detected.'
      };
    }
    
    if (transactions30d >= 10) {
      return { 
        label: 'Very Active', 
        score: 100, 
        icon: CheckCircle, 
        color: 'text-primary',
        description: 'Strong governance activity with regular transactions.'
      };
    }
    if (transactions30d >= 5) {
      return { 
        label: 'Active', 
        score: 85, 
        icon: CheckCircle, 
        color: 'text-primary',
        description: 'Healthy governance activity detected.'
      };
    }
    if (transactions30d >= 1) {
      return { 
        label: 'Some Activity', 
        score: 70, 
        icon: AlertTriangle, 
        color: 'text-amber-500',
        description: 'Limited governance activity this month.'
      };
    }
    
    // No recent activity
    const daysSinceActivity = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceActivity > 180) {
      return { 
        label: 'Inactive', 
        score: 15, 
        icon: XCircle, 
        color: 'text-destructive',
        description: 'No governance activity in 6+ months.'
      };
    }
    if (daysSinceActivity > 90) {
      return { 
        label: 'Dormant', 
        score: 30, 
        icon: AlertTriangle, 
        color: 'text-amber-500',
        description: 'No governance activity in 3+ months.'
      };
    }
    
    return { 
      label: 'Low Activity', 
      score: 50, 
      icon: AlertTriangle, 
      color: 'text-amber-500',
      description: 'Minimal governance activity detected.'
    };
  };

  const status = getHealthStatus();
  const StatusIcon = status.icon;

  // Determine which explorer to link to
  const getExplorerLink = () => {
    if (!governanceAddress) return null;
    // Try Squads first, fallback to Solana Explorer
    return `https://explorer.solana.com/address/${governanceAddress}`;
  };

  return (
    <Card className="card-premium card-lift border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-chart-2/10">
              <Shield className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="font-display text-sm uppercase tracking-tight">
                GOVERNANCE HEALTH
              </CardTitle>
              <CardDescription className={`flex items-center gap-1.5 ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </CardDescription>
            </div>
          </div>
          {governanceAddress && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a
                href={getExplorerLink() || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Health Score Progress */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Decentralization</span>
            <span className={`font-mono text-sm font-bold ${status.color}`}>
              {status.score}/100
            </span>
          </div>
          <Progress
            value={status.score}
            className={`h-2 ${status.score < 30 ? '[&>div]:bg-destructive' : status.score < 70 ? '[&>div]:bg-amber-500' : ''}`}
          />
        </div>

        {/* Stats Row */}
        {governanceAddress && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="font-mono text-xs">
                {transactions30d}
              </Badge>
              <span className="text-muted-foreground">Tx (30d)</span>
            </div>
            
            {lastActivity && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                Last: {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="mt-3 text-xs text-muted-foreground">
          {status.description}
        </p>

        {/* Governance Address */}
        {governanceAddress && (
          <div className="mt-3 rounded bg-muted/30 px-2 py-1">
            <code className="font-mono text-[10px] text-muted-foreground">
              {governanceAddress.slice(0, 8)}...{governanceAddress.slice(-8)}
            </code>
          </div>
        )}

        {/* Last Analyzed */}
        {analyzedAt && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Last checked: {formatDistanceToNow(new Date(analyzedAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
