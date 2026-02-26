import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Settings, Link } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Building,
    title: 'Create a Realm',
    desc: 'Go to realms.today and create your DAO governance space. This is your project\'s on-chain home for proposals and voting.',
    num: '01',
  },
  {
    icon: Settings,
    title: 'Configure Rules',
    desc: 'Set voting thresholds, council members, and treasury parameters. Define how funds are governed.',
    num: '02',
  },
  {
    icon: Link,
    title: 'Link to Rezilience',
    desc: 'Paste your Realm address during the claim flow to connect accountability tracking to your project.',
    num: '03',
  },
];

export function RealmSetupSection() {
  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">Your Governance Home</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Set Up Your Realm
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Every accountable project starts with a governance home on{' '}
        <a href="https://realms.today" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
          realms.today
        </a>
        . Three steps to get started.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
          >
            <Card className="h-full border-border bg-card/40 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <span className="font-mono text-2xl font-bold text-primary/20">{step.num}</span>
                <div className="mt-3 flex items-center gap-2">
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 max-w-md mx-auto">
        Already have a Realm? <span className="text-primary font-semibold">Skip straight to linking it</span> in your Rezilience profile.
      </p>
    </StorySection>
  );
}
