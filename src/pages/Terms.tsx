import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { ChevronRight, Shield, Scale, Globe, Eye, Database, Lock, Trash2, Cookie, Heart } from 'lucide-react';

/* ── Sticky Table of Contents ──────────────────────────────────────── */

interface TOCItem { id: string; label: string; level: number }

const tocItems: TOCItem[] = [
  { id: 'preamble', label: 'Preamble', level: 1 },
  { id: 'tos', label: 'Terms of Service', level: 1 },
  { id: 'acceptance', label: 'Acceptance of Terms', level: 2 },
  { id: 'nature', label: 'Nature of the Service', level: 2 },
  { id: 'open-source', label: 'Open Source License', level: 2 },
  { id: 'accounts', label: 'User Accounts', level: 2 },
  { id: 'wallets', label: 'Wallet Connections', level: 2 },
  { id: 'registry', label: 'Registry Participation', level: 2 },
  { id: 'ip', label: 'Intellectual Property', level: 2 },
  { id: 'disclaimers', label: 'Disclaimers', level: 2 },
  { id: 'liability', label: 'Limitation of Liability', level: 2 },
  { id: 'governing-law', label: 'Governing Law', level: 2 },
  { id: 'changes-tos', label: 'Changes to Terms', level: 2 },
  { id: 'privacy', label: 'Privacy Policy', level: 1 },
  { id: 'data-collect', label: 'Data We Collect', level: 2 },
  { id: 'data-not-collect', label: 'Data We Do NOT Collect', level: 2 },
  { id: 'data-use', label: 'How We Use Data', level: 2 },
  { id: 'data-sharing', label: 'Data Sharing', level: 2 },
  { id: 'data-retention', label: 'Data Retention & Deletion', level: 2 },
  { id: 'third-party', label: 'Third-Party Services', level: 2 },
  { id: 'cookies', label: 'Cookies & Local Storage', level: 2 },
  { id: 'open-data', label: 'Open Data Philosophy', level: 2 },
  { id: 'contact', label: 'Contact', level: 2 },
];

function TermsTOC() {
  const [activeId, setActiveId] = useState('preamble');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -35% 0%', threshold: 0 }
    );
    tocItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="hidden lg:block sticky top-24 w-64 shrink-0 self-start">
      <div className="rounded-sm border border-border bg-card/50 p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>CONTENTS</span>
          <ChevronRight className={cn('h-4 w-4 transition-transform', !isCollapsed && 'rotate-90')} />
        </button>
        {!isCollapsed && (
          <ul className="mt-4 space-y-1">
            {tocItems.map(({ id, label, level }) => (
              <li key={id}>
                <button
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={cn(
                    'w-full text-left text-sm transition-colors hover:text-primary',
                    level === 2 && 'pl-4',
                    activeId === id ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function SectionHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-2xl font-bold uppercase tracking-wider text-foreground scroll-mt-24">
      {children}
    </h2>
  );
}

function SubHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="font-display text-lg font-semibold uppercase tracking-wide text-foreground scroll-mt-24">
      {children}
    </h3>
  );
}

function Def({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-primary">{children}</span>;
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Hero */}
        <div className="mb-12 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className="border-primary text-primary font-mono text-xs uppercase tracking-wider">
              <Shield className="h-3 w-3 mr-1" /> Open Source
            </Badge>
            <Badge variant="outline" className="border-primary text-primary font-mono text-xs uppercase tracking-wider">
              <Heart className="h-3 w-3 mr-1" /> Public Good
            </Badge>
          </div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            Terms & Privacy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Written in plain language for builders, not boardrooms. No legalese, no dark patterns — just transparency.
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Last updated: February 15, 2026
          </p>
        </div>

        {/* Content + TOC */}
        <div className="flex gap-8">
          <TermsTOC />

          <div className="flex-1 max-w-4xl space-y-16">
            {/* ── PREAMBLE ─────────────────────────────────────── */}
            <section id="preamble" className="space-y-4">
              <SectionHeader id="preamble">Preamble</SectionHeader>
              <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 space-y-3">
                <p className="text-foreground font-medium">
                  Rezilience is <Def>open-source public good infrastructure</Def> for the Solana ecosystem.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  <li>This codebase is freely forkable under the <Def>MIT License</Def>.</li>
                  <li>We do not sell data. We do not gate public information.</li>
                  <li>All scoring methodology is published, auditable, and reproducible.</li>
                  <li>Registry data is public by design — transparency is our only product.</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* ── TERMS OF SERVICE ─────────────────────────────── */}
            <section id="tos" className="space-y-8">
              <SectionHeader id="tos">Terms of Service</SectionHeader>

              <Accordion type="multiple" defaultValue={['acceptance', 'nature', 'open-source', 'accounts', 'wallets', 'registry', 'ip', 'disclaimers', 'liability', 'governing-law', 'changes-tos']} className="space-y-2">

                <AccordionItem value="acceptance" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="acceptance">1. Acceptance of Terms</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>By accessing or using the Rezilience platform (<Def>rezilience.lovable.app</Def>), you agree to be bound by these Terms. If you do not agree, please do not use the platform. You may still fork the codebase and run your own instance — that's the beauty of open source.</p>
                    <p>These terms apply to all visitors, users, and builders who access the platform, whether authenticated or browsing publicly.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="nature" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="nature">2. Nature of the Service</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Rezilience operates as a <Def>decentralized assurance layer</Def> — a public registry and transparency platform for Solana protocols. The platform provides:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>The Rezilience Registry</strong> — a curated index of Solana programs with continuity health scores</li>
                      <li><strong>Scoring Methodology</strong> — a published, auditable formula combining GitHub activity, dependency health, governance signals, and economic metrics</li>
                      <li><strong>RezilienceGPT</strong> — a free AI tutor for Solana ecosystem education</li>
                      <li><strong>Rezilience Library</strong> — a centralized documentation hub indexing 33+ Solana services</li>
                      <li><strong>Explorer & Leaderboard</strong> — public interfaces for ecosystem health monitoring</li>
                    </ul>
                    <p>The platform is informational infrastructure. It does not custody funds, execute trades, provide financial advice, or make investment recommendations.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="open-source" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="open-source">3. Open Source License & Forkability</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>The Rezilience codebase is released under the <Def>MIT License</Def>. You are free to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Fork, modify, and redistribute the source code</li>
                      <li>Deploy your own instance of the registry</li>
                      <li>Build derivative works for any purpose, including commercial use</li>
                      <li>Use the scoring methodology in your own projects</li>
                    </ul>
                    <p>We believe public good infrastructure should be freely available and verifiable. Attribution is appreciated but not legally required under MIT.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="accounts" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="accounts">4. User Accounts (X/Twitter OAuth)</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Account creation is optional and only required for builders who wish to <Def>claim a project profile</Def>. Authentication is handled via X (Twitter) OAuth. When you authenticate, we receive and store:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your X user ID, username, display name, and avatar URL</li>
                    </ul>
                    <p>We do <strong>not</strong> receive or store your X password, direct messages, follower lists, or any non-public data. We do not post on your behalf without explicit action.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="wallets" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="wallets">5. Wallet Connections</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Wallet connections on Rezilience are <Def>strictly read-only</Def>. When you connect a Solana wallet:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>We read your <strong>public key</strong> (wallet address) only</li>
                      <li>We <strong>never</strong> request, access, or store your private keys or seed phrases</li>
                      <li>We <strong>never</strong> have custody of your funds</li>
                      <li>We <strong>never</strong> initiate transactions on your behalf without your explicit wallet approval</li>
                    </ul>
                    <p>Signature requests (e.g., for program authority verification) are plaintext messages — never token transfers — and are clearly labeled before you sign.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="registry" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="registry">6. Registry Participation</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Claiming a project on the Rezilience Registry is <Def>voluntary</Def>. By claiming a profile, you represent that:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You have legitimate authority over the project (verified via on-chain program authority signature or GitHub repository ownership)</li>
                      <li>Information you submit (name, description, team members, roadmap) is accurate to the best of your knowledge</li>
                      <li>You understand that your project's public data (GitHub metrics, on-chain activity, governance transactions) will be indexed and scored</li>
                    </ul>
                    <p>Fraudulent claims are subject to the platform's anti-abuse blacklist system. You may delete your claimed profile at any time via the Dashboard.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ip" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="ip">7. Intellectual Property</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Content you submit to the registry (logos, descriptions, media assets, roadmap milestones) <Def>remains yours</Def>. By submitting it, you grant Rezilience a non-exclusive, royalty-free license to display it within the platform for the purpose of public transparency.</p>
                    <p>The Rezilience brand, logo, and design system are the property of Rezilience Protocol. The codebase is MIT-licensed; the brand identity is not.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="disclaimers" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="disclaimers">8. Disclaimers</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p><Def>Rezilience Scores are informational only.</Def> They are not:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Financial, investment, or legal advice</li>
                      <li>Endorsements or certifications of any protocol</li>
                      <li>Guarantees of a project's security, solvency, or continued operation</li>
                      <li>Audits — Rezilience is a transparency layer, not a security auditor</li>
                    </ul>
                    <p>Scores reflect publicly available data processed through a published methodology. They may be delayed, incomplete, or affected by API rate limits. Always do your own research (DYOR).</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="liability" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="liability">9. Limitation of Liability</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>The platform is provided <Def>"AS IS"</Def> and <Def>"AS AVAILABLE"</Def> without warranties of any kind, express or implied. Rezilience Protocol, its contributors, and maintainers shall not be liable for any damages arising from:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use of or inability to use the platform</li>
                      <li>Decisions made based on Rezilience Scores or data</li>
                      <li>Unauthorized access to your account or data</li>
                      <li>Service interruptions or API failures from third-party providers</li>
                    </ul>
                    <p>This is open-source infrastructure maintained by contributors. It is not a corporation with guaranteed uptime SLAs.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="governing-law" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="governing-law">10. Governing Law</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>These Terms shall be governed by and construed in accordance with applicable international open-source licensing norms. As a decentralized public good, Rezilience operates without a single legal jurisdiction. Disputes should be resolved through open community dialogue and, where applicable, under the terms of the MIT License.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="changes-tos" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="changes-tos">11. Changes to Terms</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>We may update these Terms from time to time. Changes will be reflected by updating the "Last Updated" date at the top of this page. Since the codebase is open source, all changes to these terms are tracked in version control and can be audited by anyone.</p>
                    <p>Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <Separator />

            {/* ── PRIVACY POLICY ───────────────────────────────── */}
            <section id="privacy" className="space-y-8">
              <SectionHeader id="privacy">Privacy Policy</SectionHeader>

              <Accordion type="multiple" defaultValue={['data-collect', 'data-not-collect', 'data-use', 'data-sharing', 'data-retention', 'third-party', 'cookies', 'open-data', 'contact']} className="space-y-2">

                <AccordionItem value="data-collect" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="data-collect"><Database className="inline h-4 w-4 mr-2" />Data We Collect</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-4">
                    <p>We believe in exhaustive transparency. Here is <strong>every category</strong> of data the platform handles:</p>

                    <div className="space-y-3">
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">X (Twitter) Authentication</p>
                        <p>User ID, username, display name, avatar URL — received via OAuth. <strong>No passwords are stored.</strong></p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">Wallet Addresses</p>
                        <p>Public keys only. Read-only. <strong>Never private keys or seed phrases.</strong></p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">GitHub Data</p>
                        <p>Public repository metrics: stars, forks, contributors, commit history, languages, topics, release events, PR/issue activity. All of this is <strong>publicly available data</strong> accessible via GitHub's public API.</p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">Project Registry Data</p>
                        <p>Project name, description, category, country, website URL, logo, Solana program ID, media assets, roadmap milestones, team member names — all <strong>voluntarily submitted</strong> by the project claimer.</p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">On-Chain Data</p>
                        <p>Program authority verification signatures, bytecode hashes, governance transaction counts, TVL metrics — all from <strong>public blockchain data</strong> readable by anyone with a Solana RPC connection.</p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">Analytics</p>
                        <p>Anonymous session IDs (UUID — no PII), page views, click events, device type, geo-location at country/city level derived from IP. <strong>The IP address itself is not stored.</strong></p>
                      </div>
                      <div className="rounded-sm border border-border p-3">
                        <p className="font-mono text-xs text-primary uppercase mb-1">Build in Public</p>
                        <p>Tweet URLs and embedded content — <strong>public tweets only</strong>, voluntarily submitted by builders.</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-not-collect" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="data-not-collect"><Lock className="inline h-4 w-4 mr-2" />Data We Do NOT Collect</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>We want to be explicit about what we <strong>never</strong> collect, store, or have access to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Passwords or authentication credentials</li>
                      <li>Private keys or seed phrases</li>
                      <li>Email addresses</li>
                      <li>Phone numbers</li>
                      <li>Financial account information (bank accounts, credit cards)</li>
                      <li>Browsing history outside the Rezilience platform</li>
                      <li>Private messages or DMs from any social platform</li>
                      <li>Biometric data of any kind</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-use" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="data-use"><Eye className="inline h-4 w-4 mr-2" />How We Use Data</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>All data collected serves exactly three purposes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Scoring:</strong> Computing Rezilience Scores using the published methodology (GitHub 40%, Dependencies 25%, Governance 20%, TVL/Economic 15%)</li>
                      <li><strong>Public Transparency:</strong> Displaying ecosystem health data on the Explorer, Leaderboard, and individual protocol pages</li>
                      <li><strong>Ecosystem Health Monitoring:</strong> Generating aggregate snapshots and trend data for the Solana ecosystem</li>
                    </ul>
                    <p>We do not use your data for advertising, profiling, or behavioral targeting. Period.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-sharing" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="data-sharing"><Globe className="inline h-4 w-4 mr-2" />Data Sharing</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
                      <p className="font-medium text-foreground">We do not sell data. Period.</p>
                    </div>
                    <p>All registry data is designed to be public. When you claim a project, you are publishing information to a public transparency layer. This is the entire point of the platform.</p>
                    <p>We do not share data with advertisers, data brokers, or any third party for monetization purposes. The only "sharing" that occurs is the public display of voluntarily submitted and publicly available data on the platform itself.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-retention" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="data-retention"><Trash2 className="inline h-4 w-4 mr-2" />Data Retention & Deletion</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Registry data is retained as long as a claimed profile exists. You have full control over your data:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Profile Deletion:</strong> You can delete your entire claimed profile at any time from the Dashboard. This removes all voluntarily submitted data (name, description, logo, team members, roadmap, media assets).</li>
                      <li><strong>Public Data:</strong> Publicly available data (GitHub metrics, on-chain activity) may continue to be indexed as it is sourced from public APIs and the public blockchain.</li>
                      <li><strong>Analytics:</strong> Anonymous analytics data is retained for platform improvement and cannot be linked back to individual users.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="third-party" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="third-party"><Scale className="inline h-4 w-4 mr-2" />Third-Party Services</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>The platform integrates with the following third-party services, each for a specific, transparent purpose:</p>
                    <div className="grid gap-2">
                      <div className="rounded-sm border border-border p-3 flex items-start gap-3">
                        <span className="font-mono text-xs text-primary shrink-0 mt-0.5">GITHUB API</span>
                        <span>Fetching public repository metrics for scoring</span>
                      </div>
                      <div className="rounded-sm border border-border p-3 flex items-start gap-3">
                        <span className="font-mono text-xs text-primary shrink-0 mt-0.5">X/TWITTER API</span>
                        <span>OAuth authentication and public tweet embedding</span>
                      </div>
                      <div className="rounded-sm border border-border p-3 flex items-start gap-3">
                        <span className="font-mono text-xs text-primary shrink-0 mt-0.5">HELIUS RPC</span>
                        <span>Solana blockchain data (bytecode verification, governance, TVL)</span>
                      </div>
                      <div className="rounded-sm border border-border p-3 flex items-start gap-3">
                        <span className="font-mono text-xs text-primary shrink-0 mt-0.5">ALGOLIA</span>
                        <span>Search indexing for the Explorer and Library</span>
                      </div>
                    </div>
                    <p>Each service operates under its own privacy policy. We encourage you to review them independently.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cookies" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="cookies"><Cookie className="inline h-4 w-4 mr-2" />Cookies & Local Storage</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Rezilience uses <strong>only functional storage</strong>. We have zero advertising trackers.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Session IDs:</strong> Anonymous UUIDs for analytics (no PII)</li>
                      <li><strong>Auth Tokens:</strong> Stored in local storage for maintaining your authenticated session</li>
                      <li><strong>Form Progress:</strong> Temporary local storage for claim form persistence (so you don't lose progress)</li>
                    </ul>
                    <p>That's it. No tracking pixels. No retargeting cookies. No advertising networks. No fingerprinting.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="open-data" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="open-data"><Heart className="inline h-4 w-4 mr-2" />Open Data Philosophy</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>Rezilience is built on the principle that <Def>ecosystem health data should be public</Def>. This means:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Registry data is public by design — scores, metrics, and project information are published for anyone to view</li>
                      <li>The scoring methodology is fully documented in our <a href="/readme" className="text-primary hover:underline">README</a></li>
                      <li>The codebase is open source — you can verify exactly how data is processed</li>
                      <li>Aggregate ecosystem snapshots are published for community analysis</li>
                    </ul>
                    <p>This is not a bug. It is the core feature. If you need private analytics, consider forking the codebase and running your own instance.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contact" className="border border-border rounded-sm px-4">
                  <AccordionTrigger>
                    <SubHeader id="contact">Contact</SubHeader>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <p>For questions about these Terms or our Privacy Policy, reach out through:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Twitter/X: <a href="https://twitter.com/RezilienceSol" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">@RezilienceSol</a></li>
                      <li>GitHub: <a href="https://github.com/rezilience-protocol" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">rezilience-protocol</a></li>
                    </ul>
                    <p>We respond to all inquiries. Because transparency isn't a feature — it's the foundation.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Footer Note */}
            <div className="rounded-sm border border-border bg-card/50 p-6 text-center space-y-2">
              <p className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Built for Builders. Owned by No One. Forkable by Everyone.
              </p>
              <p className="text-xs text-muted-foreground">
                Rezilience Protocol — Open Source Public Good Infrastructure for Solana
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
