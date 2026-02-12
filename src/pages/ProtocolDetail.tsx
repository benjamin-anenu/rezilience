import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CodeBlock, UpdateBadge } from '@/components/library';
import { getProtocolBySlug } from '@/data/protocols';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Github, MessageCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ProtocolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const protocol = slug ? getProtocolBySlug(slug) : undefined;

  useEffect(() => {
    if (slug && !protocol) {
      toast({ title: 'Protocol not found', description: `No protocol found for "${slug}".`, variant: 'destructive' });
      navigate('/library', { replace: true });
    }
  }, [slug, protocol, navigate]);

  if (!protocol) return null;

  const categoryLabel = protocol.category === 'defi' ? 'DeFi' : protocol.category === 'developer-tools' ? 'Dev Tools' : protocol.category === 'nfts' ? 'NFTs' : protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 lg:px-8">
        {/* Back nav */}
        <Link to="/library" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">{protocol.name}</h1>
                <Badge variant="secondary">{categoryLabel}</Badge>
                <Badge variant="outline" className="text-xs">{protocol.integrationDifficulty}</Badge>
              </div>
              <p className="mb-3 text-lg text-muted-foreground">{protocol.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <UpdateBadge date={protocol.lastUpdated} />
                <div className="flex items-center gap-2">
                  <a href={protocol.links.official} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Website
                  </a>
                  <a href={protocol.links.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" /> Docs
                  </a>
                  <a href={protocol.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Github className="h-3 w-3" /> GitHub
                  </a>
                  {protocol.links.discord && (
                    <a href={protocol.links.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <MessageCircle className="h-3 w-3" /> Discord
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="font-display text-lg">Quick Start</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Install</p>
                  {protocol.installCommands.map((cmd, i) => (
                    <CodeBlock key={i} code={cmd} language="bash" />
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Basic Usage</p>
                  <CodeBlock code={protocol.codeExample} language="typescript" />
                </div>
              </CardContent>
            </Card>

            {/* When to Use / When Not to Use */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="flex items-center gap-2 font-display text-lg"><CheckCircle2 className="h-5 w-5 text-primary" /> When to Use</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {protocol.whenToUse.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="flex items-center gap-2 font-display text-lg"><XCircle className="h-5 w-5 text-destructive" /> When Not to Use</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {protocol.whenNotToUse.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Common Issues */}
            {protocol.commonIssues.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader><CardTitle className="flex items-center gap-2 font-display text-lg"><AlertTriangle className="h-5 w-5 text-destructive" /> Common Issues</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {protocol.commonIssues.map((issue, i) => (
                    <div key={i}>
                      <p className="mb-1 text-sm font-medium text-foreground">{issue.problem}</p>
                      <p className="mb-2 text-sm text-muted-foreground">{issue.solution}</p>
                      {issue.code && <CodeBlock code={issue.code} language="typescript" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="font-display text-lg">Quick Facts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Use Case', protocol.quickFacts.useCase],
                  ['Maturity', protocol.quickFacts.maturity],
                  ['Maintainer', protocol.quickFacts.maintainer],
                  ['License', protocol.quickFacts.license],
                  ['Difficulty', protocol.integrationDifficulty],
                  ['Time to Integrate', protocol.estimatedIntegrationTime],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <a href={protocol.links.docs} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-sm border border-primary bg-primary/10 px-4 py-3 font-display text-sm font-semibold text-primary transition-colors hover:bg-primary/20">
              <ExternalLink className="h-4 w-4" /> Full Documentation
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
