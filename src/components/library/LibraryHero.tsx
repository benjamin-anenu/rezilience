import { LibrarySearchBar } from './LibrarySearchBar';
import { Database, RefreshCw, Timer } from 'lucide-react';

const stats = [
  { icon: Database, label: '10+ Protocols', description: 'Tier 1 Solana ecosystem' },
  { icon: RefreshCw, label: 'Always Up-to-Date', description: 'Community maintained' },
  { icon: Timer, label: '< 5 min', description: 'To first integration' },
];

export function LibraryHero() {
  return (
    <section className="mb-12">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">RESOURCE HUB</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Library
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The connective tissue between fragmented docs. Find the right protocol, understand when to use it, and integrate in minutes.
        </p>
      </div>

      <div className="mb-8 max-w-2xl">
        <LibrarySearchBar size="large" />
      </div>

      <div className="flex flex-wrap gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10">
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
