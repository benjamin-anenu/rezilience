import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { XUser } from '@/types';

const XCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('No authorization code received from X');
        }

        // Phase 0: Mock token exchange
        // In production: call edge function to exchange code for token
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock X user data
        const mockXUser: XUser = {
          id: 'x_mock_' + Date.now(),
          username: 'verified_builder',
          avatarUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
        };

        // Store in localStorage
        localStorage.setItem('x_user', JSON.stringify(mockXUser));

        setStatus('success');

        // Redirect to claim profile after brief success message
        setTimeout(() => {
          navigate('/claim-profile');
        }, 1500);

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
                    Welcome! Redirecting to claim profile...
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
