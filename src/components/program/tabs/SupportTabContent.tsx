import { Link } from 'react-router-dom';
import { Shield, Lock, Heart, HelpCircle, ChevronRight, TrendingUp, Clock, Coins } from 'lucide-react';
import { UnclaimedBanner } from '../UnclaimedBanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Program } from '@/types';

interface SupportTabContentProps {
  program: Program;
  isVerified?: boolean;
  claimStatus?: string;
}

export function SupportTabContent({ program, isVerified, claimStatus }: SupportTabContentProps) {
  const isUnclaimed = claimStatus === 'unclaimed';
  const trustMetrics = [
    {
      icon: Shield,
      title: 'STAKED ASSURANCE',
      subtitle: `${(program.stakedAmount / 1000).toFixed(0)}K SOL Staked`,
      value: Math.min((program.stakedAmount / 300000) * 100, 100),
      description: 'Economic security layer providing stake-backed guarantees.',
      isPositive: program.stakedAmount > 100000,
    },
    {
      icon: Lock,
      title: 'ADMIN CONSTRAINTS',
      subtitle: 'Multisig Required',
      value: 85,
      description: 'Upgrade authority is controlled by a 3/5 multisig wallet.',
      isPositive: true,
    },
  ];

  const stakingBenefits = [
    {
      icon: TrendingUp,
      title: 'Yield Earning',
      description: 'Earn competitive APY on your staked SOL',
    },
    {
      icon: Shield,
      title: 'Protocol Security',
      description: 'Your stake helps secure and validate the protocol',
    },
    {
      icon: Clock,
      title: 'Flexible Lock Periods',
      description: 'Choose from 6 months to 2 year lock periods',
    },
    {
      icon: Coins,
      title: 'Governance Rights',
      description: 'Participate in protocol decisions as a staker',
    },
  ];

  const faqItems = [
    {
      question: 'How does staking work?',
      answer:
        'When you stake SOL on a protocol, your tokens are locked for a chosen period (6 months to 2 years). During this time, you earn yield based on the protocol\'s performance and activity.',
    },
    {
      question: 'What happens if the protocol fails?',
      answer:
        'Your staked tokens serve as an economic security layer. If issues arise, the stake may be slashed proportionally. This incentivizes protocols to maintain high quality and security standards.',
    },
    {
      question: 'Can I unstake early?',
      answer:
        'Early unstaking is possible but may incur penalties depending on the remaining lock period. The penalty structure is designed to ensure long-term protocol stability.',
    },
    {
      question: 'How is yield calculated?',
      answer:
        'Yield is calculated based on the protocol\'s Rezilience Score, total staked amount, and network activity. Higher-scoring protocols typically offer better returns.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Unclaimed Banner */}
      {isUnclaimed && (
        <UnclaimedBanner reason="Claim this project to unlock staking, build economic security, and let supporters back your protocol with confidence." />
      )}

      {/* Hero Stake CTA Card */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 opacity-50" />
        
        {/* Refined glow effect */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

        <CardContent className="relative py-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
              Support This Project
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Stake your SOL to show confidence in {program.name} and earn yield while helping
              secure the protocol.
            </p>

            {/* Quick Stats */}
            <div className="mt-6 flex items-center gap-6 text-center">
              <div>
                <p className="font-mono text-2xl font-bold text-primary">
                  {(program.stakedAmount / 1000).toFixed(0)}K
                </p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">SOL Staked</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">{program.score}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Rezilience Score
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="font-mono text-2xl font-bold text-foreground">8.5%</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Est. APY</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              asChild
              size="lg"
              className="mt-6 gap-2 font-display text-lg uppercase tracking-wider"
            >
              <Link to={`/staking?program=${program.programId}`}>
                <Heart className="h-5 w-5" />
                Stake Now
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {trustMetrics.map((metric, index) => (
          <Card 
            key={metric.title} 
            className="card-premium card-lift border-border bg-card animate-card-enter"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-sm uppercase tracking-tight">
                    {metric.title}
                  </CardTitle>
                  <CardDescription
                    className={metric.isPositive ? 'text-primary' : 'text-muted-foreground'}
                  >
                    {metric.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Progress value={metric.value} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staking Benefits */}
      <Card className="card-premium card-lift border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Why Stake?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {stakingBenefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 rounded-sm border border-border bg-muted/30 p-4 transition-all hover:border-primary/20 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-medium text-foreground">
                    {benefit.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <Card className="card-premium border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="h-4 w-4 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left text-sm font-medium hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
