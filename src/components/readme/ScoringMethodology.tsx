import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Heart, Coins, Timer, ShieldCheck, AlertTriangle, TrendingDown, Layers } from 'lucide-react';
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
            Resilience uses a <strong className="text-foreground">weighted dimensional scoring model</strong> with{' '}
            <strong className="text-foreground">adaptive weights</strong> that adjust based on project type. 
            Every project receives a single score (0–100) derived from applicable dimensions, modified by a 
            continuity decay penalty for inactive projects.
          </p>

          {/* The Formula — Hero Display */}
          <div className="rounded-sm border-2 border-primary/30 bg-background px-6 py-5 mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              UNIFIED RESILIENCE SCORE
            </p>
            <code className="block font-mono text-xl md:text-2xl text-primary font-bold leading-relaxed">
              R = (w<sub>G</sub>×G + w<sub>D</sub>×D + w<sub>Gov</sub>×Gov + w<sub>T</sub>×T) × Continuity
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              Weights (w) adapt per project — inapplicable dimensions receive 0 weight and their share is redistributed.
            </p>
          </div>

          {/* Dimension Key */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <DimensionChip icon={Brain} label="G — GitHub" weight="40–60%" color="text-primary" />
            <DimensionChip icon={Zap} label="D — Dependencies" weight="25–40%" color="text-amber-500" />
            <DimensionChip icon={Heart} label="Gov — Governance" weight="0–25%" color="text-purple-500" />
            <DimensionChip icon={Coins} label="T — Economic" weight="0–20%" color="text-blue-500" />
          </div>

          <div className="rounded-sm bg-muted/30 border border-border p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each dimension produces an independent sub-score (0–100). The{' '}
              <strong className="text-foreground">adaptive weighted average</strong> forms the base score — 
              only dimensions relevant to the project type are included. The{' '}
              <strong className="text-foreground">Continuity modifier</strong> then applies an exponential 
              decay penalty based on days since last commit.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Adaptive Weights */}
      <AdaptiveWeightsCard />

      {/* Continuity Decay */}
      <ContinuityDecayCard />

      {/* Auditability */}
      <AuditabilityCard />
    </div>
  );
}

/* ── Adaptive Weights Card ── */

function AdaptiveWeightsCard() {
  const rows = [
    { category: 'DeFi + DAO/Multisig', github: '40%', deps: '25%', gov: '20%', tvl: '15%', note: 'Full formula' },
    { category: 'DeFi (no governance)', github: '50%', deps: '30%', gov: '—', tvl: '20%', note: 'Gov redistributed' },
    { category: 'DAO/Governance (no TVL)', github: '45%', deps: '30%', gov: '25%', tvl: '—', note: 'TVL redistributed' },
    { category: 'Everything else', github: '60%', deps: '40%', gov: '—', tvl: '—', note: 'Both redistributed' },
  ];

  return (
    <Card className="card-premium">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle className="font-display text-lg uppercase tracking-wider">
            Adaptive Weights — Fair Scoring by Category
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Not every dimension applies to every project. Infrastructure tools don't have TVL. 
          Non-DAO projects don't have governance. Instead of penalizing them with a 0, we{' '}
          <strong className="text-foreground">redistribute the weight</strong> to dimensions that matter.
        </p>

        <div className="overflow-x-auto mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-xs uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="py-2 px-2 text-center text-xs uppercase tracking-wider text-muted-foreground">GitHub</th>
                <th className="py-2 px-2 text-center text-xs uppercase tracking-wider text-muted-foreground">Deps</th>
                <th className="py-2 px-2 text-center text-xs uppercase tracking-wider text-muted-foreground">Gov</th>
                <th className="py-2 px-2 text-center text-xs uppercase tracking-wider text-muted-foreground">TVL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium text-foreground">{r.category}</td>
                  <td className="py-2 px-2 text-center font-mono text-primary">{r.github}</td>
                  <td className="py-2 px-2 text-center font-mono text-amber-500">{r.deps}</td>
                  <td className={cn("py-2 px-2 text-center font-mono", r.gov === '—' ? 'text-muted-foreground/40' : 'text-purple-500')}>{r.gov}</td>
                  <td className={cn("py-2 px-2 text-center font-mono", r.tvl === '—' ? 'text-muted-foreground/40' : 'text-blue-500')}>{r.tvl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-sm bg-muted/30 border border-border p-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Detection logic:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li><strong className="text-foreground">Governance applies</strong> if the project has a multisig address, or category contains "dao" or "governance"</li>
            <li><strong className="text-foreground">TVL applies</strong> if the category contains "defi" (case-insensitive, matches "DeFi/Lending", "DePIN/DeFi", etc.)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Continuity Decay Card ── */

function ContinuityDecayCard() {
  return (
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
          Projects that stop shipping code receive an exponential decay penalty, ensuring the 
          score reflects <strong className="text-foreground">current maintenance effort</strong>.
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
            <strong className="text-foreground">63</strong>. After a full year, it drops to{' '}
            <strong className="text-foreground">46</strong>. Only resumed commits can stop the decay.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Auditability Card ── */

function AuditabilityCard() {
  return (
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
          The scoring model is <strong className="text-foreground">fully auditable</strong>. 
          Every project's breakdown shows the actual weights used and which dimensions apply.
        </p>

        <div className="space-y-3">
          <AuditRow label="Transparent Breakdown" description="Every score page shows the exact contribution of each dimension, the weights used, and the continuity penalty." />
          <AuditRow label="Adaptive Weights Visible" description="The tooltip displays actual weights (e.g., 'GitHub 60%' for infra projects) so builders understand their score." />
          <AuditRow label="Anti-Gaming Weights" description="Pull Requests (2.5×), Releases (10×), Issues (0.5×). Fork repos receive 0.3× penalty. Daily events capped at 10." />
          <AuditRow label="Minimum Contributor Threshold" description="Requires 3+ unique contributors for ACTIVE liveness status." />
          <AuditRow label="Score History" description="Historical snapshots stored in the database enable trend analysis and prevent score manipulation." />
          <AuditRow label="Data Provenance" description="All metrics labeled with source (GitHub API, Crates.io, Solana RPC, DeFiLlama) and last-synced timestamps." />
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Sub-components ── */

function DimensionChip({
  icon: Icon, label, weight, color,
}: { icon: React.ElementType; label: string; weight: string; color: string }) {
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
  days, penalty, remaining, severity,
}: { days: number; penalty: string; remaining: string; severity: 'low' | 'medium' | 'high' | 'critical' }) {
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
