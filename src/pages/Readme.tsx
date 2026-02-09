import { Link } from 'react-router-dom';
import {
  BookOpen,
  Target,
  BarChart3,
  Palette,
  Rocket,
  Users,
  Database,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Zap,
  Brain,
  Heart,
  Coins,
  Map,
  CheckCircle2,
  ArrowRight,
  Network,
  GitBranch,
} from 'lucide-react';
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  TableOfContents,
  ScoreColorsLegend,
  HealthDotsLegend,
  IconsLegend,
  TierLabelsLegend,
  IntegratedScoreFormula,
  DecayFormula,
  DimensionBreakdown,
} from '@/components/readme';
import { useHeroStats } from '@/hooks/useHeroStats';
import { useRoadmapStats } from '@/hooks/useRoadmapStats';
import { Clock } from 'lucide-react';

export default function Readme() {
  const { data: stats } = useHeroStats();
  const { data: roadmapStats } = useRoadmapStats();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-wider">
              PUBLIC DOCUMENTATION
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-foreground mb-4">
              RESILIENCE{' '}
              <span className="text-primary">README</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The definitive guide to decentralized project health monitoring on Solana.
              Understand our scoring methodology, visual indicators, and how to use the platform.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              <div className="rounded-sm border border-border bg-card/50 px-4 py-3">
                <p className="font-mono text-2xl font-bold text-primary">
                  {stats?.registryCount || '—'}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  REGISTRY
                </p>
              </div>
              <div className="rounded-sm border border-border bg-card/50 px-4 py-3">
                <p className="font-mono text-2xl font-bold text-primary">
                  {stats?.averageScore || '—'}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  AVG SCORE
                </p>
              </div>
              <div className="rounded-sm border border-border bg-card/50 px-4 py-3">
                <p className="font-mono text-2xl font-bold text-primary">
                  {stats?.activeCount || '—'}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  ACTIVE
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-display uppercase tracking-wider">
                <Link to="/explorer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Explore Registry
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-display uppercase tracking-wider">
                <Link to="/claim-profile">
                  <Rocket className="mr-2 h-4 w-4" />
                  Join as Builder
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with TOC */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="flex gap-8">
          {/* Sticky TOC */}
          <TableOfContents />

          {/* Content */}
          <div className="flex-1 max-w-4xl space-y-16">
            {/* Overview Section */}
            <section id="overview" className="scroll-mt-24">
              <SectionHeader icon={BookOpen} title="Overview" />
              <Card className="card-premium">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    <strong className="text-foreground">Resilience</strong> is a decentralized assurance layer and indexing 
                    service that combines off-chain development signals (GitHub, dependencies, bytecode) with on-chain 
                    infrastructure activity to create immutable, verifiable proof-of-maintenance and continuity for Solana projects.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our core belief: <strong className="text-primary">"Reputation cannot be forked."</strong> While 
                    code can be copied, the human effort behind continuous maintenance, governance participation, 
                    and community building creates unique trust signals that define a project's true resilience.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The platform serves two primary audiences:
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Public Visitors ("The Fish")</strong> — Seeking data-backed 
                        transparency before integrating or investing in projects
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Rocket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Project Builders ("The Eagles")</strong> — Proving their 
                        work through immutable trust scores and commitment staking
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Core Concepts Section */}
            <section id="core-concepts" className="scroll-mt-24">
              <SectionHeader icon={Brain} title="Core Concepts" />
              
              <div id="zero-proof" className="scroll-mt-24 mb-8">
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                  Zero Proof Philosophy
                </h3>
                <Card className="card-premium">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Every new project starts with a <strong className="text-primary">baseline of 15-30 points</strong>.
                      This "Zero Proof" approach ensures no project receives credit without demonstrating sustained 
                      proof-of-work across all trust dimensions.
                    </p>
                    <div className="rounded-sm bg-muted/30 p-4 border border-border">
                      <p className="font-mono text-sm text-primary mb-2">BASELINE CALCULATION:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• New project with basic GitHub: <span className="text-foreground">~15 points</span></li>
                        <li>• Active development, no governance: <span className="text-foreground">~35 points</span></li>
                        <li>• Full multi-dimensional activity: <span className="text-foreground">70+ points</span></li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="four-dimensions" className="scroll-mt-24">
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                  Four Dimensions of Trust
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <DimensionCard
                    icon={Brain}
                    title="Brain"
                    subtitle="Code Activity"
                    description="GitHub commits, contributors, PRs, and release velocity"
                    weight="40%"
                    question="Is development continuously happening?"
                    bullets={[
                      "GitHub commits (sustained activity)",
                      "Pull requests (ongoing code review)",
                      "Release frequency (regular deployments)",
                      "Contributor consistency (team continuity)",
                      "Days since last commit (recency signal)",
                    ]}
                  />
                  <DimensionCard
                    icon={Zap}
                    title="Nervous System"
                    subtitle="Dependencies"
                    description="Supply chain health, outdated crates, vulnerabilities"
                    weight="25%"
                    question="Is the dependency supply chain being continuously maintained?"
                    bullets={[
                      "Crates.io version freshness (not rotting dependencies)",
                      "Security advisory tracking (staying current)",
                      "Maintenance lag (how behind are you?)",
                      "Vulnerability response (do they fix critical issues?)",
                    ]}
                  />
                  <DimensionCard
                    icon={Heart}
                    title="Heart"
                    subtitle="Governance"
                    description="Multisig/DAO activity, decentralization level"
                    weight="20%"
                    question="Is governance continuously participating?"
                    bullets={[
                      "Multisig/DAO transaction frequency (active governance)",
                      "Last governance action (recency)",
                      "Decentralization level (not founder-controlled)",
                      "Governance participation rate (are people actually voting?)",
                    ]}
                  />
                  <DimensionCard
                    icon={Coins}
                    title="Limbs"
                    subtitle="Economic"
                    description="TVL, market share, risk ratios"
                    weight="15%"
                    question="Is there sustained economic commitment?"
                    bullets={[
                      "TVL (economic stake in the project)",
                      "Risk ratio (TVL relative to maintenance effort)",
                      "Market share (is it growing or declining?)",
                      "User activity (is the protocol actually being used?)",
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* Scoring Methodology Section */}
            <section id="scoring" className="scroll-mt-24">
              <SectionHeader icon={BarChart3} title="Scoring Methodology" />
              
              <IntegratedScoreFormula />

              <div className="grid gap-8 mt-8">
                <div id="github-score" className="scroll-mt-24">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    GitHub Activity (40%)
                  </h3>
                  <Card className="card-premium">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4">
                        Code activity is the primary trust signal, weighted to prioritize meaningful work over synthetic noise.
                      </p>
                      <div className="space-y-3">
                        <MetricRow label="Pull Request Events" weight="2.5×" description="Feature development, code review" />
                        <MetricRow label="Release Events" weight="10×" description="Published versions, deployments" />
                        <MetricRow label="Issue Events" weight="0.5×" description="Bug reports, feature requests" />
                        <MetricRow label="Push Events" weight="1.0×" description="Standard commits (0 if docs-only)" />
                      </div>
                      <div className="mt-4 p-3 rounded-sm bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-destructive">Anti-Gaming:</strong> Fork repos receive 0.3× penalty. 
                          Daily contributions capped at 10 events. Requires 3+ unique contributors for ACTIVE status.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div id="dependency-score" className="scroll-mt-24">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    Dependency Health (25%)
                  </h3>
                  <Card className="card-premium">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4">
                        Analyzed from <code className="font-mono text-primary">Cargo.toml</code> against the crates.io registry.
                      </p>
                      <div className="space-y-3">
                        <MetricRow label="Outdated Count" weight="−5 each" description="Crates behind latest version" />
                        <MetricRow label="Critical Count" weight="−10 each" description="Known vulnerabilities" />
                        <MetricRow label="Maintenance Lag" weight="Decay" description="Average days behind" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div id="governance-score" className="scroll-mt-24">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    Governance (20%)
                  </h3>
                  <Card className="card-premium">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4">
                        Fetched via Solana RPC for Squads multisig or Realms DAO addresses.
                      </p>
                      <div className="space-y-3">
                        <MetricRow label="Transactions (30d)" weight="5+ = Active" description="Recent multisig/DAO activity" />
                        <MetricRow label="Last Activity" weight="Recency" description="Time since last governance action" />
                        <MetricRow label="Decentralization" weight="Bonus" description="Multiple signers, low threshold" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div id="tvl-score" className="scroll-mt-24">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    TVL/Economic (15%)
                  </h3>
                  <Card className="card-premium">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4">
                        Only applicable to DeFi projects. Data from DeFiLlama API.
                      </p>
                      <div className="space-y-3">
                        <MetricRow label="Total Value Locked" weight="$10M+" description="Economic stake in project" />
                        <MetricRow label="Risk Ratio" weight="TVL/Commits" description="Economic responsibility per effort" />
                        <MetricRow label="Market Share" weight="Category %" description="Position within DeFi segment" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div id="decay" className="scroll-mt-24">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    Decay Rate
                  </h3>
                  <DecayFormula />
                </div>
              </div>
            </section>

            {/* Visual Indicators Section */}
            <section id="indicators" className="scroll-mt-24">
              <SectionHeader icon={Palette} title="Visual Indicators" />
              
              <div id="score-colors" className="scroll-mt-24 mb-8">
                <ScoreColorsLegend />
              </div>

              <div id="health-dots" className="scroll-mt-24 mb-8">
                <HealthDotsLegend />
              </div>

              <div id="status-icons" className="scroll-mt-24 mb-8">
                <IconsLegend />
              </div>

              <div id="tier-labels" className="scroll-mt-24">
                <TierLabelsLegend />
              </div>
            </section>

            {/* Platform Features Section */}
            <section id="features" className="scroll-mt-24">
              <SectionHeader icon={Target} title="Platform Features" />
              
              <div className="grid gap-4">
                <FeatureCard
                  title="Resilience Registry (Explorer)"
                  description="Browse and compare all indexed projects with sortable leaderboard, search, and category filters."
                  link="/explorer"
                />
                <FeatureCard
                  title="Titan Watch (Heatmap)"
                  description="Visual ecosystem overview with color-coded grid showing health status at a glance."
                  link="/explorer"
                />
                <FeatureCard
                  title="Heartbeat Dashboard"
                  description="Deep-dive into individual project health with score breakdown, activity charts, and trend analysis."
                  link="/explorer"
                />
                <FeatureCard
                  title="Build In Public Gallery"
                  description="Showcase development updates via embedded X/Twitter posts with native video playback."
                  link="/claim-profile"
                />
                <FeatureCard
                  title="Staking (Coming Soon)"
                  description="Stake tokens on projects you believe in. Economic skin-in-the-game for trust signals."
                  link="/staking"
                  badge="PHASE 2"
                />
              </div>
            </section>

            {/* For Builders Section */}
            <section id="for-builders" className="scroll-mt-24">
              <SectionHeader icon={Rocket} title="For Solana Builders" />
              
              <Card className="card-premium">
                <CardContent className="pt-6">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-4">
                    How to Join the Registry
                  </h3>
                  <ol className="space-y-4">
                    <StepItem
                      number={1}
                      title="Connect X Account"
                      description="Authenticate via X (Twitter) to establish your builder identity."
                    />
                    <StepItem
                      number={2}
                      title="Link GitHub Repository"
                      description="Submit your public repo URL for instant analysis, or connect via OAuth for private repos."
                    />
                    <StepItem
                      number={3}
                      title="Complete Profile"
                      description="Add description, category, team members, social links, and media assets."
                    />
                    <StepItem
                      number={4}
                      title="Verify Authority (Optional)"
                      description="Sign a message with your program authority wallet for cryptographic verification."
                    />
                    <StepItem
                      number={5}
                      title="Get Analyzed"
                      description="Our system fetches metrics from GitHub, crates.io, DeFiLlama, and Solana RPC."
                    />
                  </ol>

                </CardContent>
              </Card>

              {/* How to Improve Continuity Card */}
              <Card className="card-premium mt-6">
                <CardContent className="pt-6">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground mb-2">
                    How to Improve Continuity
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    To Increase Your Resilience Score (Prove Continuity):
                  </p>

                  <Accordion type="multiple" className="space-y-2">
                    <AccordionItem value="brain" className="border border-border rounded-sm px-4 bg-card/50">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">1</div>
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Brain Continuity</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Commit code consistently (every 2-3 days)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Merge PRs regularly (not batch updates)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Release versions formally (not just commits)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Maintain 3+ active contributors (team continuity)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="nervous" className="border border-border rounded-sm px-4 bg-card/50">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">2</div>
                          <div className="flex items-center gap-2">
                            <Network className="h-4 w-4 text-primary" />
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Nervous System Continuity</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Run <code className="font-mono text-primary">cargo update</code> monthly (keep dependencies fresh)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Address security advisories immediately (not delayed)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Monitor crates.io for new versions (stay current)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Test updated dependencies before deploying</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="heart" className="border border-border rounded-sm px-4 bg-card/50">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">3</div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Heart Continuity</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Use multisig or DAO governance (Squads, Realms)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Vote on proposals regularly (5+ votes/month)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Maintain multiple signers (decentralization)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Publish governance decisions publicly</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="limbs" className="border border-border rounded-sm px-4 bg-card/50">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">4</div>
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-primary" />
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Limbs Continuity</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Maintain economic activity (actual usage, not fake TVL)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Match maintenance effort to TVL (responsible risk)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Track and improve user retention</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Diversify user base (not one whale)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="overall" className="border border-border rounded-sm px-4 bg-card/50">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">5</div>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-primary" />
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Overall Continuity</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Post "Building in Public" updates (X/Twitter)</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Set Commitment Lock milestones publicly</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Respond to issues and community questions</li>
                          <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />Maintain consistent activity (not sporadic)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Product Roadmap Section */}
            <section id="roadmap" className="scroll-mt-24">
              <SectionHeader icon={Map} title="Product Roadmap" />

              <Accordion type="single" collapsible defaultValue="phase-1" className="space-y-4">
                {/* Phase 1 */}
                <AccordionItem value="phase-1" className="border border-border rounded-sm bg-card/50">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 font-mono text-xs">IN PROGRESS</Badge>
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Phase 1: Resilience Registry</span>
                      <span className="text-xs text-muted-foreground ml-auto mr-4 font-mono">Months 1-3</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm text-primary font-medium mb-3">"Proof-of-Maintenance for All Solana Infrastructure"</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Public good foundation layer that creates transparency around project continuity across Solana.
                    </p>
                    <div className="space-y-2 mb-6">
                      {[
                        { text: 'Automated scoring for 500+ Solana projects', ongoing: true },
                        { text: 'GitHub + Crates.io + DeFiLlama + Solana RPC integration' },
                        { text: 'Public Explorer with sortable leaderboard' },
                        { text: 'Heartbeat Dashboard with continuity trends' },
                        { text: 'X integration for builder profiles' },
                        { text: 'Verified builder badges ("Ownership Handshake")' },
                        { text: 'Zero-proof baseline scoring methodology' },
                        { text: 'Tier classification (TITAN to CRITICAL)' },
                        { text: 'Continuity decay calculations' },
                        { text: 'Health dimension indicators' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          {item.ongoing ? (
                            <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-chart-4 shrink-0" />
                          )}
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-muted/30 p-4 border border-border">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">IMPACT</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><p className="font-mono text-lg font-bold text-primary">{roadmapStats?.scoredProjects ?? '—'}</p><p className="text-xs text-muted-foreground">Scored Projects</p></div>
                        <div><p className="font-mono text-lg font-bold text-primary">{roadmapStats?.claimedProfiles ?? '—'}</p><p className="text-xs text-muted-foreground">Claimed Profiles</p></div>
                        <div><p className="font-mono text-lg font-bold text-primary">{roadmapStats?.unclaimedProfiles ?? '—'}</p><p className="text-xs text-muted-foreground">Unclaimed Profiles</p></div>
                        <div><p className="font-mono text-lg font-bold text-yellow-500">Application Ongoing</p><p className="text-xs text-muted-foreground">Solana Grant</p></div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Phase 2 */}
                <AccordionItem value="phase-2" className="border border-border rounded-sm bg-card/50">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xs">PLANNED</Badge>
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Phase 2: Economic Commitment Layer</span>
                      <span className="text-xs text-muted-foreground ml-auto mr-4 font-mono">Months 4-6</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm text-primary font-medium mb-3">"Skin-in-the-Game for Builders & Believers"</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Freemium model where developers earn yield by maintaining continuity.
                    </p>
                    <div className="space-y-2 mb-6">
                      {[
                        'Staking mechanism (lock tokens on projects)',
                        'Conditional yield (5-15% annual based on Resilience Score continuity)',
                        'Yield pauses if score drops (incentive alignment)',
                        '"Building in Public" gallery (X posts + embedded videos)',
                        'Commitment Lock feature (public milestone tracking)',
                        'Portfolio tracking for stakers',
                        'Continuity leaderboard (top-maintained projects)',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-muted/30 p-4 border border-border">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">HOW IT WORKS</p>
                      <div className="space-y-3">
                        {[
                          { step: '1', text: 'Developer maintains protocol → Resilience Score stays healthy' },
                          { step: '2', text: 'Investor stakes on developer → Earns yield continuously' },
                          { step: '3', text: 'Maintenance stops → Score drops → Yield pauses' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary shrink-0">{item.step}</div>
                            <span className="text-muted-foreground">{item.text}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 text-sm mt-2 pt-2 border-t border-border">
                          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-foreground font-medium">Outcome: Aligned incentives between builders and believers</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Phase 3 */}
                <AccordionItem value="phase-3" className="border border-border rounded-sm bg-card/50">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xs">PLANNED</Badge>
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Phase 3: Ecosystem Integration</span>
                      <span className="text-xs text-muted-foreground ml-auto mr-4 font-mono">Months 7-12</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm text-primary font-medium mb-3">"Infrastructure API for Continuity Management"</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enterprise SaaS layer where wallets, DEXs, and institutions consume Resilience continuity data in real-time.
                    </p>
                    <div className="space-y-2 mb-6">
                      {[
                        'Enterprise API with webhooks (real-time score updates)',
                        'Continuity alerts (instant notifications of changes)',
                        'Wallet integration (show continuity status during swaps)',
                        'DEX integration (risk warnings for low-continuity projects)',
                        'Enterprise dashboard (API keys, alerts, compliance)',
                        'Compliance reporting (prove your continuity to regulators)',
                        'White-label dashboard (projects embed their continuity)',
                        'Historical continuity charts (90+ days of trend data)',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-muted/30 p-4 border border-border">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">USE CASES</p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong className="text-foreground">Phantom:</strong> Show Resilience Score and continuity on token interactions</p>
                        <p><strong className="text-foreground">Jupiter:</strong> Warn traders if they're swapping low-continuity tokens</p>
                        <p><strong className="text-foreground">Institutions:</strong> Monitor continuous commitment of portfolio projects</p>
                        <p><strong className="text-foreground">Audit Firms:</strong> Define scope based on continuity dependencies</p>
                        <p><strong className="text-foreground">Protocols:</strong> Showcase continuity history to investors</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Phase 4 */}
                <AccordionItem value="phase-4" className="border border-border rounded-sm bg-card/50">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono text-xs">PLANNED</Badge>
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Phase 4: AEGIS Supply Chain Monitor</span>
                      <span className="text-xs text-muted-foreground ml-auto mr-4 font-mono">Months 13+</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm text-primary font-medium mb-3">"Real-Time Continuity Cascade Detection"</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enterprise risk management layer that maps live CPI dependencies and prevents cascading failures across Solana.
                    </p>
                    <div className="space-y-2 mb-6">
                      {[
                        'Geyser plugin for real-time CPI indexing',
                        'Graph database of all on-chain dependencies',
                        'Continuity cascade detection',
                        'Supply chain continuity alerts',
                        'Institutional risk dashboard',
                        'Compliance reporting (prove you\'re not exposed)',
                        'Audit scope definition (based on continuity dependencies)',
                        'Risk scoring (which protocols are most at-risk?)',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-sm bg-muted/30 p-4 border border-border">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">HOW AEGIS LEVERAGES PHASES 1-3</p>
                      <div className="space-y-2 font-mono text-sm">
                        <p className="text-muted-foreground">Phase 1: <span className="text-foreground">Immutable Continuity History</span></p>
                        <div className="pl-4 text-muted-foreground/50">↓</div>
                        <p className="text-muted-foreground">Phase 2: <span className="text-foreground">Economic Continuity Signals</span></p>
                        <div className="pl-4 text-muted-foreground/50">↓</div>
                        <p className="text-muted-foreground">Phase 3: <span className="text-foreground">Real-Time API Infrastructure</span></p>
                        <div className="pl-4 text-muted-foreground/50">↓</div>
                        <p className="text-primary font-medium">Phase 4: Cascade Risk Prediction</p>
                        <p className="text-xs text-muted-foreground mt-1">(combines all signals to prevent failures)</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Data Provenance Section */}
            <section id="data-provenance" className="scroll-mt-24">
              <SectionHeader icon={Database} title="Data Provenance" />
              
              <Card className="card-premium">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-6">
                    We believe in radical transparency. All data sources and refresh cadences are documented below.
                  </p>

                  <div className="space-y-6">
                    <DataSourceItem
                      name="GitHub API"
                      description="Commits, Contributors, Releases, Events, Statistics endpoints"
                      refresh="Every 2 hours via cron + Manual"
                    />
                    <DataSourceItem
                      name="Crates.io Registry"
                      description="Cargo.toml parsing for Rust dependency analysis"
                      refresh="Every 6 hours via cron + Manual"
                    />
                    <DataSourceItem
                      name="DeFiLlama API"
                      description="TVL data for DeFi protocols via protocol name mapping"
                      refresh="Every 5 minutes (real-time)"
                    />
                    <DataSourceItem
                      name="Solana RPC"
                      description="Governance transaction history for Squads/Realms addresses"
                      refresh="Every 30 minutes"
                    />
                    <DataSourceItem
                      name="OtterSec API"
                      description="Bytecode fingerprinting for originality classification"
                      refresh="On verification request (static)"
                    />
                  </div>

                  <div className="mt-6 p-4 rounded-sm bg-muted/30 border border-border">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      SCORE HISTORY
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All score snapshots are stored with full metric breakdowns for trend visualization.
                      Historical data enables 7-day sparkline charts and long-term analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-24">
              <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" />
              
              <Accordion type="single" collapsible className="space-y-2">
                <FAQItem
                  value="refresh"
                  question="How often is data refreshed?"
                  answer="Data refreshes on a tiered schedule optimized for each dimension's volatility: TVL updates every 5 minutes for real-time DeFi tracking, Governance checks every 30 minutes for DAO activity, GitHub refreshes every 2 hours, and Dependencies refresh every 6 hours. Protocol owners can also trigger a full manual refresh from their dashboard that analyzes all 4 dimensions simultaneously."
                />
                <FAQItem
                  value="dispute"
                  question="Can I dispute my score?"
                  answer="Scores are algorithmically calculated from public data sources. If you believe there's an error, ensure your GitHub repository is correctly linked and your governance addresses are properly configured. Contact our team if data appears incorrect."
                />
                <FAQItem
                  value="no-github"
                  question="What if my project isn't on GitHub?"
                  answer="Currently, Resilience requires a public GitHub repository for code activity analysis. Projects without GitHub will score 0 on the GitHub dimension (40% of total score). We're exploring support for other version control systems."
                />
                <FAQItem
                  value="staking"
                  question="How does staking work?"
                  answer="Staking is a Phase 2 feature coming soon. Users will be able to stake tokens on protocols they trust, creating economic skin-in-the-game. Stakers earn yield while protocols gain additional trust signals."
                />
                <FAQItem
                  value="public-data"
                  question="Is this data public?"
                  answer="Yes! Resilience operates as a public good. All indexed protocol data is viewable by anyone. The registry provides data-backed transparency for the entire ecosystem."
                />
                <FAQItem
                  value="private-repos"
                  question="Can I use private repositories?"
                  answer="Yes, via GitHub OAuth integration. Connect your GitHub account to grant read access to private repos. We only fetch metadata and activity metrics—no code is stored."
                />
                <FAQItem
                  value="delete-profile"
                  question="Can I delete my profile?"
                  answer="Profile owners can delete their registry entry from the Dashboard. This removes all associated data including score history, team members, and media assets."
                />
              </Accordion>
            </section>

            {/* Footer CTA */}
            <section className="pt-8 border-t border-border">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Join the Resilience Registry and prove your project's commitment to the Solana ecosystem.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="font-display uppercase tracking-wider">
                    <Link to="/claim-profile">
                      <Rocket className="mr-2 h-4 w-4" />
                      Join the Registry
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-display uppercase tracking-wider">
                    <Link to="/explorer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Browse Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Helper Components

function SectionHeader({ icon: Icon, title }: { icon: typeof BookOpen; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="rounded-sm bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        {title}
      </h2>
    </div>
  );
}

function DimensionCard({
  icon: Icon,
  title,
  subtitle,
  description,
  weight,
  question,
  bullets,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
  description: string;
  weight: string;
  question?: string;
  bullets?: string[];
}) {
  const [open, setOpen] = useState(false);
  const isExpandable = question && bullets && bullets.length > 0;

  return (
    <Card
      className={`card-premium ${isExpandable ? 'cursor-pointer' : ''}`}
      onClick={() => isExpandable && setOpen(!open)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-sm bg-primary/10 p-2 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {weight}
                </Badge>
                {isExpandable && (
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
            </div>
            <p className="text-sm text-primary mb-1">{subtitle}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {isExpandable && open && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-primary mb-3">{question}</p>
            <ul className="space-y-1.5">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  weight,
  description,
}: {
  label: string;
  weight: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="font-medium text-foreground w-40">{label}</span>
      <span className="font-mono text-primary w-24">{weight}</span>
      <span className="text-muted-foreground flex-1">{description}</span>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  link,
  badge,
}: {
  title: string;
  description: string;
  link: string;
  badge?: string;
}) {
  return (
    <Link to={link}>
      <Card className="card-premium hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  {title}
                </h3>
                {badge && (
                  <Badge variant="outline" className="font-mono text-xs text-primary">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

function DataSourceItem({
  name,
  description,
  refresh,
}: {
  name: string;
  description: string;
  refresh: string;
}) {
  return (
    <div className="border-l-2 border-primary/30 pl-4">
      <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground mb-1">
        {name}
      </h4>
      <p className="text-sm text-muted-foreground mb-1">{description}</p>
      <p className="font-mono text-xs text-primary">Refresh: {refresh}</p>
    </div>
  );
}

function FAQItem({
  value,
  question,
  answer,
}: {
  value: string;
  question: string;
  answer: string;
}) {
  return (
    <AccordionItem value={value} className="border border-border rounded-sm px-4 bg-card/50">
      <AccordionTrigger className="font-display text-sm font-medium uppercase tracking-wider text-foreground hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
