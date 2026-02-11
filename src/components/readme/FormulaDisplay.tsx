import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormulaDisplayProps {
  title: string;
  formula: string;
  variables?: { symbol: string; description: string }[];
  examples?: { input: string; output: string }[];
  className?: string;
}

export function FormulaDisplay({
  title,
  formula,
  variables,
  examples,
  className,
}: FormulaDisplayProps) {
  return (
    <Card className={cn('card-premium', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main formula */}
        <div className="rounded-sm bg-muted/50 border border-border px-4 py-3 mb-4">
          <code className="font-mono text-lg text-primary">{formula}</code>
        </div>

        {/* Variables explanation */}
        {variables && variables.length > 0 && (
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
              WHERE:
            </p>
            <div className="space-y-1">
              {variables.map(({ symbol, description }) => (
                <div key={symbol} className="flex items-start gap-2">
                  <code className="font-mono text-sm text-primary shrink-0">{symbol}</code>
                  <span className="text-sm text-muted-foreground">= {description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {examples && examples.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
              EXAMPLES:
            </p>
            <div className="space-y-1">
              {examples.map(({ input, output }, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{input}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-foreground">{output}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegratedScoreFormula() {
  return (
    <FormulaDisplay
      title="Unified Resilience Score"
      formula="R = (0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL) × Continuity"
      variables={[
        { symbol: 'R', description: 'Final Resilience Score (0-100)' },
        { symbol: 'GitHub', description: 'Code activity component (40% weight)' },
        { symbol: 'Deps', description: 'Dependency health component (25% weight)' },
        { symbol: 'Gov', description: 'Governance activity component (20% weight)' },
        { symbol: 'TVL', description: 'Economic health component (15% weight)' },
        { symbol: 'Continuity', description: 'e^(−0.00167 × days_inactive) — decay penalty for inactivity' },
      ]}
    />
  );
}

export function DecayFormula() {
  return (
    <FormulaDisplay
      title="Decay Rate Calculation"
      formula="Decay = (1 - e^(-λ × days)) × 100%"
      variables={[
        { symbol: 'λ', description: '0.00167/day (≈ 0.05/month)' },
        { symbol: 'days', description: 'Days since last commit' },
        { symbol: 'e', description: "Euler's number (~2.718)" },
      ]}
      examples={[
        { input: '30 days inactive', output: '4.9% decay' },
        { input: '90 days inactive', output: '13.9% decay' },
        { input: '180 days inactive', output: '25.9% decay' },
        { input: '365 days inactive', output: '45.4% decay' },
      ]}
    />
  );
}

interface DimensionBreakdownProps {
  className?: string;
}

export function DimensionBreakdown({ className }: DimensionBreakdownProps) {
  const dimensions = [
    {
      name: 'GitHub Activity',
      weight: '40%',
      color: 'bg-primary',
      metrics: [
        'Commits in last 30 days',
        'Unique contributors',
        'Pull request velocity',
        'Issue resolution rate',
        'Release frequency',
      ],
      scoring: 'Based on anti-gaming weighted events: PRs (2.5x), Releases (10x), Issues (0.5x)',
    },
    {
      name: 'Dependency Health',
      weight: '25%',
      color: 'bg-amber-500',
      metrics: [
        'Outdated crate count',
        'Critical vulnerability count',
        'Maintenance lag (days)',
        'Direct vs transitive deps',
      ],
      scoring: 'Parsed from Cargo.toml, compared against crates.io registry',
    },
    {
      name: 'Governance',
      weight: '20%',
      color: 'bg-purple-500',
      metrics: [
        'Multisig/DAO transactions (30d)',
        'Proposal activity',
        'Signature threshold',
        'Last governance action',
      ],
      scoring: 'Fetched via Solana RPC for Squads/Realms addresses',
    },
    {
      name: 'TVL/Economic',
      weight: '15%',
      color: 'bg-blue-500',
      metrics: [
        'Total Value Locked (USD)',
        'Market share in category',
        'Risk ratio (TVL/commits)',
        'Economic responsibility',
      ],
      scoring: 'DeFi protocols only, via DeFiLlama API integration',
    },
  ];

  return (
    <Card className={cn('card-premium', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg uppercase tracking-wider">
          Four Dimensions Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {dimensions.map(({ name, weight, color, metrics, scoring }) => (
            <div key={name} className="border-l-2 border-border pl-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('h-3 w-3 rounded-full', color)} />
                <span className="font-display text-sm uppercase tracking-wider text-foreground">
                  {name}
                </span>
                <span className="font-mono text-sm text-primary">{weight}</span>
              </div>
              <ul className="space-y-1 mb-2">
                {metrics.map((metric) => (
                  <li key={metric} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    {metric}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground italic">{scoring}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
