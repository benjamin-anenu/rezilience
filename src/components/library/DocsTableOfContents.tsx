import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { SolanaService } from '@/data/solana-docs';

interface DocsTableOfContentsProps {
  services: SolanaService[];
}

export function DocsTableOfContents({ services }: DocsTableOfContentsProps) {
  const [activeId, setActiveId] = useState(services[0]?.slug ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%', threshold: 0 }
    );

    services.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [services]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="hidden lg:block sticky top-24 w-64 shrink-0 self-start">
      <div className="rounded-sm border border-border bg-card/50 p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>SERVICES</span>
          <ChevronRight className={cn('h-4 w-4 transition-transform', !isCollapsed && 'rotate-90')} />
        </button>

        {!isCollapsed && (
          <ul className="mt-4 space-y-1">
            {services.map(({ slug, name }) => (
              <li key={slug}>
                <button
                  onClick={() => scrollTo(slug)}
                  className={cn(
                    'w-full text-left text-sm transition-colors hover:text-primary',
                    activeId === slug ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
