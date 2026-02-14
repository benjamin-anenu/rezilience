import { 
  GitBranch, Package, Vote, DollarSign, ShieldAlert, ShieldCheck,
  Fingerprint, Lock, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface IntelligenceGridProps {
  commitVelocity: number;
  commits30d: number;
  dependencyScore: number;
  outdatedCount: number;
  criticalCount: number;
  governanceTx30d: number;
  tvlUsd: number;
  vulnerabilityCount: number | null;
  openssfScore: number | null;
  bytecodeStatus: string | null;
  decayPercentage: number;
  lastAnalyzedAt: string | null;
  isPrivate?: boolean;
}

const getHealthColor = (score: number, thresholds: [number, number] = [70, 40]) => {
  if (score >= thresholds[0]) return 'text-primary';
  if (score >= thresholds[1]) return 'text-amber-500';
  return 'text-destructive';
};

const formatTvl = (tvl: number): string => {
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
  return `$${tvl.toFixed(0)}`;
};

function MetricCell({ 
  icon: Icon, 
  label, 
  value, 
  colorClass = 'text-foreground',
  muted = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  colorClass?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon className={cn('h-3.5 w-3.5 shrink-0', muted ? 'text-muted-foreground/50' : 'text-muted-foreground')} />
      <span className="text-[11px] text-muted-foreground flex-1">{label}</span>
      <span className={cn('text-[11px] font-mono font-medium', muted ? 'text-muted-foreground/50' : colorClass)}>
        {value}
      </span>
    </div>
  );
}

export function IntelligenceGrid({
  commitVelocity,
  commits30d,
  dependencyScore,
  outdatedCount,
  criticalCount,
  governanceTx30d,
  tvlUsd,
  vulnerabilityCount,
  openssfScore,
  bytecodeStatus,
  decayPercentage,
  lastAnalyzedAt,
  isPrivate = false,
}: IntelligenceGridProps) {
  if (isPrivate) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span className="text-xs">Intelligence locked — private repository</span>
      </div>
    );
  }

  const getBytecodeLabel = (status: string | null) => {
    if (!status) return { label: 'Not Verified', color: 'text-orange-600' };
    switch (status) {
      case 'MATCH': return { label: 'Original', color: 'text-primary' };
      case 'MISMATCH': return { label: 'Suspicious', color: 'text-destructive' };
      case 'NOT_DEPLOYED': return { label: 'Off-chain', color: 'text-muted-foreground' };
      default: return { label: status, color: 'text-amber-500' };
    }
  };

  const bytecode = getBytecodeLabel(bytecodeStatus);
  const depLabel = criticalCount > 0 
    ? `${dependencyScore} · ${criticalCount} crit` 
    : outdatedCount > 0 
      ? `${dependencyScore} · ${outdatedCount} old`
      : `${dependencyScore}/100`;

  const vulnLabel = vulnerabilityCount === null ? 'Not scanned' : `${vulnerabilityCount} CVEs`;
  const vulnColor = vulnerabilityCount === null 
    ? 'text-muted-foreground' 
    : vulnerabilityCount === 0 
      ? 'text-primary' 
      : 'text-destructive';

  const openssfLabel = openssfScore === null ? 'Not indexed' : `${openssfScore.toFixed(1)}/10`;
  const openssfColor = openssfScore === null 
    ? 'text-muted-foreground' 
    : getHealthColor(openssfScore * 10);

  const decayColor = decayPercentage <= 2 ? 'text-primary' : decayPercentage <= 10 ? 'text-amber-500' : 'text-destructive';

  return (
    <div className="space-y-0.5">
      {/* Intelligence Metrics */}
      <div className="space-y-0 divide-y divide-border/50">
        <MetricCell
          icon={GitBranch}
          label="Velocity"
          value={`${commitVelocity.toFixed(1)}/d · ${commits30d} (30d)`}
          colorClass={getHealthColor(Math.min(commitVelocity * 20, 100))}
        />
        <MetricCell
          icon={Package}
          label="Dependencies"
          value={depLabel}
          colorClass={getHealthColor(dependencyScore)}
        />
        <MetricCell
          icon={Vote}
          label="Governance"
          value={governanceTx30d > 0 ? `${governanceTx30d} tx (30d)` : 'None detected'}
          colorClass={governanceTx30d > 0 ? 'text-primary' : 'text-muted-foreground'}
          muted={governanceTx30d === 0}
        />
        {tvlUsd > 0 && (
          <MetricCell
            icon={DollarSign}
            label="TVL"
            value={formatTvl(tvlUsd)}
            colorClass="text-primary"
          />
        )}
        <MetricCell
          icon={ShieldAlert}
          label="Vulnerabilities"
          value={vulnLabel}
          colorClass={vulnColor}
          muted={vulnerabilityCount === null}
        />
        <MetricCell
          icon={ShieldCheck}
          label="OpenSSF"
          value={openssfLabel}
          colorClass={openssfColor}
          muted={openssfScore === null}
        />
      </div>

      {/* Trust Signals */}
      <div className="pt-2 mt-1 border-t border-border space-y-0 divide-y divide-border/50">
        <MetricCell
          icon={Fingerprint}
          label="Bytecode"
          value={bytecode.label}
          colorClass={bytecode.color}
        />
        <MetricCell
          icon={GitBranch}
          label="Decay"
          value={`${decayPercentage.toFixed(1)}%`}
          colorClass={decayColor}
        />
      </div>

      {/* Data Freshness */}
      {lastAnalyzedAt && (
        <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Clock className="h-2.5 w-2.5" />
          <span>Last synced {formatDistanceToNow(new Date(lastAnalyzedAt), { addSuffix: true })}</span>
        </div>
      )}
    </div>
  );
}
