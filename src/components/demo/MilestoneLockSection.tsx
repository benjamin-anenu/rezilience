import { StorySection } from './StorySection';
import { Badge } from '@/components/ui/badge';
import { Lock, Clock, CheckCircle2, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const milestones = [
  { phase: 'Phase 1', title: 'MVP Launch', sol: 500, status: 'Released', icon: CheckCircle2, color: 'text-primary', badgeClass: 'bg-primary/10 text-primary border-primary/30' },
  { phase: 'Phase 2', title: 'Security Audit', sol: 300, status: 'Pending', icon: Clock, color: 'text-amber-500', badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  { phase: 'Phase 3', title: 'Mainnet Deploy', sol: 400, status: 'Locked', icon: Lock, color: 'text-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border' },
  { phase: 'Phase 4', title: 'Growth & Maintenance', sol: 300, status: 'Locked', icon: Lock, color: 'text-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border' },
];

export function MilestoneLockSection() {
  return (
    <StorySection>
      <div className="flex items-center gap-3 mb-2">
        <Target className="h-5 w-5 text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-primary">On-Chain Commitments</p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Lock Your Milestones
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Define what you'll deliver — each milestone becomes an on-chain commitment as a governance proposal on your Realm.
      </p>

      <div className="max-w-lg mx-auto">
        {milestones.map((m, i) => (
          <motion.div
            key={m.phase}
            className="relative flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              {i < milestones.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{m.phase}</p>
                  <p className="font-semibold text-foreground">{m.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">{m.sol} SOL</span>
                  <Badge variant="outline" className={`text-[10px] font-mono ${m.badgeClass}`}>
                    {m.status}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Total */}
        <motion.div
          className="border-t border-border pt-4 mt-2 flex justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total Commitment</p>
          <p className="font-mono text-lg font-bold text-primary">1,500 SOL</p>
        </motion.div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto">
        Milestones are created as governance proposals on your Realm — <span className="text-primary font-semibold">publicly visible, on-chain, immutable</span>.
      </p>
    </StorySection>
  );
}
