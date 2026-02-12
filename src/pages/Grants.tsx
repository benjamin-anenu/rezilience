import { ExternalLink, Info, BookOpen, DollarSign, Target, Users, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { solanaGrants, criteriaGuidance, lastUpdated, type SolanaGrant } from '@/data/solana-grants';

const statusConfig: Record<string, { label: string; className: string }> = {
  Open: { label: 'OPEN', className: 'border-primary/40 bg-primary/10 text-primary' },
  Rolling: { label: 'ROLLING', className: 'border-primary/40 bg-primary/10 text-primary' },
  Seasonal: { label: 'SEASONAL', className: 'border-destructive/40 bg-destructive/10 text-destructive' },
};

function GrantCard({ grant }: { grant: SolanaGrant }) {
  const status = statusConfig[grant.status] || statusConfig.Open;

  return (
    <div className="group flex flex-col rounded-sm border border-border bg-card transition-all duration-300 card-lift card-premium">
      {/* Header strip */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {grant.provider}
            </p>
            <h3 className="mt-1.5 font-display text-sm font-semibold leading-snug text-foreground">
              {grant.name}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 rounded-sm text-[9px] font-bold uppercase tracking-widest ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 px-5 py-4">
        {/* Funding & Eligibility data rows */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10">
              <DollarSign className="h-3 w-3 text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">{grant.fundingRange}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-muted">
              <Users className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs leading-relaxed text-muted-foreground">{grant.eligibility}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {grant.description}
        </p>

        {/* Focus Areas */}
        <div className="flex flex-wrap gap-1">
          {grant.focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
            >
              {area}
            </span>
          ))}
        </div>

        {/* Criteria */}
        <div className="rounded-sm border border-border bg-background/50 p-3">
          <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Target className="h-3 w-3 text-primary" />
            Key Criteria
          </p>
          <ul className="space-y-1.5">
            {grant.criteriaHighlights.slice(0, 4).map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary/60" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-1">
          <Button
            asChild
            size="sm"
            className="flex-1 rounded-sm font-mono text-[10px] font-semibold uppercase tracking-widest"
          >
            <a href={grant.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-sm font-mono text-[10px] font-semibold uppercase tracking-widest"
          >
            <a href={grant.learnMoreUrl} target="_blank" rel="noopener noreferrer">
              Details
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Grants() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-10 max-w-3xl">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            Funding Directory
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl gradient-text">
            Solana Grants Directory
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A curated directory of funding opportunities across the Solana ecosystem. Whether you're
            a solo developer or a full team, there's a grant program for your stage.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        {/* Disclaimers */}
        <div className="mb-10 space-y-2">
          <div className="flex items-start gap-3 rounded-sm border border-border bg-card/60 p-4">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              This directory is maintained as a public good by Rezilience. Information may change —
              always verify directly with grant providers before applying.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Transparency note:</span> Rezilience
              is also an active grant applicant within the Solana ecosystem.
            </p>
          </div>
        </div>

        {/* Grant Cards Grid */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Available Programs
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground">
              {solanaGrants.length} LISTED
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solanaGrants.map((grant, i) => (
              <div
                key={grant.name}
                className="animate-card-enter"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <GrantCard grant={grant} />
              </div>
            ))}
          </div>
        </section>

        {/* Criteria Guidance */}
        <section className="mb-16 max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              What Grant Providers Look For
            </h2>
          </div>
          <Accordion type="multiple" className="rounded-sm border border-border bg-card">
            {criteriaGuidance.map((item, i) => (
              <AccordionItem key={item.title} value={`item-${i}`} className="border-border px-5">
                <AccordionTrigger className="font-display text-sm font-semibold tracking-wide text-foreground hover:text-primary hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-sm border border-border bg-card/60 p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Know a grant program we're missing?{' '}
            <a
              href="https://x.com/RezilienceSol"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Let us know on X →
            </a>
          </p>
        </section>
      </div>
    </Layout>
  );
}
