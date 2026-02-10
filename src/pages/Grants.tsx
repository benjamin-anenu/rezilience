import { ExternalLink, Info, BookOpen, DollarSign, Target, Users, ChevronRight } from 'lucide-react';
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
import { solanaGrants, criteriaGuidance, lastUpdated } from '@/data/solana-grants';

const statusColor: Record<string, string> = {
  Open: 'bg-primary/20 text-primary border-primary/30',
  Rolling: 'bg-chart-1/20 text-primary border-primary/30',
  Seasonal: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function Grants() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:px-8">
        {/* Header */}
        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl gradient-text">
            Solana Grants Directory
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A curated directory of funding opportunities across the Solana ecosystem. Whether you're
            a solo developer or a full team, there's a grant program for your stage.
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        {/* Disclaimers */}
        <div className="mb-10 space-y-3">
          <div className="flex items-start gap-3 rounded-sm border border-border bg-card/60 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              This directory is maintained as a public good by Resilience. Information may change —
              always verify directly with grant providers before applying.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Transparency note:</span> Resilience
              is also an active grant applicant within the Solana ecosystem.
            </p>
          </div>
        </div>

        {/* Grant Cards Grid */}
        <section className="mb-16">
          <h2 className="mb-6 font-display text-xl font-semibold tracking-tight text-foreground">
            Available Grant Programs
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solanaGrants.map((grant) => (
              <Card
                key={grant.name}
                className="group flex flex-col border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {grant.provider}
                      </p>
                      <CardTitle className="mt-1 text-base font-semibold leading-snug text-foreground">
                        {grant.name}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`shrink-0 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${statusColor[grant.status] || ''}`}
                    >
                      {grant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  {/* Funding & Eligibility */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">{grant.fundingRange}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{grant.eligibility}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {grant.description}
                  </p>

                  {/* Focus Areas */}
                  <div className="flex flex-wrap gap-1.5">
                    {grant.focusAreas.map((area) => (
                      <Badge
                        key={area}
                        variant="outline"
                        className="rounded-sm text-[10px] font-medium"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>

                  {/* Criteria Highlights */}
                  <div className="rounded-sm border border-border bg-background/50 p-3">
                    <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Target className="h-3 w-3" />
                      Key Criteria
                    </p>
                    <ul className="space-y-1">
                      {grant.criteriaHighlights.slice(0, 4).map((c) => (
                        <li
                          key={c}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1 font-display text-xs font-semibold uppercase tracking-wider">
                      <a href={grant.applyUrl} target="_blank" rel="noopener noreferrer">
                        Apply
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="font-display text-xs font-semibold uppercase tracking-wider"
                    >
                      <a href={grant.learnMoreUrl} target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Criteria Guidance */}
        <section className="mb-16 max-w-3xl">
          <h2 className="mb-6 font-display text-xl font-semibold tracking-tight text-foreground">
            What Grant Providers Look For
          </h2>
          <Accordion type="multiple" className="rounded-sm border border-border bg-card">
            {criteriaGuidance.map((item, i) => (
              <AccordionItem key={item.title} value={`item-${i}`} className="border-border px-4">
                <AccordionTrigger className="font-display text-sm font-semibold tracking-wide text-foreground hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-sm border border-border bg-card/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Know a grant program we're missing?{' '}
            <a
              href="https://x.com/ResilienceSol"
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
