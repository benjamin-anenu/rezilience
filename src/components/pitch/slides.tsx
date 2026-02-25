import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Network, Heart, Coins, Search, ShieldCheck, Lock, Globe, BookOpen, GitBranch, Users, TrendingUp, Database, Activity, ExternalLink, CheckCircle, ArrowRight, Zap, Eye, Target, BarChart3, Shield, Clock, AlertTriangle, Info } from 'lucide-react';
import { useHeroStats } from '@/hooks/useHeroStats';
import { useRoadmapStats } from '@/hooks/useRoadmapStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import founderImg from '@/assets/founder-benjamin.png';
import ecosystemImg from '@/assets/resilience-ecosystem.png';

/* ─── cinematic fade image with blur-to-sharp reveal ─── */
function FadeImage({ src, alt, className, wrapperClassName }: { 
  src: string; alt: string; className?: string; wrapperClassName?: string 
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={wrapperClassName ?? 'relative'}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-card/60 rounded-sm" />}
      <motion.img
        src={src}
        alt={alt}
        className={className ?? ''}
        onLoad={() => setLoaded(true)}
        initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
        animate={loaded 
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' } 
          : { opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  );
}

/* ─── shared layout ─── */
function SlideLayout({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`relative h-full w-full flex flex-col justify-center px-[120px] py-[80px] ${className}`}>
      {children}
    </div>;
}
function Tag({
  children
}: {
  children: React.ReactNode;
}) {
  return <span className="rounded-sm bg-primary/15 px-3 py-1 font-mono text-[14px] text-primary">{children}</span>;
}
function StatBox({
  label,
  value,
  mono = true
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return <div className="flex flex-col items-center gap-2 rounded-sm border border-border bg-card/50 px-8 py-6">
      <span className={`text-[42px] font-bold text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
      <span className="text-[16px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>;
}

/* ─── SLIDE 1: TITLE ─── */
export function TitleSlide() {
  const {
    data: stats
  } = useHeroStats();
  return <SlideLayout className="items-center text-center">
      <Tag>SOLANA FOUNDATION GRANT APPLICATION</Tag>
      <h1 className="mt-8 font-bold text-[72px] leading-[1.1] tracking-tight text-foreground">
        Reputation Can't <br />Be Forked.
      </h1>
      <p className="mt-6 max-w-[800px] text-[24px] leading-relaxed text-muted-foreground">
        <span className="text-primary font-semibold">Rezilience</span> — Decentralized Assurance Layer for Solana.
        <br />Multi-dimensional Proof-of-Life for every project — on-chain and off-chain.
      </p>
      {stats && <div className="mt-12 flex gap-6">
          <StatBox label="Registry" value={stats.registryCount} />
          <StatBox label="Active" value={stats.activeCount} />
          <StatBox label="Avg Score" value={stats.averageScore} />
        </div>}
      <p className="mt-8 font-mono text-[13px] text-muted-foreground/60">LIVE DATA FROM REZILIENCE REGISTRY</p>
    </SlideLayout>;
}

/* ─── SLIDE 2: THE VISION ─── */
export function VisionSlide() {
  return <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden px-[120px] py-[60px]">
      {/* Subtle glow behind image */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
      
      {/* Centered ecosystem image */}
      <FadeImage 
        src={ecosystemImg} 
        alt="Rezilience Ecosystem — Code, Liveness, Originality, Governance, Dependencies, Economics" 
        className="max-w-[750px] max-h-[500px] w-full h-auto object-contain"
        wrapperClassName="relative flex items-center justify-center"
      />
      
      {/* Text below, staggered entrance */}
      <motion.div 
        className="relative z-10 flex flex-col items-center text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Tag>THE VISION</Tag>
        <h2 className="mt-4 text-[56px] font-bold text-foreground leading-tight">
          The Assurance Layer of Solana
        </h2>
        <p className="mt-4 max-w-[700px] text-[20px] text-muted-foreground">
          Bridging Builders and the Public through transparent, verifiable project health data.
        </p>
      </motion.div>
    </div>;
}

/* ─── SLIDE 3: THE OPPORTUNITY ─── */
export function ProblemSlide() {
  const observations = [{
    icon: Activity,
    title: 'On-Chain Activity Alone Doesn\'t Tell the Full Story',
    desc: 'Deployment metrics hint at usage, but a quiet program might be stable, paused, or abandoned — today it is difficult to tell the difference.'
  }, {
    icon: Search,
    title: 'No Universal Verification Registry',
    desc: 'Unlike Ethereum\'s Sourcify, Solana lacks a single decentralized service that pulls source, rebuilds deterministically, and publishes verification status.'
  }, {
    icon: ShieldCheck,
    title: 'Verifiable Builds Exist, Adoption Is Inconsistent',
    desc: 'Some teams don\'t generate them, others don\'t publish metadata — coverage remains partial across the ecosystem.'
  }, {
    icon: GitBranch,
    title: 'Provenance Does Not Equal Maintenance',
    desc: 'A source-to-binary match at deployment proves origin at one point in time, not ongoing health.'
  }, {
    icon: Lock,
    title: 'Closed Programs Remain Hard to Reason About',
    desc: 'Without published source, reverse engineering helps surface risk but is not a substitute for verification.'
  }, {
    icon: Users,
    title: 'Maintainer Identity Is Fragmented',
    desc: 'GitHub, X, wallets, Discord — these signals are rarely bound together cryptographically, making it hard to answer: who maintains this program today?'
  }];
  const unlocks = [{
    icon: Coins,
    title: 'SOL Continuity Bonds',
    desc: 'The community stakes SOL on projects they believe in — backed by verifiable data, not hype.'
  }, {
    icon: Shield,
    title: 'AEGIS Supply Chain Auditing',
    desc: 'Real-time dependency and vulnerability monitoring across the ecosystem\'s nervous system.'
  }, {
    icon: Globe,
    title: 'Public Good, No Gatekeeping',
    desc: 'Every tool, every score, every metric — open access for builders and the public. No subscriptions. No walls.'
  }];
  return <SlideLayout>
      <Tag>THE OPPORTUNITY</Tag>
      <h2 className="mt-4 text-[48px] font-bold text-foreground leading-tight">
        The Maintenance Visibility Gap
      </h2>
      <p className="mt-3 max-w-[900px] text-[17px] text-muted-foreground leading-relaxed">
        While working closely with builders across pre-Colosseum, Colosseum, and post-Colosseum hackathons, and observing recently funded Solana projects, consistent gaps became clear. <span className="text-foreground font-medium">Solana makes it incredibly easy to ship.</span> What is still hard is understanding what is actually being maintained over time.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {observations.map(o => <div key={o.title} className="flex gap-4 rounded-sm border border-border bg-card/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/15">
              <o.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground leading-tight">{o.title}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{o.desc}</p>
            </div>
          </div>)}
      </div>
      <p className="mt-4 text-[15px] text-muted-foreground italic">
        Resilience is designed to close this gap — bottom-up, using real signals builders already generate, and turning them into shared, verifiable infrastructure.
      </p>
      <div className="mt-4 flex gap-4">
        {unlocks.map(u => <div key={u.title} className="flex-1 flex gap-3 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <u.icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              <h4 className="text-[14px] font-semibold text-foreground">{u.title}</h4>
              <p className="mt-1 text-[12px] text-muted-foreground">{u.desc}</p>
            </div>
          </div>)}
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 4: THE SOLUTION ─── */
export function SolutionSlide() {
  const dimensions = [{
    icon: Brain,
    label: 'Brain',
    weight: '40%',
    range: 'up to 60%',
    desc: 'GitHub Activity',
    color: 'text-primary'
  }, {
    icon: Network,
    label: 'Nervous System',
    weight: '25%',
    range: 'up to 40%',
    desc: 'Dependency Health',
    color: 'text-chart-2'
  }, {
    icon: Heart,
    label: 'Heart',
    weight: '20%',
    range: 'when applicable',
    desc: 'Governance',
    color: 'text-chart-4'
  }, {
    icon: Coins,
    label: 'Limbs',
    weight: '15%',
    range: 'DeFi only',
    desc: 'TVL / Economics',
    color: 'text-chart-3'
  }];

  const weightProfiles = [
    { category: 'Full Stack (DeFi + DAO)', github: '40', deps: '25', gov: '20', tvl: '15' },
    { category: 'DeFi (no governance)', github: '50', deps: '30', gov: '—', tvl: '20' },
    { category: 'Infrastructure / Tools', github: '60', deps: '40', gov: '—', tvl: '—' },
  ];

  return <SlideLayout>
      <Tag>THE SOLUTION</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Multi-Dimensional Proof-of-Life
      </h2>
      <div className="mt-4 flex gap-8 text-[16px] text-muted-foreground">
        <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> <strong className="text-foreground">The Public (The Fish)</strong> — Data-backed transparency</span>
        <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> <strong className="text-foreground">Builders (The Eagles)</strong> — Immutable trust scores</span>
      </div>
      <div className="mt-4 rounded-sm border border-primary/30 bg-primary/5 px-6 py-4 inline-block">
        <p className="font-mono text-[20px] text-primary">
          R = (w<sub>G</sub>×GitHub + w<sub>D</sub>×Deps + w<sub>Gov</sub>×Gov + w<sub>TVL</sub>×TVL) × Continuity
        </p>
      </div>
      <p className="mt-2 text-[14px] text-muted-foreground italic">
        Weights adapt to project category — no project is penalized for dimensions that don't apply.
      </p>

      {/* Weight profiles table */}
      <div className="mt-4 overflow-hidden rounded-sm border border-border inline-block">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/60">
              <TableHead className="text-[12px] font-semibold">Category</TableHead>
              <TableHead className="text-[12px] font-semibold text-center">GitHub</TableHead>
              <TableHead className="text-[12px] font-semibold text-center">Deps</TableHead>
              <TableHead className="text-[12px] font-semibold text-center">Gov</TableHead>
              <TableHead className="text-[12px] font-semibold text-center">TVL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weightProfiles.map(p => (
              <TableRow key={p.category} className="border-border">
                <TableCell className="text-[12px] text-foreground font-medium py-1.5">{p.category}</TableCell>
                <TableCell className="text-[12px] text-primary font-mono text-center py-1.5">{p.github}%</TableCell>
                <TableCell className="text-[12px] text-primary font-mono text-center py-1.5">{p.deps}%</TableCell>
                <TableCell className={`text-[12px] font-mono text-center py-1.5 ${p.gov === '—' ? 'text-muted-foreground/40' : 'text-primary'}`}>{p.gov === '—' ? '—' : `${p.gov}%`}</TableCell>
                <TableCell className={`text-[12px] font-mono text-center py-1.5 ${p.tvl === '—' ? 'text-muted-foreground/40' : 'text-primary'}`}>{p.tvl === '—' ? '—' : `${p.tvl}%`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-6">
        {dimensions.map(d => <div key={d.label} className="flex flex-col items-center gap-2 rounded-sm border border-border bg-card/40 p-5 text-center">
            <d.icon className={`h-10 w-10 ${d.color}`} />
            <span className="text-[18px] font-semibold text-foreground">{d.label}</span>
            <span className="font-mono text-[26px] font-bold text-primary">{d.weight}</span>
            <span className="text-[11px] text-muted-foreground/70 font-mono">{d.range}</span>
            <span className="text-[13px] text-muted-foreground">{d.desc}</span>
          </div>)}
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 5: HOW IT WORKS ─── */
export function HowItWorksSlide() {
  const steps = [{
    num: '01',
    icon: Database,
    title: 'INDEX',
    desc: 'Automated multi-dimensional scoring of every registered Solana project. GitHub, dependencies, governance, and TVL analyzed continuously.'
  }, {
    num: '02',
    icon: ShieldCheck,
    title: 'VERIFY',
    desc: 'On-chain authority wallet SIWS for "Verified Titan" status. Off-chain GitHub ownership proof. Bytecode originality + dependency health checks.'
  }, {
    num: '03',
    icon: Lock,
    title: 'COMMIT',
    desc: 'Economic commitment through staked assurance bonds. DAO Accountability tracks Realms governance proposals against actual delivery — exposing which funded projects ship and which stall.'
  }, {
    num: '04',
    icon: AlertTriangle,
    title: 'DETECT',
    desc: 'AEGIS Supply Chain Intelligence — real-time dependency graph mapping, automated CVE detection, and cross-program risk propagation alerts across the ecosystem\'s nervous system.'
  }];
  return <SlideLayout>
      <Tag>HOW IT WORKS</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Four-Step Assurance Pipeline
      </h2>
      <div className="mt-10 grid grid-cols-4 gap-5">
        {steps.map((s, i) => <div key={s.num} className="relative flex flex-col items-start rounded-sm border border-border bg-card/40 p-6">
            <span className="font-mono text-[42px] font-bold text-primary/20">{s.num}</span>
            <div className="mt-2 flex items-center gap-3">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="text-[20px] font-bold tracking-wider text-foreground">{s.title}</h3>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
            {i < 3 && <ArrowRight className="absolute -right-4 top-1/2 h-5 w-5 text-primary/40 hidden xl:block" />}
          </div>)}
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 6: TRACTION ─── */
export function TractionSlide() {
  const {
    data: heroStats
  } = useHeroStats();
  const {
    data: roadmapStats
  } = useRoadmapStats();
  return <SlideLayout>
      <Tag>TRACTION & METRICS</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        Live From the Registry
      </h2>
      <p className="mt-3 text-[18px] text-muted-foreground">All numbers pulled in real-time from the production database.</p>
      <div className="mt-10 grid grid-cols-3 gap-6">
        <StatBox label="Programs Indexed" value={heroStats?.registryCount ?? '—'} />
        <StatBox label="Active Heartbeats" value={heroStats?.activeCount ?? '—'} />
        <StatBox label="Avg Rezilience Score" value={heroStats?.averageScore ?? '—'} />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-6">
        <StatBox label="Scored Projects" value={roadmapStats?.scoredProjects ?? '—'} />
        <StatBox label="Claimed Profiles" value={roadmapStats?.claimedProfiles ?? '—'} />
        <StatBox label="Unclaimed" value={roadmapStats?.unclaimedProfiles ?? '—'} />
      </div>
      <div className="mt-6 rounded-sm border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div>
            <h4 className="text-[15px] font-semibold text-foreground">30+ Builders Waiting to Claim Profiles</h4>
            <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed">
              Claims are currently paused for end-to-end QA and vetting. We need to ensure all code meets Solana standards and build the on-chain protocol before accepting claims. Builders will sign with a SOL transaction to confirm originality — positioning them for Phase 2, where the public can stake on their projects as they build in public.
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 font-mono text-[12px] text-muted-foreground/50 text-center">DATA REFRESHED EVERY 5 MINUTES • ZERO MOCK DATA</p>
    </SlideLayout>;
}

/* ─── SLIDE 7: OPENING NEW POSSIBILITIES ─── */
export function PossibilitiesSlide() {
  const items = [{
    icon: Activity,
    title: 'Public Milestone Tracking',
    desc: 'Real-time project progress — code commits, governance decisions, and delivery timelines — unified in one view.'
  }, {
    icon: Coins,
    title: 'Economic Alignment',
    desc: 'Continuity Bonds let the public stake trust in projects backed by verifiable data, not social media hype.'
  }, {
    icon: Network,
    title: 'Supply Chain Auditing',
    desc: 'Trace the ecosystem\'s dependency graph to warn when critical infrastructure is at risk.'
  }, {
    icon: BookOpen,
    title: 'Grants Directory',
    desc: 'Curated funding resource for builders — a public good with no gatekeeping.'
  }, {
    icon: Heart,
    title: 'DAO Accountability',
    desc: 'Track whether governance-funded projects actually deliver. Realms proposal execution mapped to Rezilience scores.'
  }, {
    icon: Zap,
    title: 'Score Oracle',
    desc: 'Composable on-chain data architecture for protocol-level integrations and programmatic access.'
  }];
  return <SlideLayout>
      <Tag>OPENING NEW POSSIBILITIES</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        One Central System for What Matters
      </h2>
      <p className="mt-4 max-w-[900px] text-[18px] text-muted-foreground leading-relaxed">
        These capabilities exist individually across the ecosystem — block explorers track transactions, audit firms verify code, DeFi dashboards monitor TVL. But no single system unifies development health, supply chain integrity, governance activity, and economic data into one continuous, public assurance layer. <span className="text-foreground font-medium">Rezilience brings it all together</span> — for builders and the public alike.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-5">
        {items.map(item => <div key={item.title} className="flex gap-4 rounded-sm border border-border bg-card/40 p-5">
            <item.icon className="h-6 w-6 shrink-0 text-primary mt-1" />
            <div>
              <h3 className="text-[17px] font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-[14px] text-muted-foreground">{item.desc}</p>
            </div>
          </div>)}
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 8: COMPETITIVE LANDSCAPE ─── */
export function CompetitionSlide() {
  type Score = 'yes' | 'partial' | 'no' | 'planned';
  const features = ['Multi-dimensional scoring', 'Continuous monitoring', 'Bytecode verification', 'Dependency health', 'Governance tracking', 'TVL risk analysis', 'Economic staking', 'Open methodology'];
  const competitors: {
    name: string;
    scores: Score[];
  }[] = [{
    name: 'Solscan / FM',
    scores: ['no', 'no', 'no', 'no', 'no', 'no', 'no', 'no']
  }, {
    name: 'CertiK Skynet',
    scores: ['partial', 'no', 'yes', 'no', 'no', 'no', 'no', 'no']
  }, {
    name: 'DefiLlama',
    scores: ['no', 'yes', 'no', 'no', 'no', 'yes', 'no', 'yes']
  }, {
    name: 'DeFiSafety',
    scores: ['partial', 'no', 'no', 'no', 'no', 'no', 'no', 'yes']
  }, {
    name: 'Anchor Verify',
    scores: ['no', 'no', 'yes', 'no', 'no', 'no', 'no', 'partial']
  }, {
    name: 'Rezilience',
    scores: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'planned', 'yes']
  }];
  const renderScore = (s: Score, isRezilience: boolean) => {
    if (s === 'yes') return <CheckCircle className={`h-5 w-5 mx-auto ${isRezilience ? 'text-primary' : 'text-primary/70'}`} />;
    if (s === 'planned') return <div className="h-5 w-5 mx-auto rounded-full border-2 border-dashed border-primary bg-primary/10" />;
    if (s === 'partial') return <div className="h-5 w-5 mx-auto rounded-full border-2 border-amber-500 bg-amber-500/20" />;
    return <span className="text-muted-foreground/30">—</span>;
  };

  const pohColumns = [
    { icon: Clock, title: 'PoH is a Clock', desc: 'Validators use it to order transactions. It does not care what the events are.' },
    { icon: Eye, title: 'Rezilience is a Performance Review', desc: 'Tracks whether developers update code, respond to bugs, and stick to promises.' },
    { icon: Zap, title: 'Partners, Not Competitors', desc: 'Rezilience uses PoH timestamps to measure how often programs are updated. Raw Time becomes Useful Intelligence.' },
  ];

  return <SlideLayout>
      <Tag>COMPETITIVE LANDSCAPE</Tag>
      <h2 className="mt-4 text-[44px] font-bold text-foreground leading-tight">
        Where Rezilience Fits
      </h2>
      <p className="mt-2 max-w-[800px] text-[15px] text-muted-foreground">
        Existing tools excel in their domains. Rezilience is the only platform that combines all dimensions into a single, continuous, public assurance layer.
      </p>
      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/60">
              <TableHead className="text-[13px] font-semibold w-[180px]">Feature</TableHead>
              {competitors.map(c => <TableHead key={c.name} className={`text-[13px] font-semibold text-center ${c.name === 'Rezilience' ? 'text-primary bg-primary/5' : ''}`}>
                  {c.name}
                </TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((f, i) => <TableRow key={f} className="border-border">
                <TableCell className="text-[13px] text-muted-foreground py-2">{f}</TableCell>
                {competitors.map(c => <TableCell key={c.name} className={`text-center py-2 ${c.name === 'Rezilience' ? 'bg-primary/5' : ''}`}>
                    {renderScore(c.scores[i], c.name === 'Rezilience')}
                  </TableCell>)}
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center gap-6 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Supported</span>
        <span className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-primary bg-primary/10" /> Planned</span>
        <span className="flex items-center gap-2"><div className="h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-amber-500/20" /> Partial</span>
        <span className="flex items-center gap-2"><span className="text-muted-foreground/30 text-[14px]">—</span> Not available</span>
      </div>

      {/* PoH Differentiation */}
      <div className="mt-4 rounded-sm border border-border bg-card/30 p-4">
        <p className="font-mono text-[11px] text-muted-foreground/60 mb-3">REZILIENCE vs. PROOF OF HISTORY</p>
        <div className="grid grid-cols-3 gap-4">
          {pohColumns.map(col => (
            <div key={col.title} className="flex gap-3">
              <col.icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <h4 className="text-[13px] font-semibold text-foreground">{col.title}</h4>
                <p className="mt-1 text-[12px] text-muted-foreground">{col.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-foreground/80 font-medium italic text-center">
          PoH makes Solana fast. Rezilience makes Solana reliable.
        </p>
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 9: ROADMAP ─── */
export function RoadmapSlide() {
  const phases = [{
    phase: '1',
    title: 'Production Hardening & On-Chain Migration',
    timeline: 'Months 1–2',
    budget: '$25,000',
    status: 'IN PROGRESS',
    items: ['Expert code review & security audit', 'Solana standards compliance', 'Anchor smart contract development', 'Score history on-chain migration', 'Production deployment & monitoring'],
    color: 'border-primary'
  }, {
    phase: '2',
    title: 'Economic Commitment Layer',
    timeline: 'Months 3–5',
    budget: '$15,000',
    status: 'PLANNED',
    items: ['Staking bonds & yield mechanics', 'Commitment Locks', 'Realms DAO Accountability Layer', 'Proposal-to-Delivery Rate tracking', 'Bond marketplace'],
    color: 'border-muted-foreground/30'
  }, {
    phase: '3',
    title: 'Ecosystem Integration',
    timeline: 'Months 6–8',
    budget: '$12,000',
    status: 'PLANNED',
    items: ['Score Oracle on-chain program', 'Protocol-gated access APIs', 'Partner integrations & docs'],
    color: 'border-muted-foreground/30'
  }, {
    phase: '4',
    title: 'AEGIS Supply Chain',
    timeline: 'Months 9–12',
    budget: '$23,000',
    status: 'PLANNED',
    items: ['Real-time dependency graph mapping', 'Automated CVE propagation', 'Cross-program risk cascade modeling', 'Security engineering infrastructure'],
    color: 'border-muted-foreground/30'
  }];

  const phase1LineItems = [
    'Senior Anchor Engineer (1 mo) — Code review, on-chain program, security hardening',
    'Frontend Engineer (1 mo) — Standards compliance, performance optimization, documentation',
    'Infrastructure/DevOps (0.5 mo) — Production deployment, monitoring, RPC configuration',
    'Security Audit & QA — End-to-end testing, vulnerability assessment',
    'Contingency buffer (~10%)',
  ];

  return <SlideLayout>
      <Tag>ROADMAP & BUDGET</Tag>
      <h2 className="mt-4 text-[44px] font-bold text-foreground leading-tight">
        75,000 USDC — Four Phases, 12 Months
      </h2>
      <p className="mt-2 text-[15px] text-muted-foreground">Milestone-based delivery. Each phase unlocked on completion of the previous.</p>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {phases.map(p => <div key={p.phase} className={`rounded-sm border ${p.color} bg-card/30 p-4 flex flex-col`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-muted-foreground">PHASE {p.phase}</span>
              <span className={`font-mono text-[10px] rounded-sm px-2 py-0.5 ${p.status === 'IN PROGRESS' ? 'bg-primary/15 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                {p.status}
              </span>
            </div>
            <h3 className="mt-2 text-[15px] font-semibold text-foreground leading-tight">{p.title}</h3>
            <p className="mt-1 font-mono text-[20px] font-bold text-primary">{p.budget}</p>
            <p className="text-[11px] text-muted-foreground">{p.timeline}</p>
            <ul className="mt-3 space-y-1.5 flex-1">
              {p.items.map(item => <li key={item} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-primary/50" />
                  {item}
                </li>)}
            </ul>
          </div>)}
      </div>
      {/* Phase 1 Line Items */}
      <div className="mt-4 rounded-sm border border-primary/20 bg-primary/5 p-4">
        <p className="font-mono text-[11px] text-primary mb-2">PHASE 1 BUDGET BREAKDOWN — $25,000</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {phase1LineItems.map(item => (
            <p key={item} className="text-[11px] text-muted-foreground flex items-start gap-2">
              <span className="text-primary shrink-0">›</span> {item}
            </p>
          ))}
        </div>
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 10: THE FOUNDER ─── */
export function FounderSlide() {
  return <SlideLayout className="items-center">
      <Tag>THE FOUNDER</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight text-center">
        Solo Founder. AI-Augmented.
      </h2>
      <div className="mt-10 flex gap-12 items-start max-w-[1000px]">
        <div className="shrink-0 flex flex-col items-center gap-4">
          <FadeImage src={founderImg} alt="Benjamin Omoata Anenu" className="h-40 w-40 rounded-full object-cover border-2 border-primary/30" wrapperClassName="relative" />
          <h3 className="text-[22px] font-semibold text-foreground text-center">Benjamin Omoata Anenu</h3>
          <p className="font-mono text-[13px] text-primary text-center leading-tight">Product Visionary<br />Technical Project Manager<br />& AI Product Strategist</p>
        </div>
        <div className="flex flex-col gap-5">
          <blockquote className="border-l-2 border-primary pl-5 text-[17px] italic text-foreground/90 leading-relaxed">
            "Solana has already mastered the art of speed and deployment. Now, it is time to master the art of Transparency and Accountability."
          </blockquote>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Working closely with founders who have received grants and those building in the trenches, it became clear that a massive opportunity is being missed. There is no one central place where the Public can actually view real-time milestone delivery, community-backed continuity bonds, Code Maintenance and verifiable data bridge in one place.   
          </p>
          <blockquote className="border-l-2 border-primary/50 pl-5 text-[15px] italic text-muted-foreground leading-relaxed">
            "We aren't here to point out where the ecosystem is quiet. We are here to provide the megaphone for those who are consistently building, and the map for those who need to know which projects are truly resilient."
          </blockquote>
          <p className="text-[13px] text-muted-foreground/70 mt-2">
            Building with AI as a force multiplier — this grant will fund the team needed to take Rezilience to the next level.
          </p>
        </div>
      </div>
    </SlideLayout>;
}

/* ─── SLIDE 11: THE ASK ─── */
export function AskSlide() {
  const phasesSummary = [
    { phase: 'Phase 1', name: 'Production Hardening', timeline: 'Mo 1–2', amount: '$25,000', deliverable: 'Code audit + on-chain migration' },
    { phase: 'Phase 2', name: 'Economic Layer', timeline: 'Mo 3–5', amount: '$15,000', deliverable: 'Staking bonds + yield mechanics' },
    { phase: 'Phase 3', name: 'Ecosystem Integration', timeline: 'Mo 6–8', amount: '$12,000', deliverable: 'Score Oracle + partner APIs' },
    { phase: 'Phase 4', name: 'AEGIS Supply Chain', timeline: 'Mo 9–12', amount: '$23,000', deliverable: 'Dependency graph + CVE propagation' },
  ];
  return <SlideLayout className="items-center text-center">
      <Tag>THE ASK</Tag>
      <h2 className="mt-6 text-[52px] font-bold text-foreground leading-tight">
        75,000 USDC<br />Across Four Phases
      </h2>
      <p className="mt-4 max-w-[700px] text-[18px] text-muted-foreground">
        Milestone-based delivery. Each phase unlocked on completion of the previous.
      </p>

      {/* Phase summary table */}
      <div className="mt-8 w-full max-w-[900px] overflow-hidden rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-card/60">
              <TableHead className="text-[13px] font-semibold">Phase</TableHead>
              <TableHead className="text-[13px] font-semibold">Timeline</TableHead>
              <TableHead className="text-[13px] font-semibold text-right">Amount</TableHead>
              <TableHead className="text-[13px] font-semibold">Key Deliverable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phasesSummary.map(p => (
              <TableRow key={p.phase} className="border-border">
                <TableCell className="text-[13px] text-foreground font-medium py-2">{p.phase}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground font-mono py-2">{p.timeline}</TableCell>
                <TableCell className="text-[13px] text-primary font-mono font-bold text-right py-2">{p.amount}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground py-2">{p.deliverable}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-border bg-primary/5">
              <TableCell className="text-[13px] text-foreground font-bold py-2">Total</TableCell>
              <TableCell className="text-[13px] text-muted-foreground font-mono py-2">12 months</TableCell>
              <TableCell className="text-[13px] text-primary font-mono font-bold text-right py-2">$75,000</TableCell>
              <TableCell className="text-[13px] text-muted-foreground py-2">Full assurance layer for Solana</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mt-8 flex gap-6">
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
      <p className="mt-6 font-mono text-[12px] text-muted-foreground/40">REPUTATION CAN'T BE FORKED.</p>
    </SlideLayout>;
}