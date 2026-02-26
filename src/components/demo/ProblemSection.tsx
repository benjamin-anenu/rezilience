import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Ghost, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const painPoints = [
  {
    icon: AlertTriangle,
    title: 'No Execution Tracking',
    desc: 'DAOs approve funding proposals but nobody tracks whether milestones are actually delivered.',
  },
  {
    icon: Ghost,
    title: 'Ghost Projects',
    desc: 'Abandoned projects keep governance tokens and DAO allocations but deliver nothing in return.',
  },
  {
    icon: EyeOff,
    title: 'Zero Public Verification',
    desc: 'The community has no standardized way to verify if funded milestones were completed.',
  },
];

export function ProblemSection() {
  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">The Problem</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        DAO Funding Is a Black Box
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Hundreds of proposals approved across Solana DAOs — how many actually shipped?
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {painPoints.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
          >
            <Card className="h-full border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <p.icon className="h-8 w-8 text-destructive mb-4" />
                <h3 className="font-display text-sm uppercase tracking-wider text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </StorySection>
  );
}
