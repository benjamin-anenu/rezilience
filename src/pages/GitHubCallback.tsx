import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchGitHubData } from '@/lib/github';
import { calculateResilienceScore } from '@/lib/scoring';
import type { ClaimedProfile, ClaimProfileFormData } from '@/types';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [currentStep, setCurrentStep] = useState<string>('Connecting to GitHub...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        // Get stored X user info (required)
        const xUserId = localStorage.getItem('claimingXUserId');
        const xUsername = localStorage.getItem('claimingXUsername');

        if (!xUserId || !xUsername) {
          throw new Error('X authentication required. Please sign in with X first.');
        }

        // Get stored claiming profile data
        const storedProfile = localStorage.getItem('claimingProfile');
        let profileData: Partial<ClaimProfileFormData> = {};
        if (storedProfile) {
          try {
            profileData = JSON.parse(storedProfile);
          } catch {
            // Ignore parse errors
          }
        }

        // Get optional identifiers from direct storage (legacy support)
        const programId = localStorage.getItem('claimingProgramId') || profileData.programId;
        const internalId = localStorage.getItem('claimingProgramInternalId');
        const walletAddress = localStorage.getItem('claimingWalletAddress') || profileData.walletAddress;

        // Step 2: Simulate token exchange
        setCurrentStep('Verifying GitHub authorization...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Fetch GitHub data (mock)
        setCurrentStep('Indexing repository data...');
        const mockRepoUrl = profileData.githubOrgUrl 
          || (profileData.projectName 
            ? `https://github.com/mock-org/${profileData.projectName.toLowerCase().replace(/\s+/g, '-')}`
            : `https://github.com/${xUsername}/main-project`);
        const githubData = await fetchGitHubData(mockRepoUrl);

        // Step 4: Calculate score
        setCurrentStep('Calculating Resilience Score...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const scoreResult = calculateResilienceScore(githubData, { stakedSOL: 0 });

        // Generate unique profile ID
        const profileId = programId || `profile_${Date.now()}_${xUserId}`;

        // Build complete claimed profile
        const claimedProfile: ClaimedProfile = {
          id: profileId,
          
          // Core Identity
          projectName: profileData.projectName || `${xUsername}'s Project`,
          description: profileData.description,
          category: profileData.category || 'other',
          websiteUrl: profileData.websiteUrl,
          programId: programId || undefined,
          walletAddress: walletAddress || undefined,
          
          // Auth
          xUserId,
          xUsername,
          
          // GitHub
          githubOrgUrl: mockRepoUrl,
          githubUsername: 'verified-builder',
          
          // Socials
          socials: {
            xHandle: xUsername,
            discordUrl: profileData.discordUrl,
            telegramUrl: profileData.telegramUrl,
          },
          
          // Media
          mediaAssets: profileData.mediaAssets || [],
          
          // Roadmap
          milestones: profileData.milestones || [],
          
          // Verification
          verified: true,
          verifiedAt: new Date().toISOString(),
          score: scoreResult.score,
          livenessStatus: scoreResult.livenessStatus,
        };

        // Store verified profiles list
        const verifiedPrograms = JSON.parse(localStorage.getItem('verifiedPrograms') || '{}');
        verifiedPrograms[profileId] = claimedProfile;
        localStorage.setItem('verifiedPrograms', JSON.stringify(verifiedPrograms));

        // Clean up temp storage
        localStorage.removeItem('claimingProgramId');
        localStorage.removeItem('claimingProgramInternalId');
        localStorage.removeItem('claimingWalletAddress');
        localStorage.removeItem('claimingXUserId');
        localStorage.removeItem('claimingXUsername');
        localStorage.removeItem('claimingProfile');

        setStatus('success');
        setCurrentStep('Verification complete!');

        // Redirect after brief success message
        setTimeout(() => {
          // Redirect to profile page (using the new profile ID)
          navigate(`/profile/${profileId}?verified=true`);
        }, 2000);

      } catch (err) {
        console.error('GitHub callback error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStatus('error');
      }
    };

    processCallback();
  }, [navigate, searchParams]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="container mx-auto max-w-md px-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-8 pb-8">
              {status === 'loading' && (
                <div className="text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                    VERIFYING
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    {currentStep}
                  </p>
                  
                  {/* Progress animation */}
                  <div className="mt-6 flex justify-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        style={{
                          animation: 'pulse 1s ease-in-out infinite',
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-primary">
                    VERIFIED TITAN
                  </h2>
                  <p className="mb-4 font-mono text-sm text-muted-foreground">
                    Your profile has been verified successfully.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting to your profile...
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-destructive">
                    VERIFICATION FAILED
                  </h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {error}
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate('/claim-profile')}
                      className="w-full font-display font-semibold uppercase tracking-wider"
                    >
                      TRY AGAIN
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/explorer')}
                      className="w-full font-display font-semibold uppercase tracking-wider"
                    >
                      RETURN TO EXPLORER
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default GitHubCallback;
