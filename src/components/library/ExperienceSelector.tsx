import { Link } from 'react-router-dom';
import { Compass, Hammer, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { experienceTiers } from '@/data/learning-paths';
import type { ExperienceLevel } from '@/data/learning-paths';

const iconMap = { Compass, Hammer, Building2 };

interface ExperienceSelectorProps {
  selected?: ExperienceLevel | null;
  onSelect?: (level: ExperienceLevel) => void;
}

export function ExperienceSelector({ selected, onSelect }: ExperienceSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {experienceTiers.map((tier, i) => {
        const Icon = iconMap[tier.icon as keyof typeof iconMap];
        const isActive = selected === tier.id;

        return (
          <Link
            key={tier.id}
            to={`/library/learn/${tier.id}`}
            onClick={() => onSelect?.(tier.id)}
            className={cn(
              'group relative flex flex-col gap-4 rounded-sm border p-6 transition-all duration-300 card-lift',
              isActive
                ? 'border-primary/50 bg-primary/5 glow-signal'
                : 'border-border bg-card hover:border-primary/30'
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-sm',
                isActive ? 'bg-primary/20' : 'bg-primary/10 group-hover:bg-primary/15'
              )}>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{tier.label}</h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{tier.experience}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{tier.tagline}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-mono text-xs text-primary">{tier.modules.length} modules</span>
              <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">Enter →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
