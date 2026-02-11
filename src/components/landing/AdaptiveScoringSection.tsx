import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const weightProfiles = [
  {
    label: 'Full Stack',
    subtitle: 'DeFi + DAO',
    weights: { github: 40, deps: 25, gov: 20, tvl: 15 },
    accent: 'border-primary/50',
  },
  {
    label: 'DeFi',
    subtitle: 'No governance',
    weights: { github: 50, deps: 30, gov: null, tvl: 20 },
    accent: 'border-chart-2/50',
  },
  {
    label: 'Infrastructure',
    subtitle: 'Tools & SDKs',
    weights: { github: 60, deps: 40, gov: null, tvl: null },
    accent: 'border-muted-foreground/50',
  },
];

export function AdaptiveScoringSection() {
  return (
    <section className="border-t border-border bg-card/30 py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            SCORING THAT ADAPTS
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Every Solana project is different. Our formula knows that.
          </p>
        </div>

        {/* Formula Display */}
        <div className="mx-auto mb-12 max-w-3xl rounded-sm border border-border bg-card p-6 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Adaptive Resilience Formula
          </p>
          <p className="font-mono text-lg text-foreground md:text-xl">
            <span className="text-primary">R</span> = (
            <span className="text-primary">w</span>
            <sub className="text-xs">G</sub> × GitHub +{' '}
            <span className="text-primary">w</span>
            <sub className="text-xs">D</sub> × Deps +{' '}
            <span className="text-primary">w</span>
            <sub className="text-xs">Gov</sub> × Gov +{' '}
            <span className="text-primary">w</span>
            <sub className="text-xs">TVL</sub> × TVL) × Continuity
          </p>
          <p className="mt-3 text-sm italic text-muted-foreground">
            Weights adapt to project category — no project is penalized for dimensions that don't apply.
          </p>
        </div>

        {/* Weight Profile Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {weightProfiles.map((profile) => (
            <div
              key={profile.label}
              className={`rounded-sm border ${profile.accent} bg-card p-6 transition-all hover:border-primary/50`}
            >
              <div className="mb-4">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                  {profile.label}
                </h3>
                <p className="font-mono text-xs uppercase text-muted-foreground">{profile.subtitle}</p>
              </div>

              <div className="space-y-3">
                {(['github', 'deps', 'gov', 'tvl'] as const).map((dim) => {
                  const value = profile.weights[dim];
                  const labels: Record<string, string> = {
                    github: 'GitHub',
                    deps: 'Dependencies',
                    gov: 'Governance',
                    tvl: 'TVL',
                  };
                  return (
                    <div key={dim} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{labels[dim]}</span>
                      {value !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(value / 60) * 100}%` }}
                            />
                          </div>
                          <span className="w-10 text-right font-mono text-sm font-bold text-foreground">
                            {value}%
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground/50">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Link */}
        <div className="mt-10 text-center">
          <Link
            to="/readme"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            See Full Methodology
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
