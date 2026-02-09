import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface TVLMetricsCardProps {
  tvlUsd: number;
  marketShare: number;
  riskRatio: number;
  protocolName?: string;
  analyzedAt?: string | null;
}

export function TVLMetricsCard({
  tvlUsd,
  marketShare,
  riskRatio,
  protocolName,
  analyzedAt,
}: TVLMetricsCardProps) {
  // Calculate risk level from ratio
  const getRiskLevel = () => {
    if (tvlUsd === 0) {
      return { 
        label: 'No TVL', 
        color: 'text-muted-foreground/50',
        icon: DollarSign,
        score: 50,
        description: 'Not a DeFi protocol or no TVL tracked.'
      };
    }
    
    if (riskRatio > 50_000_000) {
      return { 
        label: 'Zombie Titan', 
        color: 'text-destructive',
        icon: AlertTriangle,
        score: 15,
        description: 'Very high TVL relative to development activity. Potential maintenance risk.'
      };
    }
    if (riskRatio > 10_000_000) {
      return { 
        label: 'High Risk', 
        color: 'text-destructive',
        icon: AlertTriangle,
        score: 35,
        description: 'High TVL with limited development activity.'
      };
    }
    if (riskRatio > 1_000_000) {
      return { 
        label: 'Moderate', 
        color: 'text-amber-500',
        icon: AlertTriangle,
        score: 65,
        description: 'Moderate TVL-to-activity ratio. Room for improvement.'
      };
    }
    
    return { 
      label: 'Healthy', 
      color: 'text-primary',
      icon: CheckCircle,
      score: 90,
      description: 'Healthy balance between TVL and development activity.'
    };
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  // Format TVL
  const formatTVL = (value: number) => {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // DeFiLlama link
  const defiLlamaUrl = protocolName
    ? `https://defillama.com/protocol/${protocolName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`
    : null;

  return (
    <Card className="card-premium card-lift border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-chart-1/10">
              <DollarSign className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="font-display text-sm uppercase tracking-tight">
                TVL METRICS
              </CardTitle>
              <CardDescription className={`flex items-center gap-1.5 ${risk.color}`}>
                <RiskIcon className="h-3.5 w-3.5" />
                {risk.label}
              </CardDescription>
            </div>
          </div>
          {defiLlamaUrl && tvlUsd > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a
                href={defiLlamaUrl}
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
        {/* TVL Value */}
        {tvlUsd > 0 && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Value Locked</span>
              <span className="font-mono text-lg font-bold text-foreground">
                {formatTVL(tvlUsd)}
              </span>
            </div>
          </div>
        )}

        {/* Risk Score Progress */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Economic Health</span>
            <span className={`font-mono text-sm font-bold ${risk.color}`}>
              {risk.score}/100
            </span>
          </div>
          <Progress
            value={risk.score}
            className={`h-2 ${risk.score < 30 ? '[&>div]:bg-destructive' : risk.score < 70 ? '[&>div]:bg-amber-500' : ''}`}
          />
        </div>

        {/* Stats Row */}
        {tvlUsd > 0 && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                {marketShare.toFixed(3)}% of Solana
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="mt-3 text-xs text-muted-foreground">
          {risk.description}
        </p>

        {/* Last Analyzed */}
        {analyzedAt && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Data from DeFiLlama: {formatDistanceToNow(new Date(analyzedAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
