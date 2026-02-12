import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UpdateBadgeProps {
  date: string;
}

export function UpdateBadge({ date }: UpdateBadgeProps) {
  const relative = formatDistanceToNow(new Date(date), { addSuffix: true });
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      Updated {relative}
    </span>
  );
}
