import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UpdateBadge } from './UpdateBadge';
import type { Protocol } from '@/data/protocols';
import { cn } from '@/lib/utils';

interface ProtocolCardProps {
  protocol: Protocol;
}

const difficultyColors: Record<string, string> = {
  Easy: 'bg-primary/20 text-primary border-primary/30',
  Medium: 'bg-destructive/20 text-destructive border-destructive/30',
  Advanced: 'bg-muted text-muted-foreground border-border',
};

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <Link to={`/library/${protocol.slug}`} className="block">
      <Card className="h-full border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">{protocol.name}</h3>
            <Badge variant="outline" className={cn('shrink-0 text-[10px]', difficultyColors[protocol.integrationDifficulty])}>
              {protocol.integrationDifficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {protocol.category === 'defi' ? 'DeFi' : protocol.category === 'developer-tools' ? 'Dev Tools' : protocol.category === 'nfts' ? 'NFTs' : protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1)}
            </Badge>
            <span className="text-xs text-muted-foreground">~{protocol.estimatedIntegrationTime}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{protocol.description}</p>
          <UpdateBadge date={protocol.lastUpdated} />
        </CardContent>
      </Card>
    </Link>
  );
}
