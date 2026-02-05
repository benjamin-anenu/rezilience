import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Lock, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { programs } from '@/data/mockData';
import type { VerificationStep } from '@/types';

const ClaimProfile = () => {
  const navigate = useNavigate();
  const [programId, setProgramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    { step: 1, label: 'Program Claimed', status: 'pending' },
    { step: 2, label: 'GitHub Connected', status: 'pending' },
    { step: 3, label: 'Data Indexed', status: 'pending' },
    { step: 4, label: 'Score Calculated', status: 'pending' },
  ]);

  const updateStep = (stepNum: number, status: VerificationStep['status']) => {
    setVerificationSteps(prev =>
      prev.map(s => (s.step === stepNum ? { ...s, status } : s))
    );
  };

  const completedSteps = verificationSteps.filter(s => s.status === 'complete').length;
  const progressValue = (completedSteps / verificationSteps.length) * 100;
  const isStep1Complete = verificationSteps[0].status === 'complete';

  const handleVerifyProgram = async () => {
    if (!programId.trim()) {
      return;
    }

    setLoading(true);
    updateStep(1, 'in-progress');

    // Simulate on-chain verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Phase 0: Check against mock data OR accept any valid-looking program ID
    const existingProgram = programs.find(
      p => p.programId.toLowerCase() === programId.toLowerCase()
    );

    // Accept existing programs OR any 32+ character base58 string
    const isValidProgramId = existingProgram || programId.length >= 32;

    if (isValidProgramId) {
      updateStep(1, 'complete');
      // Store the claiming program info
      localStorage.setItem('claimingProgramId', programId);
      if (existingProgram) {
        localStorage.setItem('claimingProgramName', existingProgram.name);
        localStorage.setItem('claimingProgramInternalId', existingProgram.id);
      }
    } else {
      updateStep(1, 'error');
    }

    setLoading(false);
  };

  const handleGitHubConnect = () => {
    // Phase 0: Simulate OAuth flow with mock success
    // In production, this would redirect to GitHub OAuth
    
    // For now, go directly to callback with mock code
    navigate('/github-callback?code=mock_auth_code_12345');
  };

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

          {/* Step 1: Program ID Verification */}
          <Card className={`mb-6 border ${isStep1Complete ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-sm font-mono text-sm ${
                  isStep1Complete 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isStep1Complete ? <CheckCircle className="h-4 w-4" /> : '1'}
                </span>
                <span className="font-display text-lg uppercase tracking-tight">
                  {verificationSteps[0].label}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isStep1Complete ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter Solana Program ID..."
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="font-mono text-sm"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleVerifyProgram}
                    disabled={loading || !programId.trim()}
                    className="w-full font-display font-semibold uppercase tracking-wider"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        VERIFYING...
                      </>
                    ) : (
                      'VERIFY PROGRAM'
                    )}
                  </Button>
                  
                  {verificationSteps[0].status === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Invalid Program ID. Please check and try again.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-mono">{programId.slice(0, 20)}...{programId.slice(-8)}</span>
                  <span className="text-muted-foreground">verified on-chain</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: GitHub OAuth */}
          {isStep1Complete && (
            <Card className="mb-6 border border-primary/30 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted font-mono text-sm text-muted-foreground">
                    2
                  </span>
                  <span className="font-display text-lg uppercase tracking-tight">
                    Connect GitHub
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
