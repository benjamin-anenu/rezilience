import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TOCItem {
  id: string;
  label: string;
  level: number;
}

const tocItems: TOCItem[] = [
  { id: 'overview', label: 'Overview', level: 1 },
  { id: 'core-concepts', label: 'Core Concepts', level: 1 },
  { id: 'zero-proof', label: 'Zero Proof Philosophy', level: 2 },
  { id: 'four-dimensions', label: 'Four Dimensions', level: 2 },
  { id: 'scoring', label: 'Scoring Methodology', level: 1 },
  { id: 'github-score', label: 'GitHub Activity (40%)', level: 2 },
  { id: 'dependency-score', label: 'Dependency Health (25%)', level: 2 },
  { id: 'governance-score', label: 'Governance (20%)', level: 2 },
  { id: 'tvl-score', label: 'TVL/Economic (15%)', level: 2 },
  { id: 'decay', label: 'Decay Rate', level: 2 },
  { id: 'indicators', label: 'Visual Indicators', level: 1 },
  { id: 'score-colors', label: 'Score Colors', level: 2 },
  { id: 'health-dots', label: 'Health Dots (D/G/T)', level: 2 },
  { id: 'status-icons', label: 'Status Icons', level: 2 },
  { id: 'tier-labels', label: 'Tier Labels', level: 2 },
  { id: 'features', label: 'Platform Features', level: 1 },
  { id: 'for-builders', label: 'For Solana Builders', level: 1 },
  { id: 'join-registry', label: 'Join the Registry', level: 2 },
  { id: 'authority-verification', label: 'Claim a Project', level: 2 },
  { id: 'claim-blacklist', label: 'Blacklist', level: 2 },
  { id: 'improve-continuity', label: 'Improve Continuity', level: 2 },
  { id: 'data-provenance', label: 'Data Provenance', level: 1 },
  { id: 'roadmap', label: 'Product Roadmap', level: 1 },
  { id: 'faq', label: 'FAQ', level: 1 },
];

export function TableOfContents() {
  const [activeId, setActiveId] = useState('overview');
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

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="hidden lg:block sticky top-24 w-64 shrink-0 self-start">
      <div className="rounded-sm border border-border bg-card/50 p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>TABLE OF CONTENTS</span>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              !isCollapsed && 'rotate-90'
            )}
          />
        </button>

        {!isCollapsed && (
          <ul className="mt-4 space-y-1">
            {tocItems.map(({ id, label, level }) => (
              <li key={id}>
                <button
                  onClick={() => scrollToSection(id)}
                  className={cn(
                    'w-full text-left text-sm transition-colors hover:text-primary',
                    level === 2 && 'pl-4',
                    activeId === id
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
