import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchGitHubData } from '@/lib/github';
import { calculateResilienceScore } from '@/lib/scoring';
import type { ClaimedProfile } from '@/types';

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

        // Get stored program info
        const programId = localStorage.getItem('claimingProgramId');
        const programName = localStorage.getItem('claimingProgramName') || 'Unknown Program';
        const internalId = localStorage.getItem('claimingProgramInternalId');

        if (!programId) {
          throw new Error('No program ID found. Please start the claim process again.');
        }

        // Step 2: Simulate token exchange
        setCurrentStep('Verifying GitHub authorization...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Fetch GitHub data (mock)
        setCurrentStep('Indexing repository data...');
        const mockRepoUrl = `https://github.com/mock-org/${programName.toLowerCase().replace(/\s+/g, '-')}`;
        const githubData = await fetchGitHubData(mockRepoUrl);

        // Step 4: Calculate score
        setCurrentStep('Calculating Resilience Score...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const scoreResult = calculateResilienceScore(githubData, { stakedSOL: 0 });

        // Store claimed profile in localStorage (Phase 0)
        const claimedProfile: ClaimedProfile = {
          programId,
          programName,
          githubUsername: 'verified-builder',
          githubRepoUrl: mockRepoUrl,
          verified: true,
          verifiedAt: new Date().toISOString(),
          score: scoreResult.score,
          livenessStatus: scoreResult.livenessStatus,
        };

        // Store verified programs list
        const verifiedPrograms = JSON.parse(localStorage.getItem('verifiedPrograms') || '{}');
        verifiedPrograms[programId] = claimedProfile;
        localStorage.setItem('verifiedPrograms', JSON.stringify(verifiedPrograms));

        // Clean up temp storage
        localStorage.removeItem('claimingProgramId');
        localStorage.removeItem('claimingProgramName');
        localStorage.removeItem('claimingProgramInternalId');

        setStatus('success');
        setCurrentStep('Verification complete!');

        // Redirect after brief success message
        setTimeout(() => {
          if (internalId) {
            navigate(`/program/${internalId}?verified=true`);
          } else {
            navigate('/explorer?verified=true');
          }
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
                    Redirecting to your program page...
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
