import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, Coins, Vote, Zap, Milestone, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BountyBoard() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('join-bounty-waitlist', {
        body: { email },
      });
      if (error) throw error;
      setIsJoined(true);
      toast.success("You're on the list!", { description: "We'll notify you when the Bounty Board launches." });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Lock,
      title: 'Escrowed SOL Rewards',
      description: 'Funds locked in smart contract escrow until milestones are verified and approved by the DAO.',
    },
    {
      icon: Vote,
      title: 'On-Chain Claim / Submit / Approve',
      description: 'Builders claim bounties, submit evidence, and DAO voters approve — all on-chain via Realms.',
    },
    {
      icon: Zap,
      title: 'Automated Fund Release',
      description: "Once a proposal passes, escrowed SOL is automatically released to the builder's wallet.",
    },
    {
      icon: Milestone,
      title: 'Milestone-Linked Payouts',
      description: 'Bounties tied to roadmap milestones. Complete a milestone, unlock the next tranche.',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Back link */}
          <Link
            to="/accountability"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to DAO Tracker
          </Link>

          {/* Hero */}
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 font-mono text-xs uppercase">
              Phase 2 · Coming Q2 2026
            </Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
              Bounty Board
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Escrowed rewards, on-chain governance, and automated payouts — 
              a trustless incentive layer for Solana builders.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card/50">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Wireframe mockup */}
          <Card className="mb-12 border-dashed border-border bg-muted/10">
            <CardContent className="p-8">
              <div className="text-center">
                <Coins className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  Interactive bounty board preview coming soon
                </p>
                <div className="mx-auto mt-6 grid max-w-lg gap-2">
                  {['Build token-gated access for DAO members', 'Implement staking rewards calculator', 'Create governance proposal template'].map(
                    (item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-sm border border-border/50 bg-card/30 px-4 py-3 text-left"
                      >
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        <span className="flex-1 text-sm text-muted-foreground/60">{item}</span>
                        <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {(i + 1) * 500} SOL
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="mb-2 font-display text-xl font-semibold uppercase tracking-tight text-foreground">
                Join the Waitlist
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Be first to know when the Bounty Board goes live. No spam, just one launch email.
              </p>
              {isJoined ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-display text-sm font-semibold uppercase">You're on the list!</span>
                </div>
              ) : (
                <div className="mx-auto flex max-w-md gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinWaitlist()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleJoinWaitlist}
                    disabled={!email || isSubmitting}
                    className="font-display uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="mr-1.5 h-4 w-4" />
                        Notify Me
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
