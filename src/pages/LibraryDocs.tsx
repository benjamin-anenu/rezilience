import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { solanaServices, docsCategories } from '@/data/solana-docs';
import { DocsTableOfContents } from '@/components/library/DocsTableOfContents';
import { DocsServiceSection } from '@/components/library/DocsServiceSection';
import { DocsSearchBar } from '@/components/library/DocsSearchBar';
import { AskGptModal, AskGptButton } from '@/components/library/AskGptModal';

export default function LibraryDocs() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gptOpen, setGptOpen] = useState(false);
  const [gptTopic, setGptTopic] = useState('Solana Ecosystem Documentation');
  const [gptContext, setGptContext] = useState<string | undefined>();

  const filtered = useMemo(
    () => selectedCategory
      ? solanaServices.filter(s => s.category === selectedCategory)
      : solanaServices,
    [selectedCategory]
  );

  const handleAskGpt = (prompt: string) => {
    setGptTopic(prompt);
    setGptContext('You are a Solana documentation assistant. Help the user find the right documentation and APIs.');
    setGptOpen(true);
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Hero */}
        <div className="mb-8 max-w-3xl">
          <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to Library
          </Link>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">ECOSYSTEM DOCUMENTATION</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Solana Service Documentation
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Official documentation for the most-used Solana services — APIs, SDKs, and integration guides with direct links.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <DocsSearchBar onAskGpt={handleAskGpt} />
        </div>

        {/* Ask GPT standalone */}
        <div className="mb-10 border-t border-border/30 pt-6">
          <div className="flex items-center gap-3">
            <AskGptButton onClick={() => {
              setGptTopic('Solana Ecosystem Documentation');
              setGptContext('Help the user navigate Solana ecosystem documentation. Suggest relevant services, APIs, and official docs URLs.');
              setGptOpen(true);
            }} />
            <span className="text-xs text-muted-foreground">Not sure where to start? Ask the AI tutor.</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-all duration-200',
              !selectedCategory
                ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,194,182,0.15)]'
                : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
            )}
          >
            All ({solanaServices.length})
          </button>
          {docsCategories.map((cat) => {
            const count = solanaServices.filter(s => s.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={cn(
                  'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-all duration-200',
                  selectedCategory === cat
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,194,182,0.15)]'
                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Main layout: TOC + Content */}
        <div className="flex gap-10">
          <DocsTableOfContents services={filtered} />

          <div className="flex-1 min-w-0 space-y-16">
            {filtered.map((service, i) => (
              <DocsServiceSection key={service.slug} service={service} index={i} />
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-12">
                No services found in this category.
              </p>
            )}
          </div>
        </div>
      </section>

      <AskGptModal open={gptOpen} onOpenChange={setGptOpen} topic={gptTopic} context={gptContext} />
    </Layout>
  );
}
