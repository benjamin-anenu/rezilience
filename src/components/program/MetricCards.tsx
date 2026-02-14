import { Fingerprint, Shield, Lock, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getBytecodeStatusInfo } from '@/hooks/useBytecodeVerification';
import type { Program } from '@/types';

interface MetricCardsProps {
  program: Program;
  githubIsFork?: boolean;
  bytecodeMatchStatus?: string | null;
  bytecodeConfidence?: string | null;
  githubOAuthVerified?: boolean;
}

export function MetricCards({ program, githubIsFork, bytecodeMatchStatus, bytecodeConfidence, githubOAuthVerified = false }: MetricCardsProps) {
  // Get GitHub originality status and styling
  const getGithubOriginalityInfo = () => {
    if (!githubOAuthVerified) {
      return { subtitle: 'Awaiting Verification', value: 0, isPositive: false, isWarning: false, isUnverified: true };
    }
    if (githubIsFork) {
      return { subtitle: 'Forked Repository', value: 30, isPositive: false, isWarning: true };
    }
    return { subtitle: 'Original Repository', value: 100, isPositive: true, isWarning: false };
  };

  const githubOriginality = getGithubOriginalityInfo();

  // Get bytecode originality - prefer database status with confidence
  const getBytecodeOriginalityInfo = () => {
    if (bytecodeMatchStatus) {
      const info = getBytecodeStatusInfo(bytecodeMatchStatus, bytecodeConfidence);
      return { subtitle: info.label, value: info.value, isPositive: info.isPositive, isWarning: info.isWarning, isNA: info.isNA, isUnverified: (info as any).isUnverified };
    }
    switch (program.originalityStatus) {
      case 'verified':
        return { subtitle: 'Verified Original', value: 100, isPositive: true, isWarning: false, isNA: false, isUnverified: false };
      case 'fork':
        return { subtitle: 'Known Fork', value: 45, isPositive: false, isWarning: true, isNA: false, isUnverified: false };
      case 'not-deployed':
        return { subtitle: 'Not On-Chain', value: 0, isPositive: false, isWarning: false, isNA: true, isUnverified: false };
      default:
        return { subtitle: 'Awaiting Verification', value: 0, isPositive: false, isWarning: false, isNA: false, isUnverified: true };
    }
  };

  const bytecodeOriginality = getBytecodeOriginalityInfo();

  const metrics = [
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: bytecodeOriginality.subtitle,
      value: bytecodeOriginality.value,
      description: 'Cryptographic fingerprint comparison against known program database.',
      isPositive: bytecodeOriginality.isPositive,
      isWarning: bytecodeOriginality.isWarning,
      isNA: bytecodeOriginality.isNA,
      isUnverified: bytecodeOriginality.isUnverified,
    },
    {
      icon: GitBranch,
      title: 'GITHUB ORIGINALITY',
      subtitle: githubOriginality.subtitle,
      value: githubOriginality.value,
      description: 'Source code provenance verification via GitHub metadata.',
      isPositive: githubOriginality.isPositive,
      isWarning: githubOriginality.isWarning,
      isUnverified: githubOriginality.isUnverified,
    },
    {
      icon: Shield,
      title: 'STAKED ASSURANCE',
      subtitle: `${(program.stakedAmount / 1000).toFixed(0)}K SOL Staked`,
      value: Math.min((program.stakedAmount / 300000) * 100, 100),
      description: 'Economic security layer providing stake-backed guarantees.',
      isPositive: program.stakedAmount > 100000,
      isWarning: false,
      isNA: false,
    },
    {
      icon: Lock,
      title: 'ADMIN CONSTRAINTS',
      subtitle: 'Multisig Required',
      value: 85,
      description: 'Upgrade authority is controlled by a 3/5 multisig wallet.',
      isPositive: true,
      isWarning: false,
      isNA: false,
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
                  metric.isUnverified
                    ? 'text-orange-600'
                    : metric.isNA
                    ? 'text-muted-foreground/50'
                    : metric.isWarning 
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
            {!metric.isUnverified ? (
              <div className="mb-2">
                <Progress 
                  value={metric.value} 
                  className={`h-2 ${metric.isWarning ? '[&>div]:bg-amber-500' : ''}`} 
                />
              </div>
            ) : (
              <div className="mb-2 flex items-center gap-1.5 text-[11px] text-orange-600 font-medium">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                Pending
              </div>
            )}
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}