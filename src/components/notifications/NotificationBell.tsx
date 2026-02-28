import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnreadCount } from '@/hooks/useNotifications';

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data: count = 0 } = useUnreadCount();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative text-muted-foreground hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-mono font-bold text-primary-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Button>
  );
}
