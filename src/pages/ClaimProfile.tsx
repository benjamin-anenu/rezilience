import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Shield, Wallet, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import {
  StepIndicator,
  CoreIdentityForm,
  SocialsForm,
  MediaUploader,
  RoadmapForm,
} from '@/components/claim';
import type { MediaAsset, Milestone, ProjectCategory } from '@/types';

const ClaimProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, signInWithX } = useAuth();
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  
  // Check if returning from GitHub OAuth with verification
  const isVerified = searchParams.get('verified') === 'true';
  const stepFromUrl = searchParams.get('step');
  
  // Check if GitHub OAuth is configured
  const isGitHubConfigured = !!import.meta.env.VITE_GITHUB_CLIENT_ID;

  // Current step (1-5)
  // Track if GitHub verification is complete
  const [githubVerified, setGithubVerified] = useState(isVerified);
  
  // Initialize step based on auth state, URL params, and saved progress
  const [currentStep, setCurrentStep] = useState(() => {
    // If returning from OAuth with step param, use that
    if (stepFromUrl) {
      const step = parseInt(stepFromUrl, 10);
      if (step >= 2 && step <= 5) return step;
    }
    
    const storedUser = localStorage.getItem('x_user');
    if (!storedUser) return 1;
    
    // Check for saved progress
    const saved = localStorage.getItem('claimFormProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.currentStep && data.currentStep >= 2 && data.currentStep <= 5) {
          return data.currentStep;
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    return 2;
  });

  // Step 2: Core Identity
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory | ''>('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [programId, setProgramId] = useState('');
  const [programLoading, setProgramLoading] = useState(false);
  const [programVerified, setProgramVerified] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);

  // Step 3: Socials
  const [githubOrgUrl, setGithubOrgUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  // Step 4: Media
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // Step 5: Roadmap
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Project lookup hook
  const { data: existingProject, refetch: refetchProject } = useProject(programId);

  // Sync step with auth state
  useEffect(() => {
    if (isAuthenticated && currentStep === 1) {
      setCurrentStep(2);
    } else if (!isAuthenticated && currentStep > 1) {
      setCurrentStep(1);
    }
  }, [isAuthenticated, currentStep]);

  // Persist form state to localStorage to survive wallet redirects
  useEffect(() => {
    const formData = {
      projectName,
      description,
      category,
      websiteUrl,
      programId,
      githubOrgUrl,
      discordUrl,
      telegramUrl,
      currentStep,
      mediaAssets,
      milestones,
    };
    localStorage.setItem('claimFormProgress', JSON.stringify(formData));
  }, [projectName, description, category, websiteUrl, programId, githubOrgUrl, discordUrl, telegramUrl, currentStep, mediaAssets, milestones]);

  // Restore form state on mount
  useEffect(() => {
    const saved = localStorage.getItem('claimFormProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.projectName) setProjectName(data.projectName);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
        if (data.programId) setProgramId(data.programId);
        if (data.githubOrgUrl) setGithubOrgUrl(data.githubOrgUrl);
        if (data.discordUrl) setDiscordUrl(data.discordUrl);
        if (data.telegramUrl) setTelegramUrl(data.telegramUrl);
        if (data.mediaAssets) setMediaAssets(data.mediaAssets);
        if (data.milestones) setMilestones(data.milestones);
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Wallet address is included in claimingProfile object during GitHub OAuth redirect
  // No separate localStorage needed here

  const steps = [
    { number: 1, label: 'X Auth', isComplete: isAuthenticated, isCurrent: currentStep === 1 },
    { number: 2, label: 'Identity', isComplete: currentStep > 2, isCurrent: currentStep === 2 },
    { number: 3, label: 'Verify', isComplete: currentStep > 3, isCurrent: currentStep === 3 },
    { number: 4, label: 'Media', isComplete: currentStep > 4, isCurrent: currentStep === 4 },
    { number: 5, label: 'Roadmap', isComplete: currentStep === 5 && milestones.length > 0, isCurrent: currentStep === 5 },
  ];

  const handleVerifyProgram = async () => {
    if (!programId.trim()) return;

    setProgramLoading(true);
    setProgramError(null);

    // Check database for existing program
    const result = await refetchProject();

    // Allow valid program IDs (either in DB or valid format)
    const isValidProgramId = result.data || programId.length >= 32;

    if (isValidProgramId) {
      setProgramVerified(true);
      // Program ID is included in claimingProfile object during GitHub OAuth redirect
      // No separate localStorage needed here
    } else {
      setProgramError('Invalid Program ID. Please check and try again.');
    }

    setProgramLoading(false);
  };

  const handleGitHubConnect = () => {
    // All user data is stored in the claimingProfile object below
    // No separate localStorage entries needed for individual fields

    // Store form data for retrieval after OAuth callback
    const claimingProfile = {
      projectName,
      description,
      category,
      websiteUrl,
      programId: programId || undefined,
      walletAddress: connected && publicKey ? publicKey.toBase58() : undefined,
      xUserId: user?.id,
      xUsername: user?.username,
      socials: {
        xHandle: user?.username,
        discordUrl: discordUrl || undefined,
        telegramUrl: telegramUrl || undefined,
      },
      mediaAssets,
      milestones,
      githubOrgUrl,
    };

    localStorage.setItem('claimingProfile', JSON.stringify(claimingProfile));

    // Generate CSRF state token
    const state = crypto.randomUUID();
    localStorage.setItem('github_oauth_state', state);

    // Redirect to real GitHub OAuth
    const redirectUri = `${window.location.origin}/github-callback`;
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      console.error('GitHub OAuth not configured');
      toast({
        title: "GitHub Integration Not Available",
        description: "GitHub OAuth is not configured. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user read:org repo',
      state,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  const canProceedFromStep2 = projectName.trim() && category;
  const canProceedFromStep3 = githubOrgUrl.trim();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

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
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              SECURE YOUR STANDING
            </h1>
            <p className="text-muted-foreground">
              Register your protocol. Prove your development velocity. Unlock your heartbeat.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator steps={steps} />
          </div>

          {/* Step 1: X Authentication */}
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

          {/* Step 2: Core Identity */}
          {isAuthenticated && currentStep === 2 && (
            <>
              <CoreIdentityForm
                projectName={projectName}
                setProjectName={setProjectName}
                description={description}
                setDescription={setDescription}
                category={category}
                setCategory={setCategory}
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
              />

              {/* Optional Identifiers */}
              <div className="mt-6">
                <h3 className="mb-4 font-display text-sm uppercase tracking-wider text-muted-foreground">
                  OPTIONAL IDENTIFIERS
                </h3>
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
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-mono">{programId.slice(0, 12)}...</span>
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
                            Your form data is auto-saved.
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

              {/* Navigation */}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep2}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  NEXT: SOCIALS
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Socials */}
          {isAuthenticated && currentStep === 3 && (
            <>
              {/* GitHub OAuth Warning */}
              {!isGitHubConfigured && (
                <Card className="mb-6 border-destructive/50 bg-destructive/10">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-display text-sm font-semibold uppercase text-destructive">
                          GitHub Integration Unavailable
                        </p>
                        <p className="text-xs text-destructive/80">
                          GitHub OAuth is not configured. You can still enter your GitHub URL, but verification will not work.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <SocialsForm
                githubOrgUrl={githubOrgUrl}
                setGithubOrgUrl={setGithubOrgUrl}
                xHandle={user?.username || ''}
                discordUrl={discordUrl}
                setDiscordUrl={setDiscordUrl}
                telegramUrl={telegramUrl}
                setTelegramUrl={setTelegramUrl}
                onGitHubConnect={handleGitHubConnect}
                githubConnected={false}
              />

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  BACK
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep3}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  NEXT: MEDIA
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Media */}
          {isAuthenticated && currentStep === 4 && (
            <>
              <MediaUploader
                mediaAssets={mediaAssets}
                setMediaAssets={setMediaAssets}
              />

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  BACK
                </Button>
                <Button
                  onClick={handleNext}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  NEXT: ROADMAP
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Roadmap */}
          {isAuthenticated && currentStep === 5 && (
            <>
              <RoadmapForm
                milestones={milestones}
                setMilestones={setMilestones}
              />

              {/* Final Submit */}
              <Card className="mt-6 border-primary/30 bg-card">
                <CardContent className="py-6">
                  {githubVerified ? (
                    <>
                      <div className="mb-4 flex items-center justify-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-display text-sm uppercase">GitHub Verified</span>
                      </div>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Your profile is verified! Click below to view your Heartbeat Dashboard.
                      </p>
                      <Button
                        onClick={() => {
                          const profileId = localStorage.getItem('verifiedProfileId');
                          localStorage.removeItem('claimFormProgress');
                          localStorage.removeItem('verifiedProfileId');
                          navigate(`/profile/${profileId}`);
                        }}
                        className="w-full font-display font-semibold uppercase tracking-wider"
                        size="lg"
                      >
                        VIEW MY PROFILE
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Ready to verify? Clicking below will connect your GitHub and finalize your profile.
                      </p>
                      <Button
                        onClick={handleGitHubConnect}
                        className="w-full font-display font-semibold uppercase tracking-wider"
                        size="lg"
                      >
                        COMPLETE VERIFICATION
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="mt-8 flex justify-start">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="font-display font-semibold uppercase tracking-wider"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  BACK
                </Button>
              </div>
            </>
          )}

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
