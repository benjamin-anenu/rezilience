import { StorySection } from './StorySection';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, ArrowRight, Vote, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const supporters = [
  { name: 'whale.sol', sol: 420, weight: '42%' },
  { name: 'degen_dev.sol', sol: 280, weight: '28%' },
  { name: 'community_fund.sol', sol: 300, weight: '30%' },
];

export function CommunityFundingSection() {
  return (
    <StorySection>
      <div className="flex items-center gap-3 mb-2">
        <Heart className="h-5 w-5 text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Community-Backed</p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        The Community Backs the Build
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Supporters donate SOL to your DAO treasury and earn governance tokens proportional to their contribution — the largest holders get the most voting weight.
      </p>

      {/* Flow diagram */}
      <div className="grid gap-4 md:grid-cols-3 items-center mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <Coins className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-bold text-foreground text-sm uppercase tracking-wider">Fund</p>
              <p className="text-xs text-muted-foreground mt-2">
                Community donates SOL to the DAO treasury
              </p>
              <div className="mt-3 space-y-1">
                <p className="font-mono text-xs text-primary">+420 SOL</p>
                <p className="font-mono text-xs text-primary">+280 SOL</p>
                <p className="font-mono text-xs text-primary">+300 SOL</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ArrowRight className="h-6 w-6 text-primary hidden md:block" />
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SOL in</p>
            <p className="font-mono text-sm font-bold text-primary">→</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gov Tokens out</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="border-border bg-card/40">
            <CardContent className="pt-6 text-center">
              <Vote className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="font-bold text-foreground text-sm uppercase tracking-wider">Vote</p>
              <p className="text-xs text-muted-foreground mt-2">
                Top token holders become voters with weight proportional to contribution
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mini leaderboard */}
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">Top Supporters</p>
        <div className="space-y-2">
          {supporters.map((s, i) => (
            <div key={s.name} className="flex items-center justify-between border border-border rounded-md px-4 py-2 bg-card/40">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary/40 w-4">{i + 1}</span>
                <span className="font-mono text-sm text-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">{s.sol} SOL</span>
                <span className="font-mono text-sm font-bold text-primary">{s.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground mt-8 max-w-md mx-auto">
        Your backers aren't just donors — <span className="text-primary font-semibold">they're your accountability board</span>.
      </p>
    </StorySection>
  );
}
