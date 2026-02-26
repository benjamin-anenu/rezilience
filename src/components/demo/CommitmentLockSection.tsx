import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const tiers = [
  { label: '≥ 70% Delivery', modifier: '+10', desc: 'Governance bonus applied', color: 'text-primary', border: 'border-primary/30 bg-primary/5', icon: TrendingUp },
  { label: '40–70% Delivery', modifier: '±0', desc: 'No modifier applied', color: 'text-amber-500', border: 'border-amber-500/30 bg-amber-500/5', icon: Minus },
  { label: '< 40% Delivery', modifier: '-15', desc: 'Governance penalty applied', color: 'text-destructive', border: 'border-destructive/30 bg-destructive/5', icon: TrendingDown },
];

export function CommitmentLockSection() {
  return (
    <StorySection>
      <div className="flex items-center gap-3 mb-2">
        <Lock className="h-5 w-5 text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-primary">The Commitment Lock</p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Your DAO Record Shapes Your Score
      </h2>
      <p className="text-muted-foreground max-w-xl mb-8">
        The Rezilience Score formula incorporates your Realms delivery rate directly into the governance dimension.
      </p>

      {/* Formula */}
      <Card className="mb-8 border-border bg-card">
        <CardContent className="pt-6">
          <p className="font-mono text-sm text-muted-foreground mb-1">Rezilience Score Formula</p>
          <p className="font-mono text-lg md:text-xl text-foreground">
            R = (<span className="text-primary">GitHub × 40%</span>) + (Deps × 25%) + (<span className="text-primary">Gov × 20%</span>) + (TVL × 15%)
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            The <span className="text-primary">Gov</span> dimension receives a Realms modifier based on delivery rate ↓
          </p>
        </CardContent>
      </Card>

      {/* Modifier tiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Card className={`h-full ${tier.border}`}>
              <CardContent className="pt-6 text-center">
                <tier.icon className={`h-6 w-6 mx-auto mb-2 ${tier.color}`} />
                <p className={`font-mono text-3xl font-bold ${tier.color}`}>{tier.modifier}</p>
                <p className="text-sm font-semibold text-foreground mt-2">{tier.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto">
        This is the <span className="text-primary font-semibold">Commitment Lock</span>. Your DAO's execution record directly impacts your Rezilience Score — creating a public, on-chain incentive to deliver.
      </p>
    </StorySection>
  );
}
