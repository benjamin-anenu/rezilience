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
import { useExistingProfile } from '@/hooks/useClaimedProfiles';
import {
  StepIndicator,
  CoreIdentityForm,
  SocialsForm,
  MediaUploader,
  RoadmapForm,
  AuthorityVerificationModal,
} from '@/components/claim';
import type { MediaAsset, Milestone, ProjectCategory } from '@/types';
import { type GitHubAnalysisResult, suggestCategory } from '@/hooks/useGitHubAnalysis';

const ClaimProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, signInWithX } = useAuth();
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  
  // Check if returning from GitHub OAuth with verification
  const isVerified = searchParams.get('verified') === 'true';
  const stepFromUrl = searchParams.get('step');
  // FIX #2: Check if returning from fresh X auth
  const authFresh = searchParams.get('auth') === 'fresh';
  
  // Check if GitHub OAuth is configured
  const isGitHubConfigured = !!import.meta.env.VITE_GITHUB_CLIENT_ID;

  // FIX #2: Check if user already has a verified profile
  const { data: existingProfileData, isLoading: checkingExisting } = useExistingProfile(user?.id);

  // Current step (1-5)
  // Track if GitHub verification is complete
  const [githubVerified, setGithubVerified] = useState(isVerified);
  
  // FIX #1: Track submitting state for direct submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize step based on auth state, URL params, and saved progress
  const [currentStep, setCurrentStep] = useState(() => {
    // FIX #2: If returning from X auth with fresh flag, force step 2
    if (authFresh) {
      return 2;
    }
    
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
  const [country, setCountry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [programId, setProgramId] = useState('');
  const [programLoading, setProgramLoading] = useState(false);
  const [programVerified, setProgramVerified] = useState(false);
  const [programError, setProgramError] = useState<string | null>(null);

  // Authority Verification State (SIWS)
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [authorityVerified, setAuthorityVerified] = useState(false);
  const [authorityData, setAuthorityData] = useState<{
    authorityWallet: string;
    signature: string;
    message: string;
    authorityType: string;
  } | null>(null);

  // Step 3: Socials
  const [githubOrgUrl, setGithubOrgUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  // Step 4: Media
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // Step 5: Roadmap
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // GitHub Analysis State
  const [githubAnalysisResult, setGithubAnalysisResult] = useState<GitHubAnalysisResult | null>(null);

  // Project lookup hook
  const { data: existingProject, refetch: refetchProject } = useProject(programId);

  // FIX #2: Redirect if user already has a verified profile
  useEffect(() => {
    if (!checkingExisting && existingProfileData?.hasProfile && existingProfileData.profileId) {
      // User already has a profile - show toast and redirect
      toast({
        title: 'Profile Already Exists',
        description: 'Redirecting to your dashboard...',
      });
      navigate('/dashboard');
    }
  }, [checkingExisting, existingProfileData, navigate, toast]);

  // Sync step with auth state
  useEffect(() => {
    if (isAuthenticated && currentStep === 1) {
      setCurrentStep(2);
    } else if (!isAuthenticated && currentStep > 1) {
      setCurrentStep(1);
    }
  }, [isAuthenticated, currentStep]);

  // FIX #2: Clear the auth=fresh param after processing to prevent issues on refresh
  useEffect(() => {
    if (authFresh && isAuthenticated) {
      setSearchParams({}, { replace: true });
    }
  }, [authFresh, isAuthenticated, setSearchParams]);

  // Persist form state to localStorage to survive wallet redirects
  useEffect(() => {
    const formData = {
      projectName,
      description,
      category,
      country,
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
  }, [projectName, description, category, country, websiteUrl, programId, githubOrgUrl, discordUrl, telegramUrl, currentStep, mediaAssets, milestones]);

  // Restore form state on mount
  useEffect(() => {
    const saved = localStorage.getItem('claimFormProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.projectName) setProjectName(data.projectName);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.country) setCountry(data.country);
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

    // Allow valid program IDs (either in DB or valid format - base58, 32-44 chars)
    const isValidProgramId = result.data || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(programId);

    if (isValidProgramId) {
      setProgramVerified(true);
      // Show authority verification modal for on-chain programs
      setShowAuthorityModal(true);
    } else {
      setProgramError('Invalid Program ID. Please check and try again.');
    }

    setProgramLoading(false);
  };

  // Handle authority verification completion
  const handleAuthorityVerified = (data: {
    authorityWallet: string;
    signature: string;
    message: string;
    authorityType: string;
  }) => {
    setAuthorityData(data);
    setAuthorityVerified(true);
    setShowAuthorityModal(false);
    toast({
      title: 'Authority Verified',
      description: 'Your wallet has been cryptographically verified as the program authority.',
    });
  };

  const handleGitHubConnect = () => {
    // All user data is stored in the claimingProfile object below
    // No separate localStorage entries needed for individual fields

    // Store form data for retrieval after OAuth callback
    const claimingProfile = {
      projectName,
      description,
      category,
      country,
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
      // Authority verification data (SIWS)
      authorityWallet: authorityData?.authorityWallet,
      authoritySignature: authorityData?.signature,
      authorityMessage: authorityData?.message,
      authorityType: authorityData?.authorityType,
      authorityVerified,
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

  // Handle GitHub analysis completion with auto-population
  const handleAnalysisComplete = (result: GitHubAnalysisResult) => {
    setGithubAnalysisResult(result);
    setGithubOrgUrl(result.htmlUrl);

    // Auto-populate empty fields
    if (!projectName && result.name) {
      setProjectName(result.name);
    }
    if (!description && result.description) {
      setDescription(result.description);
    }
    if (!websiteUrl && result.homepage) {
      setWebsiteUrl(result.homepage);
    }
    if (!category && result.language) {
      const suggestedCat = suggestCategory(result.language, result.topics);
      if (suggestedCat) {
        setCategory(suggestedCat as ProjectCategory);
      }
    }

    toast({
      title: 'Repository Analyzed',
      description: `Score: ${result.resilienceScore}/100 | ${result.commitsLast30Days} commits in last 30 days`,
    });
  };

  // FIX #1: Direct submit for public repos (no GitHub OAuth needed)
  const handleDirectSubmit = async () => {
    if (!githubAnalysisResult || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const profileId = crypto.randomUUID();
      
      const profileData = {
        id: profileId,
        project_name: projectName,
        description: description || null,
        category: category || null,
        country: country || null,
        website_url: websiteUrl || null,
        program_id: programId || null,
        claimer_wallet: connected && publicKey ? publicKey.toBase58() : null,
        github_org_url: githubAnalysisResult.htmlUrl,
        x_user_id: user.id,
        x_username: user.username,
        discord_url: discordUrl || null,
        telegram_url: telegramUrl || null,
        media_assets: JSON.parse(JSON.stringify(mediaAssets)),
        milestones: JSON.parse(JSON.stringify(milestones)),
        verified: true,
        verified_at: new Date().toISOString(),
        resilience_score: githubAnalysisResult.resilienceScore,
        liveness_status: githubAnalysisResult.livenessStatus,
        github_stars: githubAnalysisResult.stars,
        github_forks: githubAnalysisResult.forks,
        github_contributors: githubAnalysisResult.contributors,
        github_language: githubAnalysisResult.language || null,
        github_last_activity: githubAnalysisResult.pushedAt || null,
        github_commit_velocity: githubAnalysisResult.commitVelocity || null,
        github_commits_30d: githubAnalysisResult.commitsLast30Days || null,
        github_open_issues: githubAnalysisResult.openIssues || null,
        github_topics: githubAnalysisResult.topics || null,
        github_is_fork: githubAnalysisResult.isFork || false,
        github_analyzed_at: new Date().toISOString(),
        // Authority verification data (SIWS)
        authority_wallet: authorityData?.authorityWallet || null,
        authority_verified_at: authorityVerified ? new Date().toISOString() : null,
        authority_signature: authorityData?.signature || null,
        authority_type: authorityData?.authorityType || null,
      };
      
      const { error } = await supabase
        .from('claimed_profiles')
        .insert([profileData]);
      
      if (error) throw error;
      
      localStorage.removeItem('claimFormProgress');
      localStorage.removeItem('claimingProfile');
      localStorage.setItem('verifiedProfileId', profileId);
      
      toast({ 
        title: 'Profile Created!', 
        description: 'Your protocol is now registered in the Resilience Registry.' 
      });
      navigate(`/profile/${profileId}`);
      
    } catch (err) {
      console.error('Direct submit error:', err);
      toast({ 
        title: 'Registration Error', 
        description: err instanceof Error ? err.message : 'Failed to create profile', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromStep2 = projectName.trim() && category;
  const canProceedFromStep3 = githubOrgUrl.trim() || !!githubAnalysisResult;

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

  // Show loading while checking auth or existing profile
  if (authLoading || checkingExisting) {
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
                country={country}
                setCountry={setCountry}
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-primary">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-mono">{programId.slice(0, 12)}...</span>
                          </div>
                          {authorityVerified ? (
                            <div className="flex items-center gap-2 text-xs text-primary">
                              <Shield className="h-3 w-3" />
                              <span className="font-mono uppercase text-[10px]">VERIFIED TITAN</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setShowAuthorityModal(true)}
                              variant="outline"
                              size="sm"
                              className="w-full font-display text-[10px] uppercase tracking-wider"
                            >
                              <Shield className="mr-1.5 h-3 w-3" />
                              VERIFY AUTHORITY
                            </Button>
                          )}
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
                githubConnected={githubVerified}
                analysisResult={githubAnalysisResult}
                onAnalysisComplete={handleAnalysisComplete}
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
                    // Case 1: GitHub OAuth was used - show view profile button
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
                  ) : githubAnalysisResult ? (
                    // Case 2: Public repo was analyzed - direct submit without OAuth
                    <>
                      <div className="mb-4 flex items-center justify-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-display text-sm uppercase">
                          Repository Analyzed • Score: {githubAnalysisResult.resilienceScore}
                        </span>
                      </div>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Your public repository has been verified. Click below to complete your registration.
                      </p>
                      <Button
                        onClick={handleDirectSubmit}
                        disabled={isSubmitting}
                        className="w-full font-display font-semibold uppercase tracking-wider"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            REGISTERING...
                          </>
                        ) : (
                          'COMPLETE REGISTRATION'
                        )}
                      </Button>
                    </>
                  ) : (
                    // Case 3: No analysis yet - require GitHub OAuth (for private repos)
                    <>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        Connect your GitHub to verify a private repository and complete registration.
                      </p>
                      <Button
                        onClick={handleGitHubConnect}
                        className="w-full font-display font-semibold uppercase tracking-wider"
                        size="lg"
                      >
                        CONNECT GITHUB & COMPLETE
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation - hide back button after verification OR public repo analysis */}
              {!githubVerified && !githubAnalysisResult && (
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
              )}
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

          {/* Authority Verification Modal */}
          <AuthorityVerificationModal
            isOpen={showAuthorityModal}
            onClose={() => setShowAuthorityModal(false)}
            programId={programId}
            onVerificationComplete={handleAuthorityVerified}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ClaimProfile;
