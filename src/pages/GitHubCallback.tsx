import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface OAuthResult {
  success: boolean;
  profile?: {
    id: string;
    projectName: string;
    githubUsername: string;
    score: number;
    livenessStatus: string;
    verified: boolean;
  };
  error?: string;
}

const GitHubCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [currentStep, setCurrentStep] = useState<string>('Connecting to GitHub...');
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<OAuthResult['profile'] | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Handle OAuth errors from GitHub
        if (errorParam) {
          throw new Error(errorDescription || `GitHub OAuth error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        // Verify CSRF state token
        const storedState = localStorage.getItem('github_oauth_state');
        if (state && storedState && state !== storedState) {
          throw new Error('Invalid state parameter. Please try again.');
        }
        localStorage.removeItem('github_oauth_state');

        // Get stored claiming profile data
        const storedProfile = localStorage.getItem('claimingProfile');
        let profileFormData: Record<string, unknown> = {};
        if (storedProfile) {
          try {
            profileFormData = JSON.parse(storedProfile);
          } catch {
            // Ignore parse errors
          }
        }

        // Step 2: Exchange code for token via edge function
        setCurrentStep('Verifying GitHub authorization...');
        
        const { data, error: fnError } = await supabase.functions.invoke<OAuthResult>(
          'github-oauth-callback',
          {
            body: {
              code,
              profile_data: profileFormData,
            },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || 'Failed to verify GitHub authorization');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'GitHub verification failed');
        }

        setCurrentStep('Indexing repository data...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setCurrentStep('Calculating Resilience Score...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Determine if this is a profile re-verification (not initial claim)
        const verifyProfileId = localStorage.getItem('verifyGithubProfileId');

        // FIX #3 & #8: Clean up ALL temp storage including form progress on success
        localStorage.removeItem('claimingProgramId');
        localStorage.removeItem('claimingProgramDbId');
        localStorage.removeItem('claimingWalletAddress');
        localStorage.removeItem('claimingXUserId');
        localStorage.removeItem('claimingXUsername');
        localStorage.removeItem('claimingProfile');
        localStorage.removeItem('claimFormProgress');
        localStorage.removeItem('github_oauth_state');
        localStorage.removeItem('verifyGithubProfileId');
        
        // Store verified profile ID for final navigation
        const targetProfileId = verifyProfileId || data.profile?.id || '';
        localStorage.setItem('verifiedProfileId', targetProfileId);

        setProfileData(data.profile);
        setStatus('success');
        setCurrentStep('Verification complete!');

        // Redirect to the correct destination
        setTimeout(() => {
          navigate(`/profile/${targetProfileId}`);
        }, 2000);

      } catch (err) {
        console.error('GitHub callback error:', err);
        // FIX #8: Clear temporary storage on error path as well
        localStorage.removeItem('github_oauth_state');
        localStorage.removeItem('claimingProfile');
        localStorage.removeItem('verifyGithubProfileId');
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

              {status === 'success' && profileData && (
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-primary">
                    VERIFIED TITAN
                  </h2>
                  <p className="mb-2 font-mono text-sm text-muted-foreground">
                    Welcome, @{profileData.githubUsername}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Resilience Score: <span className="font-bold text-primary">{profileData.score}</span>
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
