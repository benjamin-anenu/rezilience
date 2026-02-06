import { Fingerprint, Shield, Lock, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Program } from '@/types';

interface MetricCardsProps {
  program: Program;
  githubIsFork?: boolean;
}

export function MetricCards({ program, githubIsFork }: MetricCardsProps) {
  // Get GitHub originality status and styling
  const getGithubOriginalityInfo = () => {
    if (githubIsFork === undefined) {
      return {
        subtitle: 'Not Analyzed',
        value: 50,
        isPositive: false,
        isWarning: false,
      };
    }
    if (githubIsFork) {
      return {
        subtitle: 'Forked Repository',
        value: 30,
        isPositive: false,
        isWarning: true,
      };
    }
    return {
      subtitle: 'Original Repository',
      value: 100,
      isPositive: true,
      isWarning: false,
    };
  };

  const githubOriginality = getGithubOriginalityInfo();

  const metrics = [
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: program.originalityStatus === 'verified' ? 'Verified Original' : program.originalityStatus === 'fork' ? 'Known Fork' : 'Unverified',
      value: program.originalityStatus === 'verified' ? 100 : program.originalityStatus === 'fork' ? 45 : 60,
      description: 'Cryptographic fingerprint comparison against known program database.',
      isPositive: program.originalityStatus === 'verified',
      isWarning: false,
    },
    {
      icon: GitBranch,
      title: 'GITHUB ORIGINALITY',
      subtitle: githubOriginality.subtitle,
      value: githubOriginality.value,
      description: 'Source code provenance verification via GitHub metadata.',
      isPositive: githubOriginality.isPositive,
      isWarning: githubOriginality.isWarning,
    },
    {
      icon: Shield,
      title: 'STAKED ASSURANCE',
      subtitle: `${(program.stakedAmount / 1000).toFixed(0)}K SOL Staked`,
      value: Math.min((program.stakedAmount / 300000) * 100, 100),
      description: 'Economic security layer providing stake-backed guarantees.',
      isPositive: program.stakedAmount > 100000,
      isWarning: false,
    },
    {
      icon: Lock,
      title: 'ADMIN CONSTRAINTS',
      subtitle: 'Multisig Required',
      value: 85,
      description: 'Upgrade authority is controlled by a 3/5 multisig wallet.',
      isPositive: true,
      isWarning: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                <metric.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-sm uppercase tracking-tight">
                  {metric.title}
                </CardTitle>
                <CardDescription className={
                  metric.isWarning 
                    ? 'text-amber-500' 
                    : metric.isPositive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }>
                  {metric.subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Progress 
                value={metric.value} 
                className={`h-2 ${metric.isWarning ? '[&>div]:bg-amber-500' : ''}`} 
              />
            </div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}