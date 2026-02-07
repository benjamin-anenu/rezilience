import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { XUser } from '@/types';

interface XOAuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
  };
  error?: string;
}

const XCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors from X
        if (errorParam) {
          throw new Error(errorDescription || `X OAuth error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from X');
        }

        // Verify CSRF state token
        const storedState = sessionStorage.getItem('x_oauth_state');
        if (!storedState || state !== storedState) {
          throw new Error('Invalid state parameter. Please try signing in again.');
        }
        sessionStorage.removeItem('x_oauth_state');

        // Get stored code verifier for PKCE
        const codeVerifier = sessionStorage.getItem('x_code_verifier');
        if (!codeVerifier) {
          throw new Error('Missing code verifier. Please try signing in again.');
        }
        sessionStorage.removeItem('x_code_verifier');

        // Call edge function to exchange code for user data
        const redirectUri = `${window.location.origin}/x-callback`;
        
        const { data, error: fnError } = await supabase.functions.invoke<XOAuthResult>(
          'x-oauth-callback',
          {
            body: {
              code,
              code_verifier: codeVerifier,
              redirect_uri: redirectUri,
            },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || 'Failed to verify X authorization');
        }

        if (!data?.success || !data.user) {
          throw new Error(data?.error || 'X verification failed');
        }

        // Store user in localStorage for session persistence
        const xUser: XUser = {
          id: data.user.id,
          username: data.user.username,
          avatarUrl: data.user.avatarUrl,
        };
        localStorage.setItem('x_user', JSON.stringify(xUser));

        setUsername(data.user.username);
        setStatus('success');

        // FIX #2: Check if user already has a verified profile
        // If yes, redirect to Dashboard instead of onboarding
        setCheckingExisting(true);
        const { data: existingProfile } = await supabase
          .from('claimed_profiles')
          .select('id')
          .eq('x_user_id', data.user.id)
          .eq('verified', true)
          .maybeSingle();
        
        setCheckingExisting(false);

        if (existingProfile) {
          // User already has a profile - go to Dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // New user - go to claim profile with fresh auth flag to auto-advance to step 2
          setTimeout(() => {
            navigate('/claim-profile?auth=fresh');
          }, 1500);
        }

      } catch (err) {
        console.error('X callback error:', err);
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
                    SIGNING IN WITH X
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    Authenticating your identity...
                  </p>

                  {/* X logo animation */}
                  <div className="mt-6 flex justify-center">
                    <span className="text-4xl animate-pulse">𝕏</span>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-primary">
                    AUTHENTICATED
                  </h2>
                  <p className="mb-4 font-mono text-sm text-muted-foreground">
                    Welcome, @{username}!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {checkingExisting ? 'Checking your profile...' : 'Redirecting...'}
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                  <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-destructive">
                    AUTHENTICATION FAILED
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
                      onClick={() => navigate('/')}
                      className="w-full font-display font-semibold uppercase tracking-wider"
                    >
                      RETURN HOME
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

export default XCallback;
