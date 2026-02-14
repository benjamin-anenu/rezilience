import { Fingerprint, GitBranch, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PublicGitHubMetrics } from '../PublicGitHubMetrics';
import { AnalyticsCharts } from '../AnalyticsCharts';
import { RecentEvents } from '../RecentEvents';
import { DependencyHealthCard } from '../DependencyHealthCard';
import { GovernanceHealthCard } from '../GovernanceHealthCard';
import { TVLMetricsCard } from '../TVLMetricsCard';
import { VulnerabilityCard } from '../VulnerabilityCard';
import { useBytecodeVerification, getBytecodeStatusInfo } from '@/hooks/useBytecodeVerification';
import { formatDistanceToNow } from 'date-fns';
import type { GitHubAnalytics, Program } from '@/types';

interface DevelopmentTabContentProps {
  projectId: string;
  githubUrl?: string;
  analytics?: GitHubAnalytics;
  program: Program;
  githubIsFork?: boolean;
  bytecodeMatchStatus?: string | null;
  bytecodeVerifiedAt?: string | null;
  bytecodeConfidence?: string | null;
  bytecodeDeploySlot?: number | null;
  programId?: string | null;
  profileId?: string;
  githubOAuthVerified?: boolean;
  // New multi-dimensional scoring props
  dependencyHealthScore?: number;
  dependencyOutdatedCount?: number;
  dependencyCriticalCount?: number;
  dependencyAnalyzedAt?: string | null;
  governanceAddress?: string | null;
  governanceTx30d?: number;
  governanceLastActivity?: string | null;
  governanceAnalyzedAt?: string | null;
  tvlUsd?: number;
  tvlMarketShare?: number;
  tvlRiskRatio?: number;
  tvlAnalyzedAt?: string | null;
  protocolName?: string;
  category?: string;
  // Vulnerability & OpenSSF props
  vulnerabilityCount?: number;
  vulnerabilityDetails?: unknown[] | null;
  vulnerabilityAnalyzedAt?: string | null;
  openssfScore?: number | null;
  openssfChecks?: Record<string, unknown> | null;
  openssfAnalyzedAt?: string | null;
}

export function DevelopmentTabContent({
  projectId,
  githubUrl,
  analytics,
  program,
  githubIsFork,
  bytecodeMatchStatus,
  bytecodeVerifiedAt,
  bytecodeConfidence,
  bytecodeDeploySlot,
  programId,
  profileId,
  githubOAuthVerified = false,
  // Multi-dimensional props with defaults
  dependencyHealthScore = 0,
  dependencyOutdatedCount = 0,
  dependencyCriticalCount = 0,
  dependencyAnalyzedAt,
  governanceAddress,
  governanceTx30d = 0,
  governanceLastActivity,
  governanceAnalyzedAt,
  tvlUsd = 0,
  tvlMarketShare = 0,
  tvlRiskRatio = 0,
  tvlAnalyzedAt,
  protocolName,
  category,
  vulnerabilityCount = 0,
  vulnerabilityDetails,
  vulnerabilityAnalyzedAt,
  openssfScore,
  openssfChecks,
  openssfAnalyzedAt,
}: DevelopmentTabContentProps) {
  const { verifyBytecode, isVerifying } = useBytecodeVerification();

  // Get GitHub originality status
  const getGithubOriginalityInfo = () => {
    if (!githubOAuthVerified) {
      return { subtitle: 'Awaiting Verification', value: 0, isPositive: false, isWarning: false, isNA: true, isUnverified: true };
    }
    if (githubIsFork) {
      return { subtitle: 'Forked Repository', value: 30, isPositive: false, isWarning: true };
    }
    return { subtitle: 'Original Repository', value: 100, isPositive: true, isWarning: false };
  };

  // Get bytecode originality from database or fallback to program status
  const getBytecodeOriginalityInfo = () => {
    // If we have bytecode verification data from the database, use it
    if (bytecodeMatchStatus) {
      return getBytecodeStatusInfo(bytecodeMatchStatus, bytecodeConfidence);
    }
    
    // Fallback to program's originality status (legacy)
    switch (program.originalityStatus) {
      case 'verified':
        return { label: 'Verified Original', value: 100, isPositive: true, isWarning: false, isNA: false, description: '', confidence: 'MEDIUM' };
      case 'fork':
        return { label: 'Known Fork', value: 45, isPositive: false, isWarning: true, isNA: false, description: '', confidence: 'LOW' };
      case 'not-deployed':
        return { label: 'Not On-Chain', value: 0, isPositive: false, isWarning: false, isNA: true, description: 'This project is off-chain and has no deployed program.', confidence: 'NOT_DEPLOYED' };
      default:
        return { label: 'Awaiting Verification', value: 0, isPositive: false, isWarning: false, isNA: true, description: 'Bytecode verification has not run yet.', confidence: 'PENDING', isUnverified: true };
    }
  };

  const handleVerifyBytecode = async () => {
    if (programId && profileId) {
      await verifyBytecode(programId, profileId, githubUrl);
    }
  };

  const githubOriginality = getGithubOriginalityInfo();
  const bytecodeOriginality = getBytecodeOriginalityInfo();

  const getStatusIcon = (status: { isNA: boolean; isWarning: boolean; isPositive: boolean }) => {
    if (status.isNA) return <XCircle className="h-4 w-4 text-muted-foreground/50" />;
    if (status.isWarning) return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status.isPositive) return <CheckCircle className="h-4 w-4 text-primary" />;
    return null;
  };

  const originalityMetrics = [
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: bytecodeOriginality.label,
      value: bytecodeOriginality.value,
      description: bytecodeOriginality.description || 'Cryptographic fingerprint comparison against known program database.',
      isPositive: bytecodeOriginality.isPositive,
      isWarning: bytecodeOriginality.isWarning,
      isNA: bytecodeOriginality.isNA,
      isUnverified: (bytecodeOriginality as any).isUnverified || false,
      canVerify: !!programId && !!profileId,
      lastVerified: bytecodeVerifiedAt,
      confidence: bytecodeOriginality.confidence,
      deploySlot: bytecodeDeploySlot,
    },
    {
      icon: GitBranch,
      title: 'GITHUB ORIGINALITY',
      subtitle: githubOriginality.subtitle,
      value: githubOriginality.value,
      description: 'Source code provenance verification via GitHub metadata.',
      isPositive: githubOriginality.isPositive,
      isWarning: githubOriginality.isWarning,
      isNA: false,
      isUnverified: githubOriginality.isUnverified || false,
      canVerify: false,
      lastVerified: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Originality Metrics - Trust Signals First */}
      <TooltipProvider>
        <div className="grid gap-4 md:grid-cols-2">
          {originalityMetrics.map((metric, index) => (
            <Card 
              key={metric.title} 
              className="card-premium card-lift border-border bg-card animate-card-enter"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                      <metric.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-sm uppercase tracking-tight">
                        {metric.title}
                      </CardTitle>
                      <CardDescription
                        className={`flex items-center gap-1.5 ${
                          metric.isUnverified
                            ? 'text-orange-600'
                            : metric.isNA
                            ? 'text-muted-foreground/50'
                            : metric.isWarning
                            ? 'text-amber-500'
                            : metric.isPositive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {getStatusIcon(metric)}
                        {metric.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  {metric.canVerify && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleVerifyBytecode}
                          disabled={isVerifying}
                          className="h-8 w-8"
                        >
                          <RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isVerifying ? 'Verifying...' : 'Verify bytecode on-chain'}
                      </TooltipContent>
                    </Tooltip>
                  )}
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
                {metric.confidence && metric.confidence !== 'NOT_DEPLOYED' && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      metric.confidence === 'HIGH' ? 'bg-primary/15 text-primary' :
                      metric.confidence === 'MEDIUM' ? 'bg-blue-500/15 text-blue-400' :
                      metric.confidence === 'SUSPICIOUS' ? 'bg-destructive/15 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {metric.confidence}
                    </span>
                    {metric.deploySlot && (
                      <span className="text-[10px] text-muted-foreground/60">
                        Slot #{metric.deploySlot.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                {metric.lastVerified && (
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    Last verified: {formatDistanceToNow(new Date(metric.lastVerified), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>

      {/* Multi-Dimensional Health Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DependencyHealthCard
          healthScore={dependencyHealthScore}
          outdatedCount={dependencyOutdatedCount}
          criticalCount={dependencyCriticalCount}
          analyzedAt={dependencyAnalyzedAt}
          profileId={profileId}
        />
        <GovernanceHealthCard
          governanceAddress={governanceAddress}
          transactions30d={governanceTx30d}
          lastActivity={governanceLastActivity}
          analyzedAt={governanceAnalyzedAt}
        />
        {(category === 'defi' || tvlUsd > 0) && (
          <TVLMetricsCard
            tvlUsd={tvlUsd}
            marketShare={tvlMarketShare}
            riskRatio={tvlRiskRatio}
            protocolName={protocolName}
            analyzedAt={tvlAnalyzedAt}
          />
        )}
        <VulnerabilityCard
          vulnerabilityCount={vulnerabilityCount}
          vulnerabilityDetails={vulnerabilityDetails as any}
          analyzedAt={vulnerabilityAnalyzedAt}
          openssfScore={openssfScore}
          openssfChecks={openssfChecks as any}
          openssfAnalyzedAt={openssfAnalyzedAt}
        />
      </div>

      {/* GitHub Metrics */}
      <PublicGitHubMetrics analytics={analytics} githubUrl={githubUrl} />

      {/* Analytics Charts + Recent Events Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsCharts
            projectId={projectId}
            topContributors={analytics?.github_top_contributors}
            recentEvents={analytics?.github_recent_events}
          />
        </div>
        <div>
          <RecentEvents
            projectId={projectId}
            githubEvents={analytics?.github_recent_events}
          />
        </div>
      </div>
    </div>
  );
}
