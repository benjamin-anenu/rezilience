import { Heart, ExternalLink, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface DAOAccountabilityCardProps {
  realmsDaoAddress?: string | null;
  proposalsTotal?: number;
  proposalsCompleted?: number;
  proposalsActive?: number;
  deliveryRate?: number | null;
  analyzedAt?: string | null;
}

export function DAOAccountabilityCard({
  realmsDaoAddress,
  proposalsTotal = 0,
  proposalsCompleted = 0,
  proposalsActive = 0,
  deliveryRate,
  analyzedAt,
}: DAOAccountabilityCardProps) {
  if (!realmsDaoAddress) return null;

  const getDeliveryStatus = () => {
    if (deliveryRate === null || deliveryRate === undefined) {
      return {
        label: 'No Data',
        icon: XCircle,
        color: 'text-muted-foreground/50',
        progressColor: '',
        description: 'No proposal data available yet.',
      };
    }
    if (deliveryRate >= 70) {
      return {
        label: 'High Delivery',
        icon: CheckCircle,
        color: 'text-primary',
        progressColor: '',
        description: 'Strong track record of executing funded proposals.',
      };
    }
    if (deliveryRate >= 40) {
      return {
        label: 'Moderate Delivery',
        icon: AlertTriangle,
        color: 'text-amber-500',
        progressColor: '[&>div]:bg-amber-500',
        description: 'Some proposals executed, but delivery could improve.',
      };
    }
    return {
      label: 'Low Delivery',
      icon: XCircle,
      color: 'text-destructive',
      progressColor: '[&>div]:bg-destructive',
      description: 'Most funded proposals have not been executed.',
    };
  };

  const status = getDeliveryStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="card-premium card-lift border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-chart-4/10">
              <Heart className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="font-display text-sm uppercase tracking-tight">
                DAO ACCOUNTABILITY
              </CardTitle>
              <CardDescription className={`flex items-center gap-1.5 ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a
              href={`https://app.realms.today/dao/${realmsDaoAddress}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Delivery Rate */}
        {deliveryRate !== null && deliveryRate !== undefined ? (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Delivery Rate</span>
              <span className={`font-mono text-sm font-bold ${status.color}`}>
                {deliveryRate}%
              </span>
            </div>
            <Progress
              value={deliveryRate}
              className={`h-2 ${status.progressColor}`}
            />
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 rounded bg-muted/30 px-3 py-2">
            <Heart className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Awaiting first analysis...</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs">
              {proposalsTotal}
            </Badge>
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
              {proposalsCompleted}
            </Badge>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
              {proposalsActive}
            </Badge>
            <span className="text-muted-foreground">Active</span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-muted-foreground">{status.description}</p>

        {/* DAO Address */}
        <div className="mt-3 rounded bg-muted/30 px-2 py-1">
          <code className="font-mono text-[10px] text-muted-foreground">
            {realmsDaoAddress.slice(0, 8)}...{realmsDaoAddress.slice(-8)}
          </code>
        </div>

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
