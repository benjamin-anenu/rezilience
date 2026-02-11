import { Brain, Network, Heart, Coins, Search, ShieldCheck, Lock, Globe, BookOpen, GitBranch, Users, TrendingUp, Database, Activity, ExternalLink, CheckCircle, ArrowRight, Zap, Eye, Target, BarChart3, Shield } from 'lucide-react';
import { useHeroStats } from '@/hooks/useHeroStats';
import { useRoadmapStats } from '@/hooks/useRoadmapStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import founderImg from '@/assets/founder-benjamin.png';
import ecosystemImg from '@/assets/resilience-ecosystem.png';

/* ─── shared layout ─── */
function SlideLayout({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative h-full w-full flex flex-col justify-center px-[120px] py-[80px] ${className}`}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-sm bg-primary/15 px-3 py-1 font-mono text-[14px] text-primary">{children}</span>;
}

function StatBox({ label, value, mono = true }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-sm border border-border bg-card/50 px-8 py-6">
      <span className={`text-[42px] font-bold text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
      <span className="text-[16px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─── SLIDE 1: TITLE ─── */
export function TitleSlide() {
  const { data: stats } = useHeroStats();
  return (
    <SlideLayout className="items-center text-center">
      <Tag>SOLANA FOUNDATION GRANT APPLICATION</Tag>
      <h1 className="mt-8 font-bold text-[72px] leading-[1.1] tracking-tight text-foreground">
        Reputation Can't <br />Be Forked.
      </h1>
      <p className="mt-6 max-w-[800px] text-[24px] leading-relaxed text-muted-foreground">
        <span className="text-primary font-semibold">Resilience</span> — Decentralized Assurance Layer for Solana.
        <br />Multi-dimensional Proof-of-Life for every project — on-chain and off-chain.
      </p>
      {stats && (
        <div className="mt-12 flex gap-6">
          <StatBox label="Registry" value={stats.registryCount} />
          <StatBox label="Active" value={stats.activeCount} />
          <StatBox label="Avg Score" value={stats.averageScore} />
        </div>
      )}
      <p className="mt-8 font-mono text-[13px] text-muted-foreground/60">LIVE DATA FROM RESILIENCE REGISTRY</p>
    </SlideLayout>
  );
}

/* ─── SLIDE 2: THE VISION ─── */
export function VisionSlide() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      <img src={ecosystemImg} alt="Resilience Ecosystem — Code, Liveness, Originality, Governance, Dependencies, Economics" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="relative z-10 flex flex-col items-center text-center mt-[55%]">
        <Tag>THE VISION</Tag>
        <h2 className="mt-4 text-[56px] font-bold text-foreground leading-tight">
          The Assurance Layer of Solana
        </h2>
        <p className="mt-4 max-w-[700px] text-[20px] text-muted-foreground">
          Bridging Builders and the Public through transparent, verifiable project health data.
        </p>
      </div>
    </div>
  );
}

/* ─── SLIDE 3: THE PROBLEM ─── */
export function ProblemSlide() {
  const problems = [
    { icon: Eye, title: 'No Real-Time Milestone Tracking', desc: 'The public has no way to track project commitments, progress, or delivery in real-time.' },
    { icon: Target, title: 'No Data-Backed Community Staking', desc: 'No bridge for the community to back projects based on verifiable data rather than social media hype.' },
    { icon: GitBranch, title: 'Forks & Clones Erode Integrity', desc: 'Code can be forked in seconds — reputation and maintenance history cannot be copied.' },
    { icon: BarChart3, title: 'Billions in TVL, Zero Health Telemetry', desc: 'DeFi protocols and off-chain tools secure massive value with no continuous health monitoring.' },
  ];
  return (
    <SlideLayout>
      <Tag>THE PROBLEM</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        The Transparency Gap
      </h2>
      <p className="mt-4 max-w-[700px] text-[20px] text-muted-foreground">
        Solana mastered speed and deployment. Now it's time to master transparency and accountability.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-6">
        {problems.map((p) => (
          <div key={p.title} className="flex gap-5 rounded-sm border border-border bg-card/40 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-destructive/15">
              <p.icon className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-[15px] text-muted-foreground">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 4: THE SOLUTION ─── */
export function SolutionSlide() {
  const dimensions = [
    { icon: Brain, label: 'Brain', weight: '40%', desc: 'GitHub Activity', color: 'text-primary' },
    { icon: Network, label: 'Nervous System', weight: '25%', desc: 'Dependency Health', color: 'text-chart-2' },
    { icon: Heart, label: 'Heart', weight: '20%', desc: 'Governance', color: 'text-chart-4' },
    { icon: Coins, label: 'Limbs', weight: '15%', desc: 'TVL / Economics', color: 'text-chart-3' },
  ];
  return (
    <SlideLayout>
      <Tag>THE SOLUTION</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Multi-Dimensional Proof-of-Life
      </h2>
      <div className="mt-4 flex gap-8 text-[16px] text-muted-foreground">
        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> <strong className="text-foreground">The Public (The Fish)</strong> — Data-backed transparency</span>
        <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> <strong className="text-foreground">Builders (The Eagles)</strong> — Immutable trust scores</span>
      </div>
      <div className="mt-4 rounded-sm border border-primary/30 bg-primary/5 px-6 py-4 inline-block">
        <p className="font-mono text-[22px] text-primary">
          R = 0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL
        </p>
      </div>
      <p className="mt-3 text-[14px] text-muted-foreground">Covers on-chain programs AND off-chain projects equally.</p>
      <div className="mt-8 grid grid-cols-4 gap-6">
        {dimensions.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-3 rounded-sm border border-border bg-card/40 p-6 text-center">
            <d.icon className={`h-10 w-10 ${d.color}`} />
            <span className="text-[20px] font-semibold text-foreground">{d.label}</span>
            <span className="font-mono text-[28px] font-bold text-primary">{d.weight}</span>
            <span className="text-[14px] text-muted-foreground">{d.desc}</span>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 5: HOW IT WORKS ─── */
export function HowItWorksSlide() {
  const steps = [
    { num: '01', icon: Database, title: 'INDEX', desc: 'Automated multi-dimensional scoring of every registered Solana project — on-chain programs and off-chain tools alike. GitHub, dependencies, governance, and TVL analyzed continuously.' },
    { num: '02', icon: ShieldCheck, title: 'VERIFY', desc: 'On-chain: authority wallet SIWS for "Verified Titan" status. Off-chain: GitHub ownership proof for "Claimed" badge. Bytecode originality + dependency supply-chain health checks.' },
    { num: '03', icon: Lock, title: 'COMMIT', desc: 'Economic commitment through staked assurance bonds. Builders put skin in the game via Commitment Locks — public milestone tracking with timeline variance alerts.' },
  ];
  return (
    <SlideLayout>
      <Tag>HOW IT WORKS</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Three-Step Assurance Pipeline
      </h2>
      <div className="mt-10 grid grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <div key={s.num} className="relative flex flex-col items-start rounded-sm border border-border bg-card/40 p-8">
            <span className="font-mono text-[48px] font-bold text-primary/20">{s.num}</span>
            <div className="mt-2 flex items-center gap-3">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="text-[22px] font-bold tracking-wider text-foreground">{s.title}</h3>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{s.desc}</p>
            {i < 2 && (
              <ArrowRight className="absolute -right-5 top-1/2 h-6 w-6 text-primary/40 hidden xl:block" />
            )}
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 6: TRACTION ─── */
export function TractionSlide() {
  const { data: heroStats } = useHeroStats();
  const { data: roadmapStats } = useRoadmapStats();
  return (
    <SlideLayout>
      <Tag>TRACTION & METRICS</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Live From the Registry
      </h2>
      <p className="mt-3 text-[18px] text-muted-foreground">All numbers pulled in real-time from the production database.</p>
      <div className="mt-10 grid grid-cols-3 gap-6">
        <StatBox label="Programs Indexed" value={heroStats?.registryCount ?? '—'} />
        <StatBox label="Active Heartbeats" value={heroStats?.activeCount ?? '—'} />
        <StatBox label="Avg Resilience Score" value={heroStats?.averageScore ?? '—'} />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-6">
        <StatBox label="Scored Projects" value={roadmapStats?.scoredProjects ?? '—'} />
        <StatBox label="Claimed Profiles" value={roadmapStats?.claimedProfiles ?? '—'} />
        <StatBox label="Unclaimed" value={roadmapStats?.unclaimedProfiles ?? '—'} />
      </div>
      <p className="mt-6 font-mono text-[12px] text-muted-foreground/50 text-center">DATA REFRESHED EVERY 5 MINUTES • ZERO MOCK DATA</p>
    </SlideLayout>
  );
}

/* ─── SLIDE 7: OPENING NEW POSSIBILITIES ─── */
export function PossibilitiesSlide() {
  const items = [
    { icon: Activity, title: 'Public Milestone Tracking', desc: 'Real-time project progress — code commits, governance decisions, and delivery timelines — unified in one view.' },
    { icon: Coins, title: 'Economic Alignment', desc: 'Continuity Bonds let the public stake trust in projects backed by verifiable data, not social media hype.' },
    { icon: Network, title: 'Supply Chain Auditing', desc: 'Trace the ecosystem\'s dependency graph to warn when critical infrastructure is at risk.' },
    { icon: BookOpen, title: 'Grants Directory', desc: 'Curated funding resource for builders — a public good with no gatekeeping.' },
    { icon: Zap, title: 'Score Oracle', desc: 'Composable on-chain data architecture for protocol-level integrations and programmatic access.' },
  ];
  return (
    <SlideLayout>
      <Tag>OPENING NEW POSSIBILITIES</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        One Central System for What Matters
      </h2>
      <p className="mt-4 max-w-[900px] text-[18px] text-muted-foreground leading-relaxed">
        These capabilities exist individually across the ecosystem — block explorers track transactions, audit firms verify code, DeFi dashboards monitor TVL. But no single system unifies development health, supply chain integrity, governance activity, and economic data into one continuous, public assurance layer. <span className="text-foreground font-medium">Resilience brings it all together</span> — for builders and the public alike.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.title} className="flex gap-4 rounded-sm border border-border bg-card/40 p-5">
            <item.icon className="h-6 w-6 shrink-0 text-primary mt-1" />
            <div>
              <h3 className="text-[17px] font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-[14px] text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 8: COMPETITIVE LANDSCAPE ─── */
export function CompetitionSlide() {
  type Score = 'yes' | 'partial' | 'no';
  const features = [
    'Multi-dimensional scoring',
    'Continuous monitoring',
    'Bytecode verification',
    'Dependency health',
    'Governance tracking',
    'TVL risk analysis',
    'Economic staking',
    'Open methodology',
  ];
  const competitors: { name: string; scores: Score[] }[] = [
    { name: 'Solscan / FM',   scores: ['no','no','no','no','no','no','no','no'] },
    { name: 'CertiK Skynet',  scores: ['partial','no','yes','no','no','no','no','no'] },
    { name: 'DefiLlama',      scores: ['no','yes','no','no','no','yes','no','yes'] },
    { name: 'DeFiSafety',     scores: ['partial','no','no','no','no','no','no','yes'] },
    { name: 'Resilience',     scores: ['yes','yes','yes','yes','yes','yes','yes','yes'] },
  ];
  const renderScore = (s: Score, isResilience: boolean) => {
    if (s === 'yes') return <CheckCircle className={`h-5 w-5 mx-auto ${isResilience ? 'text-primary' : 'text-primary/70'}`} />;
    if (s === 'partial') return <div className="h-5 w-5 mx-auto rounded-full border-2 border-amber-500 bg-amber-500/20" />;
    return <span className="text-muted-foreground/30">—</span>;
  };
  return (
    <SlideLayout>
      <Tag>COMPETITIVE LANDSCAPE</Tag>
      <h2 className="mt-6 text-[48px] font-bold text-foreground leading-tight">
        Where Resilience Fits
      </h2>
      <p className="mt-3 max-w-[800px] text-[17px] text-muted-foreground">
        Existing tools excel in their domains. Resilience is the only platform that combines all dimensions into a single, continuous, public assurance layer.
      </p>
      <div className="mt-6 overflow-hidden rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/60">
              <TableHead className="text-[14px] font-semibold w-[200px]">Feature</TableHead>
              {competitors.map(c => (
                <TableHead key={c.name} className={`text-[14px] font-semibold text-center ${c.name === 'Resilience' ? 'text-primary bg-primary/5' : ''}`}>
                  {c.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((f, i) => (
              <TableRow key={f} className="border-border">
                <TableCell className="text-[14px] text-muted-foreground">{f}</TableCell>
                {competitors.map(c => (
                  <TableCell key={c.name} className={`text-center ${c.name === 'Resilience' ? 'bg-primary/5' : ''}`}>
                    {renderScore(c.scores[i], c.name === 'Resilience')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center gap-6 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Supported</span>
        <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border-2 border-amber-500 bg-amber-500/20" /> Partial</span>
        <span className="flex items-center gap-2"><span className="text-muted-foreground/30 text-[16px]">—</span> Not available</span>
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 9: ROADMAP ─── */
export function RoadmapSlide() {
  const phases = [
    { phase: '1', title: 'Resilience Registry', status: 'IN PROGRESS', items: ['Multi-dimensional scoring engine', 'Builder claim & verification flow', 'Public explorer + heartbeat dashboard', 'Grants directory (public good)'], color: 'border-primary text-primary' },
    { phase: '2', title: 'Economic Commitment Layer', status: 'PLANNED', items: ['Commitment Lock staking', 'Yield mechanics for stakers', 'Bond marketplace'], color: 'border-muted-foreground/30 text-muted-foreground' },
    { phase: '3', title: 'Ecosystem Integration', status: 'PLANNED', items: ['Score Oracle on-chain program', 'Protocol-gated access APIs', 'Partner integrations'], color: 'border-muted-foreground/30 text-muted-foreground' },
    { phase: '4', title: 'AEGIS Supply Chain', status: 'PLANNED', items: ['Real-time vulnerability alerts', 'Automated dependency auditing', 'Cross-program risk mapping'], color: 'border-muted-foreground/30 text-muted-foreground' },
  ];
  return (
    <SlideLayout>
      <Tag>ROADMAP & MILESTONES</Tag>
      <h2 className="mt-6 text-[48px] font-bold text-foreground leading-tight">
        Phased Delivery, Measurable Outcomes
      </h2>
      <div className="mt-10 grid grid-cols-4 gap-5">
        {phases.map((p) => (
          <div key={p.phase} className={`rounded-sm border ${p.color.split(' ')[0]} bg-card/30 p-6 flex flex-col`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[14px] text-muted-foreground">PHASE {p.phase}</span>
              <span className={`font-mono text-[11px] rounded-sm px-2 py-0.5 ${p.status === 'IN PROGRESS' ? 'bg-primary/15 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                {p.status}
              </span>
            </div>
            <h3 className="mt-3 text-[18px] font-semibold text-foreground">{p.title}</h3>
            <ul className="mt-4 space-y-2 flex-1">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 10: THE FOUNDER ─── */
export function FounderSlide() {
  return (
    <SlideLayout className="items-center">
      <Tag>THE FOUNDER</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight text-center">
        Solo Founder. AI-Augmented.
      </h2>
      <div className="mt-10 flex gap-12 items-start max-w-[1000px]">
        <div className="shrink-0 flex flex-col items-center gap-4">
          <img src={founderImg} alt="Benjamin Omoata Anenu" className="h-40 w-40 rounded-full object-cover border-2 border-primary/30" />
          <h3 className="text-[22px] font-semibold text-foreground text-center">Benjamin Omoata Anenu</h3>
          <p className="font-mono text-[13px] text-primary text-center leading-tight">Founder & CEO<br />Technical Product Strategist<br />& AI Systems Architect</p>
        </div>
        <div className="flex flex-col gap-5">
          <blockquote className="border-l-2 border-primary pl-5 text-[17px] italic text-foreground/90 leading-relaxed">
            "Solana has already mastered the art of speed and deployment. Now, it is time to master the art of Transparency and Accountability."
          </blockquote>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Working closely with founders who have received grants and those building in the trenches, it became clear that a massive opportunity is being missed — no real-time milestone tracking, no community-backed continuity bonds, no verifiable data bridge.
          </p>
          <blockquote className="border-l-2 border-primary/50 pl-5 text-[15px] italic text-muted-foreground leading-relaxed">
            "We aren't here to point out where the ecosystem is quiet. We are here to provide the megaphone for those who are consistently building, and the map for those who need to know which projects are truly resilient."
          </blockquote>
          <p className="text-[13px] text-muted-foreground/70 mt-2">
            Building with AI as a force multiplier — this grant will fund the team needed to take Resilience to the next level.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}

/* ─── SLIDE 11: THE ASK ─── */
export function AskSlide() {
  return (
    <SlideLayout className="items-center text-center">
      <Tag>THE ASK</Tag>
      <h2 className="mt-8 text-[56px] font-bold text-foreground leading-tight">
        Let's Build Solana's<br />Trust Infrastructure
      </h2>
      <p className="mt-6 max-w-[700px] text-[20px] text-muted-foreground">
        Seeking a Solana Foundation grant to fund the team and infrastructure needed
        to scale Resilience from Phase 1 into ecosystem-wide integration.
      </p>
      <p className="mt-4 max-w-[600px] text-[16px] text-foreground/70 italic">
        Institutional capital and retail users will navigate Solana with absolute confidence.
      </p>
      <div className="mt-10 flex gap-6">
        <a href="https://bloomberg-pixel-perfect-fe.lovable.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-sm border border-primary bg-primary/10 px-6 py-3 font-mono text-[15px] text-primary hover:bg-primary/20 transition-colors">
          <Globe className="h-4 w-4" /> Live Product
        </a>
        <a href="https://bloomberg-pixel-perfect-fe.lovable.app/explorer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-sm border border-border bg-card/50 px-6 py-3 font-mono text-[15px] text-foreground hover:bg-card transition-colors">
          <Database className="h-4 w-4" /> Explorer
        </a>
        <a href="https://bloomberg-pixel-perfect-fe.lovable.app/grants" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-sm border border-border bg-card/50 px-6 py-3 font-mono text-[15px] text-foreground hover:bg-card transition-colors">
          <BookOpen className="h-4 w-4" /> Grants Directory
        </a>
      </div>
      <p className="mt-8 font-mono text-[12px] text-muted-foreground/40">REPUTATION CAN'T BE FORKED.</p>
    </SlideLayout>
  );
}
