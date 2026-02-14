import { Link } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

interface RoomCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  index: number;
}

export function RoomCard({ to, icon: Icon, title, description, count, index }: RoomCardProps) {
  const { trackEvent } = useAnalyticsTracker();
  return (
    <Link
      to={to}
      onClick={() => trackEvent('click', `library_room_${title.toLowerCase()}`)}
      className={cn(
        'group flex flex-col gap-4 rounded-sm border border-border bg-card p-6 transition-all duration-300 card-lift animate-card-enter'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{count}</span>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Explore →
      </span>
    </Link>
  );
}
