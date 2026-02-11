import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import avatarBuilders from '@/assets/landing/avatar-builders.png';
import avatarInvestors from '@/assets/landing/avatar-investors.png';
import avatarEcosystem from '@/assets/landing/avatar-ecosystem.png';

const useCases = [
  {
    image: avatarBuilders,
    title: 'BUILDERS',
    description:
      'Prove you\'re still building. Claim your profile, track milestones, earn trust across the Solana ecosystem.',
    cta: 'For Builders',
  },
  {
    image: avatarInvestors,
    title: 'INVESTORS & DAOs',
    description:
      'Data-backed due diligence. Score breakdowns, dependency health, governance signals — all in one place.',
    cta: 'For Investors & DAOs',
  },
  {
    image: avatarEcosystem,
    title: 'THE ECOSYSTEM',
    description:
      'A public good. Open data, open source, no gatekeeping. Resilience exists to serve the Solana ecosystem.',
    cta: 'For Everyone',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
            WHO IT'S FOR
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Built for everyone who needs to trust the programs they interact with on Solana.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="group flex flex-col items-center rounded-sm border border-border bg-card p-6 text-center transition-all hover:border-primary/50"
            >
              <img
                src={useCase.image}
                alt={useCase.title}
                className="mb-6 h-32 w-32 rounded-full object-cover"
              />

              <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                {useCase.title}
              </h3>

              <p className="mb-6 flex-1 text-sm text-muted-foreground">{useCase.description}</p>

              <div className="flex items-center gap-2 text-sm text-primary">
                <span className="font-medium">{useCase.cta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-sm border border-primary/30 bg-primary/5 p-8 text-center lg:p-12">
          <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
            READY TO EXPLORE?
          </h3>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Browse the Resilience Explorer to see trust metrics for Solana programs across the ecosystem.
          </p>
          <Button asChild size="lg" className="font-display font-semibold uppercase tracking-wider">
            <Link to="/explorer">
              LAUNCH EXPLORER
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
