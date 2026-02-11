import { ArrowRight } from 'lucide-react';
import iconIndex from '@/assets/landing/icon-index.png';
import iconVerify from '@/assets/landing/icon-verify.png';
import iconCommit from '@/assets/landing/icon-commit.png';
import iconDetect from '@/assets/landing/icon-detect.png';

const steps = [
  {
    image: iconIndex,
    title: 'INDEX',
    description: 'Multi-dimensional scoring of every Solana project — GitHub, dependencies, governance, and TVL analyzed continuously.',
    forBuilders: 'Your project gets scored automatically.',
    forPublic: 'Transparent health data on every program.',
  },
  {
    image: iconVerify,
    title: 'VERIFY',
    description: 'On-chain authority verification, GitHub ownership proof, bytecode originality and dependency health checks.',
    forBuilders: 'Prove ownership. Earn Verified Titan status.',
    forPublic: 'Know which projects are authentic.',
  },
  {
    image: iconCommit,
    title: 'COMMIT',
    description: 'Economic commitment through staked assurance bonds with public milestone tracking and timeline alerts.',
    forBuilders: 'Stake on your roadmap. Show conviction.',
    forPublic: 'See who has skin in the game.',
  },
  {
    image: iconDetect,
    title: 'DETECT',
    description: 'AEGIS Supply Chain Intelligence — real-time dependency graph mapping, automated CVE detection, and cross-program risk alerts.',
    forBuilders: 'Know your dependency risk before it cascades.',
    forPublic: 'Ecosystem-wide risk visibility.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            THE ASSURANCE PIPELINE
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            A four-step pipeline that transforms raw on-chain and off-chain data into actionable trust metrics.
          </p>
        </div>

        <div className="relative">
          {/* Connection line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-border md:block" />

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="group relative">
                {/* Step card */}
                <div className="flex flex-col items-center text-center">
                  {/* 3D Image */}
                  <div className="relative z-10 mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-sm border border-border bg-card transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_hsl(174_100%_38%_/_0.15)]">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-24 w-24 object-contain"
                    />
                  </div>

                  {/* Step number */}
                  <div className="mb-2 font-mono text-xs text-muted-foreground">
                    STEP {String(index + 1).padStart(2, '0')}
                  </div>

                  <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                    {step.title}
                  </h3>

                  <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>

                  {/* For Builders / For Public */}
                  <div className="mt-auto space-y-1 border-t border-border pt-3">
                    <p className="text-xs text-primary">
                      <span className="font-semibold">For Builders:</span> {step.forBuilders}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">For Public:</span> {step.forPublic}
                    </p>
                  </div>
                </div>

                {/* Arrow (between cards) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-16 hidden md:block">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
