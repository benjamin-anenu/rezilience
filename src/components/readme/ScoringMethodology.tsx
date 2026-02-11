import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Heart, Coins, Timer, ShieldCheck, AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScoringMethodology() {
  return (
    <div className="space-y-8">
      {/* Grant-Ready Header */}
      <Card className="card-premium border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg uppercase tracking-wider">
              Scoring Methodology — Single Source of Truth
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Resilience uses a <strong className="text-foreground">weighted dimensional scoring model</strong> that 
            is simple, transparent, and auditable. Every project receives a single score (0–100) derived from 
            four measurable dimensions, modified by a continuity decay penalty for inactive projects.
          </p>

          {/* The Formula — Hero Display */}
          <div className="rounded-sm border-2 border-primary/30 bg-background px-6 py-5 mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              UNIFIED RESILIENCE SCORE
            </p>
            <code className="block font-mono text-xl md:text-2xl text-primary font-bold leading-relaxed">
              R = (0.40 × G + 0.25 × D + 0.20 × Gov + 0.15 × T) × Continuity
            </code>
          </div>

          {/* Dimension Key */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <DimensionChip icon={Brain} label="G — GitHub" weight="40%" color="text-primary" />
            <DimensionChip icon={Zap} label="D — Dependencies" weight="25%" color="text-amber-500" />
            <DimensionChip icon={Heart} label="Gov — Governance" weight="20%" color="text-purple-500" />
            <DimensionChip icon={Coins} label="T — Economic" weight="15%" color="text-blue-500" />
          </div>

          <div className="rounded-sm bg-muted/30 border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each dimension produces an independent sub-score (0–100). The weighted average forms the{' '}
              <strong className="text-foreground">base score</strong>. The{' '}
              <strong className="text-foreground">Continuity modifier</strong> then applies an exponential 
              decay penalty based on days since last commit, ensuring projects must{' '}
              <em>continuously</em> maintain code to preserve their score.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Continuity Decay Deep-Dive */}
      <Card className="card-premium">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <CardTitle className="font-display text-lg uppercase tracking-wider">
              Continuity Decay — The Maintenance Penalty
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Projects that stop shipping code receive an exponential decay penalty. This ensures the 
            Resilience Score reflects <strong className="text-foreground">current maintenance effort</strong>, 
            not historical reputation.
          </p>

          <div className="rounded-sm border border-border bg-muted/50 px-4 py-3 mb-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              CONTINUITY MODIFIER
            </p>
            <code className="font-mono text-lg text-primary">
              Continuity = e<sup>−0.00167 × days_inactive</sup>
            </code>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <DecayExample days={30} penalty="4.9%" remaining="95.1%" severity="low" />
            <DecayExample days={90} penalty="13.9%" remaining="86.1%" severity="medium" />
            <DecayExample days={180} penalty="25.9%" remaining="74.1%" severity="high" />
            <DecayExample days={365} penalty="45.4%" remaining="54.6%" severity="critical" />
          </div>

          <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-destructive flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Why this matters:
              </strong>
              A project with a perfect base score of 85 that goes inactive for 6 months drops to{' '}
              <strong className="text-foreground">63</strong>. After a full year of inactivity, it drops to{' '}
              <strong className="text-foreground">46</strong> — regardless of historical performance. 
              Only resumed commits can stop the decay.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auditability & Anti-Gaming */}
      <Card className="card-premium">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg uppercase tracking-wider">
              Auditability & Anti-Gaming
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The scoring model is designed to be <strong className="text-foreground">fully auditable</strong>. 
            Any builder can calculate their expected score by inspecting their own activity across the four dimensions.
          </p>

          <div className="space-y-3">
            <AuditRow
              label="Transparent Breakdown"
              description="Every project's score page shows the exact contribution of each dimension and the continuity penalty."
            />
            <AuditRow
              label="Anti-Gaming Weights"
              description="Pull Requests (2.5×), Releases (10×), Issues (0.5×). Fork repos receive 0.3× penalty. Daily events capped at 10."
            />
            <AuditRow
              label="Minimum Contributor Threshold"
              description="Requires 3+ unique contributors for ACTIVE liveness status — single-dev commit spam is insufficient."
            />
            <AuditRow
              label="Score History"
              description="Historical snapshots stored in the database enable trend analysis and prevent score manipulation."
            />
            <AuditRow
              label="Data Provenance"
              description="All metrics labeled with source (GitHub API, Crates.io, Solana RPC, DeFiLlama) and last-synced timestamps."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Sub-components ── */

function DimensionChip({
  icon: Icon,
  label,
  weight,
  color,
}: {
  icon: React.ElementType;
  label: string;
  weight: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-card/60 px-3 py-2">
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{label}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{weight}</p>
      </div>
    </div>
  );
}

function DecayExample({
  days,
  penalty,
  remaining,
  severity,
}: {
  days: number;
  penalty: string;
  remaining: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) {
  const colors = {
    low: 'border-chart-4/30 bg-chart-4/5',
    medium: 'border-amber-500/30 bg-amber-500/5',
    high: 'border-destructive/30 bg-destructive/5',
    critical: 'border-destructive/50 bg-destructive/10',
  };

  return (
    <div className={cn('rounded-sm border p-3', colors[severity])}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-muted-foreground">{days} days inactive</span>
        <Timer className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className="text-sm text-foreground">
        <span className="text-destructive font-semibold">−{penalty}</span>
        <span className="text-muted-foreground"> · {remaining} retained</span>
      </p>
    </div>
  );
}

function AuditRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-border bg-background/50 p-3">
      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
