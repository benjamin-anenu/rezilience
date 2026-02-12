import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { dictionary, dictionaryCategories, searchDictionary, getDictionaryByCategory } from '@/data/dictionary';
import { DictionaryEntryCard } from '@/components/library/DictionaryEntry';
import { Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DictionaryCategory } from '@/data/dictionary';

export default function LibraryDictionary() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DictionaryCategory | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const entries = useMemo(() => {
    if (query.length > 1) return searchDictionary(query);
    if (selectedCategory) return getDictionaryByCategory(selectedCategory);
    return [...dictionary].sort((a, b) => a.term.localeCompare(b.term));
  }, [query, selectedCategory]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to Library
          </Link>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">DICTIONARY</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Solana Dictionary</h1>
          <p className="mt-2 text-muted-foreground">Every term, concept, and abbreviation — explained for builders.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedCategory(null); }}
            placeholder="Search terms..."
            className="w-full rounded-sm border border-border bg-card py-3 pl-11 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(null); setQuery(''); }}
            className={cn(
              'rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors',
              !selectedCategory ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            All ({dictionary.length})
          </button>
          {dictionaryCategories.map((cat) => {
            const count = dictionary.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setQuery(''); }}
                className={cn(
                  'rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors',
                  selectedCategory === cat ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Entries */}
        <div className="rounded-sm border border-border bg-card">
          <div className="border-b border-border px-4 py-3 sm:px-6">
            <span className="font-mono text-xs text-muted-foreground">{entries.length} term{entries.length !== 1 ? 's' : ''}</span>
          </div>
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No terms found for "{query}"
            </div>
          ) : (
            entries.map((entry) => (
              <DictionaryEntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              />
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}
