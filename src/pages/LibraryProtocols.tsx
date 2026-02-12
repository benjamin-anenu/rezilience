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
      <section className="container mx-auto px-4 py-16 lg:px-8 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to Library
          </Link>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">PROTOCOLS</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Protocol Search</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Find the right protocol, understand when to use it, and integrate in minutes.</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-lg">
          <LibrarySearchBar size="large" />
        </div>

        {/* Category pills + Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-all duration-200',
                !selectedCategory
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,194,182,0.15)]'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
              )}
            >
              All ({protocols.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  'shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-all duration-200',
                  selectedCategory === cat.id
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,194,182,0.15)]'
                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                {cat.name} ({cat.protocolCount})
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-sm border border-border/50 bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
          >
            <option value="name">Sort: A-Z</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="difficulty">Sort: Difficulty</option>
          </select>
        </div>

        {/* Count */}
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {displayedProtocols.length} protocol{displayedProtocols.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Protocol List */}
        <div className="space-y-3">
          {displayedProtocols.map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
