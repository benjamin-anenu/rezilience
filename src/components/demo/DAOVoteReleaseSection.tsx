import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, FileCheck, Vote, KeyRound, Coins, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const flowSteps = [
  { icon: Rocket, label: 'Builder ships milestone' },
  { icon: FileCheck, label: 'Submits delivery evidence' },
  { icon: Vote, label: 'Token holders vote' },
  { icon: KeyRound, label: 'Multisig signs release' },
  { icon: Coins, label: 'SOL released to builder' },
];

export function DAOVoteReleaseSection() {
  return (
    <StorySection>
      <div className="flex items-center gap-3 mb-2">
        <Vote className="h-5 w-5 text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Trustless Release</p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        DAO Votes. Funds Release.
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        When you deliver a milestone, your community decides if you've earned the next tranche.
      </p>

      {/* Horizontal flow */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0 mb-12">
        {flowSteps.map((step, i) => (
          <motion.div
            key={step.label}
            className="flex items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="flex flex-col items-center text-center w-28">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center mb-2">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{step.label}</p>
            </div>
            {i < flowSteps.length - 1 && (
              <div className="hidden md:block w-8 h-px bg-primary/30 -mt-6" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Outcome cards */}
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="border-primary/30 bg-primary/5 h-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-bold text-primary text-sm uppercase tracking-wider mb-2">Approved</p>
              <p className="text-sm text-muted-foreground">
                Funds released. Builder proceeds to the next phase.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="border-destructive/30 bg-destructive/5 h-full">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <p className="font-bold text-destructive text-sm uppercase tracking-wider mb-2">Rejected</p>
              <p className="text-sm text-muted-foreground">
                Funds stay locked. Builder must re-deliver or renegotiate.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 max-w-md mx-auto">
        No delivery, no release. This is <span className="text-primary font-semibold">trustless accountability</span>.
      </p>
    </StorySection>
  );
}
