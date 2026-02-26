import { motion } from 'framer-motion';
import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommit, Activity, Video, FileText, Shield, ArrowRight } from 'lucide-react';

const evidenceTypes = [
  {
    icon: GitCommit,
    title: 'GitHub Commits',
    description: 'Rezilience scans commit velocity, PR merges, and contributor activity in real time. No commits = no progress.',
  },
  {
    icon: Activity,
    title: 'On-Chain Activity',
    description: 'Program deployments, upgrade authority changes, and transaction volume are tracked directly from the Solana network.',
  },
  {
    icon: Video,
    title: 'Demo Videos',
    description: 'Builders submit video walkthroughs of shipped features. The community can verify with their own eyes.',
  },
  {
    icon: FileText,
    title: 'Build-in-Public Updates',
    description: 'Milestone updates, dev logs, and progress reports are published on the project\'s Rezilience profile for public record.',
  },
  {
    icon: Shield,
    title: 'Dependency Health',
    description: 'Rezilience monitors the project\'s dependency tree for vulnerabilities, outdated packages, and supply chain risks.',
  },
];

const flowSteps = [
  'Builder Claims Milestone',
  'Rezilience Cross-Checks',
  'Delivery Rate Updated',
  'DAO Informed',
];

export function BuilderDeliversSection() {
  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">Verification Layer</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Builder Delivers. Rezilience Verifies.
      </h2>
      <p className="text-muted-foreground max-w-2xl mb-12">
        Every claim of progress is cross-referenced against real signals — code, chain, and community.
      </p>

      {/* Evidence cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
        {evidenceTypes.map((ev, i) => (
          <motion.div
            key={ev.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className="border-border bg-card h-full card-lift">
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <ev.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-sm uppercase tracking-tight text-foreground">{ev.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Evidence flow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="rounded-sm border border-primary/20 bg-primary/5 p-6"
      >
        <p className="font-display text-xs uppercase tracking-wider text-foreground mb-4">Evidence Flow</p>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0 justify-between">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 font-mono text-[10px] text-primary font-bold">
                  {i + 1}
                </span>
                <span className="font-mono text-xs text-foreground whitespace-nowrap">{step}</span>
              </div>
              {i < flowSteps.length - 1 && (
                <ArrowRight className="hidden md:block h-4 w-4 text-primary/40 ml-2" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <p className="text-center font-mono text-xs text-muted-foreground/60 mt-8">
        Rezilience doesn't take your word for it. It verifies against the data.
      </p>
    </StorySection>
  );
}
