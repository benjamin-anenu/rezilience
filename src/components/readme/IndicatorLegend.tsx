import {
  Activity,
  Fingerprint,
  Shield,
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  GitCommit,
  Users,
  Star,
  GitFork,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Score color bands
const scoreColors = [
  {
    range: '70 - 100',
    color: 'bg-primary',
    hex: '#00C2B6',
    status: 'HEALTHY',
    description: 'Active development, strong maintenance',
  },
  {
    range: '40 - 69',
    color: 'bg-amber-500',
    hex: '#F59E0B',
    status: 'STALE',
    description: 'Reduced activity, needs attention',
  },
  {
    range: '1 - 39',
    color: 'bg-destructive',
    hex: '#C24E00',
    status: 'DECAYING',
    description: 'Critical maintenance gap',
  },
  {
    range: '0 / N/A',
    color: 'bg-muted-foreground',
    hex: '#8B949E',
    status: 'UNKNOWN',
    description: 'Insufficient data',
  },
];

// Health dimension dots
const healthDots = [
  {
    dimension: 'D',
    name: 'Dependency',
    thresholds: [
      { condition: '70+ score', color: 'bg-primary', status: 'Healthy' },
      { condition: '40-69 score', color: 'bg-amber-500', status: 'Warning' },
      { condition: '<40 score', color: 'bg-destructive', status: 'Critical' },
    ],
  },
  {
    dimension: 'G',
    name: 'Governance',
    thresholds: [
      { condition: '5+ tx/30d', color: 'bg-primary', status: 'Active' },
      { condition: '1-4 tx/30d', color: 'bg-amber-500', status: 'Dormant' },
      { condition: '0 tx/30d', color: 'bg-muted-foreground', status: 'None' },
    ],
  },
  {
    dimension: 'T',
    name: 'TVL',
    thresholds: [
      { condition: '>$10M', color: 'bg-primary', status: 'Healthy' },
      { condition: '$100K-$10M', color: 'bg-amber-500', status: 'Moderate' },
      { condition: '<$100K / N/A', color: 'bg-muted-foreground', status: 'Low' },
    ],
  },
];

// Platform icons
const platformIcons = [
  { Icon: Activity, name: 'Activity', purpose: 'Liveness monitoring, commit velocity' },
  { Icon: Fingerprint, name: 'Fingerprint', purpose: 'Bytecode originality verification' },
  { Icon: Shield, name: 'Shield', purpose: 'Verification status, governance' },
  { Icon: Package, name: 'Package', purpose: 'Dependency analysis' },
  { Icon: DollarSign, name: 'DollarSign', purpose: 'TVL & economic metrics' },
  { Icon: CheckCircle, name: 'CheckCircle', purpose: 'Healthy / verified status' },
  { Icon: AlertTriangle, name: 'AlertTriangle', purpose: 'Warning / needs attention' },
  { Icon: XCircle, name: 'XCircle', purpose: 'Critical / no data' },
  { Icon: RefreshCw, name: 'RefreshCw', purpose: 'Refresh / sync action' },
  { Icon: TrendingUp, name: 'TrendingUp', purpose: 'Score increase, positive trend' },
  { Icon: TrendingDown, name: 'TrendingDown', purpose: 'Score decrease, negative trend' },
  { Icon: GitCommit, name: 'GitCommit', purpose: 'Commit activity' },
  { Icon: Users, name: 'Users', purpose: 'Contributors count' },
  { Icon: Star, name: 'Star', purpose: 'GitHub stars' },
  { Icon: GitFork, name: 'GitFork', purpose: 'Fork indicator' },
  { Icon: Clock, name: 'Clock', purpose: 'Time-based metrics, last activity' },
];

// Tier labels
const tierLabels = [
  { tier: 'TITAN', range: '90-100', color: 'text-primary', description: 'Elite infrastructure' },
  { tier: 'ELITE', range: '80-89', color: 'text-primary', description: 'Top-tier reliability' },
  { tier: 'SOLID', range: '70-79', color: 'text-primary', description: 'Healthy maintenance' },
  { tier: 'MODERATE', range: '50-69', color: 'text-amber-500', description: 'Needs improvement' },
  { tier: 'AT RISK', range: '30-49', color: 'text-amber-500', description: 'Concerning gaps' },
  { tier: 'CRITICAL', range: '0-29', color: 'text-destructive', description: 'Immediate attention needed' },
];

export function ScoreColorsLegend() {
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          Score Color Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scoreColors.map(({ range, color, hex, status, description }) => (
            <div key={status} className="flex items-center gap-4">
              <div className={cn('h-4 w-4 rounded-full shrink-0', color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">{range}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {status}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">{hex}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthDotsLegend() {
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          Health Dimension Dots (D/G/T)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {healthDots.map(({ dimension, name, thresholds }) => (
            <div key={dimension}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-lg font-bold text-primary">{dimension}</span>
                <span className="font-display text-sm uppercase tracking-wider text-foreground">
                  {name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {thresholds.map(({ condition, color, status }) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-sm bg-muted/30 px-2 py-1.5"
                  >
                    <div className={cn('h-2.5 w-2.5 rounded-full shrink-0', color)} />
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-foreground truncate">{status}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Visual example */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="font-mono text-xs text-muted-foreground mb-2">EXAMPLE DISPLAY:</p>
          <div className="flex items-center gap-1 bg-muted/30 rounded-sm px-3 py-2 w-fit">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              = Healthy deps, Dormant governance, No TVL data
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IconsLegend() {
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          Platform Icons Reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {platformIcons.map(({ Icon, name, purpose }) => (
            <div
              key={name}
              className="flex items-start gap-3 rounded-sm bg-muted/30 p-2"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-mono text-sm text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TierLabelsLegend() {
  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          Tier Classification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tierLabels.map(({ tier, range, color, description }) => (
            <div
              key={tier}
              className="flex items-center gap-4 rounded-sm bg-muted/30 px-3 py-2"
            >
              <span className={cn('font-display text-sm font-bold uppercase w-24', color)}>
                {tier}
              </span>
              <span className="font-mono text-sm text-muted-foreground w-16">{range}</span>
              <span className="text-sm text-muted-foreground">{description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
