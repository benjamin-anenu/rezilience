import { useState } from 'react';
import { z } from 'zod';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const emailSchema = z.string().trim().email('Invalid email').max(255, 'Email too long');

interface SubscribePopoverProps {
  profileId: string;
  projectName: string;
  isSubscribed: boolean;
  onSubscribe: (profileId: string, email: string, projectName: string) => Promise<boolean>;
}

export function SubscribePopover({ profileId, projectName, isSubscribed, onSubscribe }: SubscribePopoverProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { trackEvent } = useAnalyticsTracker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    trackEvent('feature_use', 'subscribe', { project: projectName });
    const ok = await onSubscribe(profileId, result.data, projectName);
    setLoading(false);
    if (ok) {
      setOpen(false);
      setEmail('');
    }
  };

  if (isSubscribed) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1.5 text-xs text-primary">
        <Check className="h-3.5 w-3.5" />
        Subscribed
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Bell className="h-3.5 w-3.5" />
          Subscribe
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-medium text-foreground">Get notified when {projectName} posts</p>
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Subscribe'}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
