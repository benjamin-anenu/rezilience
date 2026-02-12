import { Layout } from '@/components/layout/Layout';
import { BookOpen, FileText, Wrench, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categories = [
  {
    title: 'Guides',
    description: 'Step-by-step tutorials for builders integrating with the Rezilience protocol.',
    icon: BookOpen,
    items: ['Getting Started with Rezilience', 'Claiming Your Builder Profile', 'Understanding Your Resilience Score'],
  },
  {
    title: 'Research',
    description: 'Deep-dives into on-chain security, governance models, and ecosystem health.',
    icon: FileText,
    items: ['Solana Program Liveness Analysis', 'Dependency Risk in DeFi', 'Governance Decay Patterns'],
  },
  {
    title: 'Tools',
    description: 'Open-source utilities and integrations for the Solana developer ecosystem.',
    icon: Wrench,
    items: ['GitHub Telemetry SDK', 'Bytecode Verification CLI', 'Score Embed Widget'],
  },
  {
    title: 'Community Resources',
    description: 'Contribute to the registry, join discussions, and collaborate with builders.',
    icon: Users,
    items: ['Contributor Guidelines', 'Governance Forum', 'Builder Showcase'],
  },
];

export default function Library() {
  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            RESOURCE HUB
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Library
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated guides, research, and tools for builders securing the Solana ecosystem.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.title} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="font-display text-lg">{cat.title}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
