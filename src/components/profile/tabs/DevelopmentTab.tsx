import { useState } from 'react';
import { Fingerprint, GitBranch, Github, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PublicGitHubMetrics } from '@/components/program/PublicGitHubMetrics';
import { AnalyticsCharts } from '@/components/program/AnalyticsCharts';
import { RecentEvents } from '@/components/program/RecentEvents';
import { AuthorityVerificationModal } from '@/components/claim/AuthorityVerificationModal';
import { useBytecodeVerification, getBytecodeStatusInfo } from '@/hooks/useBytecodeVerification';
import { buildGitHubOAuthUrl, generateOAuthState } from '@/lib/github';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { ClaimedProfile } from '@/types';

interface DevelopmentTabProps {
  profile: ClaimedProfile;
  isOwner?: boolean;
  profileId?: string;
  programId?: string;
}

export function DevelopmentTab({ profile, isOwner, profileId, programId }: DevelopmentTabProps) {
  const analytics = profile.githubAnalytics;
  const githubUrl = profile.githubOrgUrl;
  const githubIsFork = analytics?.github_is_fork;
  const queryClient = useQueryClient();

  // GitHub OAuth verified state
  const githubOAuthVerified = !!profile.githubUsername;

  // Bytecode verification
  const hasProgramId = !!(programId && programId !== profileId);
  const bytecodeStatus = getBytecodeStatusInfo(
    profile.bytecodeMatchStatus,
    profile.bytecodeConfidence,
    hasProgramId
  );
  const { verifyBytecode, isVerifying: isBytecodeVerifying } = useBytecodeVerification();
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [isGitHubRedirecting, setIsGitHubRedirecting] = useState(false);

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

  // Handle GitHub OAuth trigger from profile page
  const handleVerifyGitHub = () => {
    if (!profileId) return;
    setIsGitHubRedirecting(true);

    // Store profile ID so GitHubCallback knows to redirect back here (re-verification mode)
    localStorage.setItem('verifyGithubProfileId', profileId);

    const state = generateOAuthState();
    localStorage.setItem('github_oauth_state', state);

    const redirectUri = `${window.location.origin}/github-callback`;
    const oauthUrl = buildGitHubOAuthUrl(redirectUri, state);
    window.location.href = oauthUrl;
  };

  // Handle bytecode verification complete
  const handleBytecodeVerificationComplete = async (result: {
    authorityWallet: string;
    signature: string;
    message: string;
    authorityType: string;
    multisigAddress?: string;
    squadsVersion?: string;
    multisigVerifiedVia?: string;
  }) => {
    setShowAuthorityModal(false);

    if (!programId || !profileId) return;

    try {
      await verifyBytecode(programId, profileId, githubUrl || undefined);
      await queryClient.invalidateQueries({ queryKey: ['claimed-profile', profileId] });
      toast({ title: 'Bytecode verified', description: 'On-chain verification complete.' });
    } catch {
      toast({ title: 'Verification failed', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  // Build originality metrics
  const originalityMetrics = [
    {
      icon: Fingerprint,
      title: 'BYTECODE ORIGINALITY',
      subtitle: bytecodeStatus.isOffChain ? 'N/A — Off-chain' : bytecodeStatus.isUnverified ? 'Awaiting Verification' : bytecodeStatus.label,
      value: bytecodeStatus.value,
      description: bytecodeStatus.description,
      isPositive: bytecodeStatus.isPositive,
      isWarning: bytecodeStatus.isWarning,
      isNA: bytecodeStatus.isNA,
      isUnverified: bytecodeStatus.isUnverified,
      isOffChain: bytecodeStatus.isOffChain,
      canVerify: isOwner && bytecodeStatus.isUnverified && hasProgramId,
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
      isUnverified: githubOriginality.isUnverified,
      canVerify: isOwner && githubOriginality.isUnverified,
    },
  ];

  return (
    <div className="space-y-6">
      {/* GitHub Metrics - Full Width */}
      <PublicGitHubMetrics analytics={analytics} githubUrl={githubUrl} />

      {/* Analytics Charts + Recent Events Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsCharts
            projectId={profile.id}
            topContributors={analytics?.github_top_contributors}
            recentEvents={analytics?.github_recent_events}
          />
        </div>
        <div>
          <RecentEvents
            projectId={profile.id}
            githubEvents={analytics?.github_recent_events}
          />
        </div>
      </div>

      {/* Originality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {originalityMetrics.map((metric, index) => (
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
                    className={
                      metric.isUnverified
                        ? 'text-orange-600'
                        : metric.isOffChain || metric.isNA
                        ? 'text-muted-foreground/50'
                        : metric.isWarning
                        ? 'text-amber-500'
                        : metric.isPositive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  >
                    {metric.subtitle}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metric.isOffChain ? (
                <p className="text-xs text-muted-foreground/50">{metric.description}</p>
              ) : !metric.isUnverified ? (
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
              {!metric.isOffChain && (
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              )}

              {/* Owner verification action buttons */}
              {metric.canVerify && metric.title === 'GITHUB ORIGINALITY' && (
                <Button
                  size="sm"
                  className="mt-3 w-full font-display text-xs uppercase tracking-wider"
                  onClick={handleVerifyGitHub}
                  disabled={isGitHubRedirecting}
                >
                  {isGitHubRedirecting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Github className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isGitHubRedirecting ? 'Redirecting...' : 'Verify GitHub'}
                </Button>
              )}
              {metric.canVerify && metric.title === 'BYTECODE ORIGINALITY' && (
                <Button
                  size="sm"
                  className="mt-3 w-full font-display text-xs uppercase tracking-wider"
                  onClick={() => setShowAuthorityModal(true)}
                  disabled={isBytecodeVerifying}
                >
                  {isBytecodeVerifying ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Shield className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {isBytecodeVerifying ? 'Verifying...' : 'Verify On-Chain'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Authority Verification Modal for bytecode */}
      {hasProgramId && programId && (
        <AuthorityVerificationModal
          isOpen={showAuthorityModal}
          onClose={() => setShowAuthorityModal(false)}
          programId={programId}
          profileId={profileId}
          onVerificationComplete={handleBytecodeVerificationComplete}
        />
      )}
    </div>
  );
}
