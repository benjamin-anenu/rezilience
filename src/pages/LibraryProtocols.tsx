import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LibrarySearchBar, ProtocolCard } from '@/components/library';
import { protocols, getProtocolsByCategory } from '@/data/protocols';
import { categories } from '@/data/categories';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type SortBy = 'name' | 'updated' | 'difficulty';

export default function LibraryProtocols() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const displayedProtocols = useMemo(() => {
    const list = selectedCategory ? getProtocolsByCategory(selectedCategory) : [...protocols];
    switch (sortBy) {
      case 'updated': return list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
      case 'difficulty': {
        const order = { Easy: 0, Medium: 1, Advanced: 2 };
        return list.sort((a, b) => order[a.integrationDifficulty] - order[b.integrationDifficulty]);
      }
      default: return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [selectedCategory, sortBy]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to Library
          </Link>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">PROTOCOLS</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Protocol Search</h1>
          <p className="mt-2 text-muted-foreground">Find the right protocol, understand when to use it, and integrate in minutes.</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <LibrarySearchBar size="large" />
        </div>

        {/* Category pills + Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors',
                !selectedCategory ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              All ({protocols.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors',
                  selectedCategory === cat.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.name} ({cat.protocolCount})
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="name">Sort: A-Z</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="difficulty">Sort: Difficulty</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProtocols.map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
