import { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchProtocols } from '@/lib/library-search';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import type { Protocol } from '@/data/protocols';

interface LibrarySearchBarProps {
  size?: 'default' | 'large';
  autoFocus?: boolean;
}

export function LibrarySearchBar({ size = 'default', autoFocus = false }: LibrarySearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Protocol[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState<'algolia' | 'fallback'>('fallback');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { trackEvent } = useAnalyticsTracker();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length > 1) {
        setIsLoading(true);
        trackEvent('search', query, { source: 'library' });
        const res = await searchProtocols(query);
        setResults(res.results.slice(0, 5));
        setSearchMethod(res.searchMethod);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string) => {
    navigate(`/library/${slug}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].slug);
    }
  };

  const inputH = size === 'large' ? 'h-14 text-lg pl-14 pr-12' : 'h-12 pl-12 pr-10';
  const iconSize = size === 'large' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${iconSize}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search protocols, guides, integrations..."
          autoFocus={autoFocus}
          className={`w-full ${inputH} rounded-sm border border-border bg-card font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
        {!isLoading && query.length > 1 && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2">
            {searchMethod === 'algolia' ? <Zap className="h-3.5 w-3.5 text-primary" /> : <Cpu className="h-3.5 w-3.5 text-muted-foreground" />}
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-sm border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</span>
            {searchMethod === 'fallback' && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Cpu className="h-3 w-3" /> Local search</span>
            )}
          </div>
          {results.map((r) => (
            <button key={r.id} onClick={() => handleSelect(r.slug)} className="w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-foreground">{r.name}</span>
                <Badge variant="secondary" className="text-[10px]">{r.category === 'defi' ? 'DeFi' : r.category}</Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 1 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-sm border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground shadow-lg">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
