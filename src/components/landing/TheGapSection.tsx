import { XCircle, CheckCircle2 } from 'lucide-react';
import decayVisual from '@/assets/landing/decay-visual.png';
import signalVisual from '@/assets/landing/signal-visual.png';

const painPoints = [
  'No way to tell if a project is actively maintained',
  'Forks look identical to originals on-chain',
  'Due diligence is manual, slow, and doesn\'t scale',
  'Governance and dependency health are invisible',
];

const solutions = [
  'Continuous development health scoring, updated in real-time',
  'Bytecode fingerprinting verifies originality across the ecosystem',
  'Adaptive scoring adjusts to each project type automatically',
  'Supply chain intelligence maps risk across dependencies',
];

export function TheGapSection() {
  return (
    <section className="border-t border-border bg-background py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            THE MAINTENANCE VISIBILITY GAP
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Solana makes it incredibly easy to ship. What's still hard is knowing what's actually being maintained.
          </p>
        </div>

        {/* Two-Panel Comparison */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Without Resilience Panel */}
          <div className="relative overflow-hidden rounded-sm border border-destructive/20 bg-destructive/5 p-8">
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-destructive">
                WITHOUT RESILIENCE
              </h3>
              <p className="text-sm text-muted-foreground">The status quo in the Solana ecosystem</p>
            </div>

            {/* Decay Image */}
            <div className="mx-auto mb-8 flex justify-center">
              <img
                src={decayVisual}
                alt="Crumbling infrastructure representing unmaintained projects"
                className="h-48 w-48 rounded-sm object-cover opacity-80"
              />
            </div>

            {/* Pain Points */}
            <ul className="space-y-3">
              {painPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <span className="text-sm text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Resilience Panel */}
          <div className="relative overflow-hidden rounded-sm border border-primary/30 bg-card p-8 shadow-[0_0_30px_hsl(174_100%_38%_/_0.08)]">
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-primary">
                WITH RESILIENCE
              </h3>
              <p className="text-sm text-muted-foreground">What the ecosystem unlocks</p>
            </div>

            {/* Signal Image */}
            <div className="mx-auto mb-8 flex justify-center">
              <img
                src={signalVisual}
                alt="Healthy glowing infrastructure representing verified projects"
                className="h-48 w-48 rounded-sm object-cover"
              />
            </div>

            {/* Solutions */}
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
