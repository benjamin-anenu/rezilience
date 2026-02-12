import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { UpdateBadge } from './UpdateBadge';
import { ChevronRight, Clock, ExternalLink } from 'lucide-react';
import type { Protocol } from '@/data/protocols';
import { cn } from '@/lib/utils';

interface ProtocolCardProps {
  protocol: Protocol;
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  Easy: { label: 'EASY', className: 'border-primary/40 bg-primary/10 text-primary' },
  Medium: { label: 'MEDIUM', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  Advanced: { label: 'ADVANCED', className: 'border-violet-500/40 bg-violet-500/10 text-violet-400' },
};

const categoryLabel = (cat: string) => {
  if (cat === 'defi') return 'DeFi';
  if (cat === 'developer-tools') return 'Dev Tools';
  if (cat === 'nfts') return 'NFTs';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  const diff = difficultyConfig[protocol.integrationDifficulty] ?? difficultyConfig.Easy;

  return (
    <Link
      to={`/library/${protocol.slug}`}
      className="group flex items-start gap-4 rounded-sm border border-border/50 bg-background p-5 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-[0_0_20px_rgba(0,194,182,0.06)]"
    >
      {/* Left: Teal accent dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="h-3 w-3 rounded-full border-2 border-primary/30 bg-background group-hover:border-primary group-hover:shadow-[0_0_8px_rgba(0,194,182,0.3)] transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{protocol.name}</h3>
          <Badge variant="outline" className={cn('shrink-0 rounded-sm px-1.5 py-0 text-[9px] font-mono tracking-wider', diff.className)}>
            {diff.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-2.5">
          <Badge variant="outline" className="rounded-sm border-border/40 bg-muted/20 px-1.5 py-0 text-[9px] font-mono text-muted-foreground">
            {categoryLabel(protocol.category)}
          </Badge>
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            ~{protocol.estimatedIntegrationTime}
          </span>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed mb-3">{protocol.description}</p>

        <UpdateBadge date={protocol.lastUpdated} />
      </div>

      {/* Right arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
    </Link>
  );
}
