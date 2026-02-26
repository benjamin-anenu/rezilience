import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, FileText, ShieldCheck, GitBranch, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: Twitter, num: '01', title: 'Sign in with X', desc: 'Builder authenticates identity via X (Twitter) OAuth' },
  { icon: FileText, num: '02', title: 'Submit Project Identity', desc: 'Name, Program ID, GitHub repo, and Realms DAO address', highlight: true },
  { icon: ShieldCheck, num: '03', title: 'Verify Authority', desc: 'SIWS wallet proof or Squads multisig verification' },
  { icon: GitBranch, num: '04', title: 'GitHub Analysis', desc: 'Automated code health scoring: commits, contributors, velocity' },
  { icon: Globe, num: '05', title: 'Live on Registry', desc: 'Project appears in explorer with a live Rezilience Score' },
];

export function RegistryPipelineSection() {
  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">The Solution</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Join the Rezilience Registry
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        A 5-step onboarding flow that links your project to its DAO funding source.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
          >
            <Card className={`h-full ${step.highlight ? 'border-primary/50 bg-primary/5' : 'border-border bg-card/40'}`}>
              <CardContent className="pt-5 pb-5">
                <span className="font-mono text-2xl font-bold text-primary/20">{step.num}</span>
                <div className="mt-2 flex items-center gap-2">
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">{step.title}</h3>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{step.desc}</p>
                {step.highlight && (
                  <Badge variant="outline" className="mt-3 border-primary/40 text-primary font-mono text-[10px]">
                    Realms DAO Address linked here
                  </Badge>
                )}
              </CardContent>
            </Card>
            {i < steps.length - 1 && (
              <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 hidden md:block" />
            )}
          </motion.div>
        ))}
      </div>
    </StorySection>
  );
}
