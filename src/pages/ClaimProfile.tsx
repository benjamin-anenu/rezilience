import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Lock, CheckCircle, AlertCircle, Loader2, Shield, Wallet } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { programs } from '@/data/mockData';
import type { VerificationStep } from '@/types';

const ClaimProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, signInWithX } = useAuth();
  const { publicKey, connected } = useWallet();
  
  const [programId, setProgramId] = useState('');
  const [programLoading, setProgramLoading] = useState(false);
  const [programVerified, setProgramVerified] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);
  
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    { step: 1, label: 'X Authenticated', status: 'pending' },
    { step: 2, label: 'Identity Linked', status: 'pending' },
    { step: 3, label: 'GitHub Connected', status: 'pending' },
    { step: 4, label: 'Score Calculated', status: 'pending' },
  ]);

  // Update step 1 when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      updateStep(1, 'complete');
    }
  }, [isAuthenticated]);

  // Update step 2 when program or wallet is linked
  useEffect(() => {
    if (programVerified || connected) {
      updateStep(2, 'complete');
    }
  }, [programVerified, connected]);

  // Store wallet address when connected
  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem('claimingWalletAddress', publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const updateStep = (stepNum: number, status: VerificationStep['status']) => {
    setVerificationSteps(prev =>
      prev.map(s => (s.step === stepNum ? { ...s, status } : s))
    );
  };

  const completedSteps = verificationSteps.filter(s => s.status === 'complete').length;
  const progressValue = (completedSteps / verificationSteps.length) * 100;

  const handleVerifyProgram = async () => {
    if (!programId.trim()) return;

    setProgramLoading(true);
    setProgramError(null);

    // Simulate on-chain verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check against mock data OR accept any valid-looking program ID
    const existingProgram = programs.find(
      p => p.programId.toLowerCase() === programId.toLowerCase()
    );

    // Accept existing programs OR any 32+ character base58 string
    const isValidProgramId = existingProgram || programId.length >= 32;

    if (isValidProgramId) {
      setProgramVerified(true);
      // Store the claiming program info
      localStorage.setItem('claimingProgramId', programId);
      if (existingProgram) {
        localStorage.setItem('claimingProgramName', existingProgram.name);
        localStorage.setItem('claimingProgramInternalId', existingProgram.id);
      }
    } else {
      setProgramError('Invalid Program ID. Please check and try again.');
    }

    setProgramLoading(false);
  };

  const handleGitHubConnect = () => {
    // Store X user info for the callback
    if (user) {
      localStorage.setItem('claimingXUserId', user.id);
      localStorage.setItem('claimingXUsername', user.username);
    }
    // Go to GitHub callback (mock flow)
    navigate('/github-callback?code=mock_auth_code_12345');
  };

  // Show loading state
  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto max-w-2xl px-4 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              CLAIM YOUR PROTOCOL
            </h1>
            <p className="text-muted-foreground">
              Prove your development velocity. Unlock your heartbeat.
            </p>
          </div>

          {/* Step 1: X Authentication (if not authenticated) */}
          {!isAuthenticated && (
            <Card className="mb-6 border-primary/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary font-mono text-sm text-primary-foreground">
                    1
                  </span>
                  <span className="font-display text-lg uppercase tracking-tight">
                    Sign in with X
                  </span>
                  <span className="ml-auto rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
                    REQUIRED
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  X is your identity layer in the Resilience ecosystem. No email required.
                </p>
                <Button
                  onClick={signInWithX}
                  className="w-full bg-black text-white hover:bg-black/90 font-display font-semibold uppercase tracking-wider"
                  size="lg"
                >
                  <span className="mr-2 text-xl">𝕏</span>
                  SIGN IN WITH X
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Authenticated User Welcome */}
          {isAuthenticated && user && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-primary/30"
                  />
                  <div>
                    <p className="font-mono text-sm text-primary">
                      Signed in as @{user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      X authentication complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optional Identifiers Section (only show when authenticated) */}
          {isAuthenticated && (
            <>
              <div className="mb-6">
                <h3 className="mb-2 font-display text-sm uppercase tracking-wider text-muted-foreground">
                  OPTIONAL: LINK YOUR IDENTITY
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Add context to your profile. You can skip these steps.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Program ID Card */}
                  <Card className={`border ${programVerified ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="font-display uppercase tracking-tight">Program ID</span>
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                          OPTIONAL
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!programVerified ? (
                        <>
                          <Input
                            placeholder="Solana Program ID..."
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            className="font-mono text-xs"
                            disabled={programLoading}
                          />
                          <Button
                            onClick={handleVerifyProgram}
                            disabled={programLoading || !programId.trim()}
                            variant="outline"
                            size="sm"
                            className="w-full font-display text-xs uppercase tracking-wider"
                          >
                            {programLoading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                VERIFYING...
                              </>
                            ) : (
                              'VERIFY PROGRAM'
                            )}
                          </Button>
                          {programError && (
                            <p className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {programError}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            Skip if not claiming a specific program
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-mono">{programId.slice(0, 12)}...</span>
                          <span className="text-muted-foreground">verified</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Wallet Card */}
                  <Card className={`border ${connected ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="font-display uppercase tracking-tight">Wallet</span>
                        <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                          OPTIONAL
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {!connected ? (
                        <>
                          <div className="flex justify-center">
                            <WalletMultiButton className="!bg-muted !text-foreground hover:!bg-muted/80 !font-display !text-xs !uppercase !tracking-wider !rounded-md !h-9" />
                          </div>
                          <p className="text-[10px] text-muted-foreground text-center">
                            Link wallet for on-chain identity
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <CheckCircle className="h-4 w-4" />
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">
                            {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Required: GitHub Section */}
              <Card className="mb-6 border-primary/30 bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-primary" />
                    <span className="font-display text-lg uppercase tracking-tight">
                      Connect GitHub
                    </span>
                    <span className="ml-auto rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] font-mono uppercase text-primary">
                      REQUIRED
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quote */}
                  <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground">
                    "IN AN OPEN-SOURCE WORLD, PRIVACY IS ROT."
                  </blockquote>

                  <p className="text-sm text-muted-foreground">
                    Projects that hide their activity are the first to be forgotten. 
                    Linking your GitHub gives your investors{' '}
                    <span className="font-semibold text-primary">Proof of Life</span>.
                  </p>

                  {/* Trust Badge */}
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <Lock className="mt-0.5 h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="font-semibold text-foreground">Read-Only Access: </span>
                        <span className="text-muted-foreground">
                          We only read commit history, releases, and contributor data. 
                          Your code remains yours. We never ask for Write access.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGitHubConnect}
                    className="w-full font-display font-semibold uppercase tracking-wider"
                    size="lg"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    CONNECT GITHUB
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Progress Bar */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                  VERIFICATION PROGRESS
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {completedSteps} of {verificationSteps.length} steps
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
              
              {/* Step indicators */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {verificationSteps.map((step) => (
                  <div
                    key={step.step}
                    className={`text-center text-xs ${
                      step.status === 'complete' ? 'text-primary' :
                      step.status === 'in-progress' ? 'text-foreground' :
                      step.status === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}
                  >
                    <div className={`mx-auto mb-1 h-2 w-2 rounded-full ${
                      step.status === 'complete' ? 'bg-primary' :
                      step.status === 'in-progress' ? 'bg-foreground animate-pulse' :
                      step.status === 'error' ? 'bg-destructive' :
                      'bg-muted'
                    }`} />
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Provenance Notice */}
          <div className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
            <span>
              All verification data is processed transparently. Your GitHub metrics contribute 
              to your Resilience Score using our open methodology.
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimProfile;
