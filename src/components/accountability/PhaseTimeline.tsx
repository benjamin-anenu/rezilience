import { useState } from 'react';
import { Clock, Bell, ArrowRight, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function PhaseTimeline() {
  const { trackEvent } = useAnalyticsTracker();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    trackEvent('click', 'bounty_board_waitlist');

    try {
      const { error } = await supabase.functions.invoke('join-bounty-waitlist', {
        body: { email },
      });
      if (error) throw error;
      setIsJoined(true);
      toast.success("You're on the list!", {
        description: "We'll notify you when the Bounty Board launches.",
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      {/* Phase progress strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center rounded-sm border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 0</div>
          <div className="font-display text-sm font-semibold text-primary">REGISTRY</div>
          <div className="text-xs text-primary/70">✓ LIVE</div>
        </div>
        <div className="text-center rounded-sm border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 1</div>
          <div className="font-display text-sm font-semibold text-primary">ACCOUNTABILITY</div>
          <div className="text-xs text-primary/70">✓ LIVE</div>
        </div>
        <div className="text-center rounded-sm border border-border bg-muted/20 p-3">
          <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 2</div>
          <div className="font-display text-sm font-semibold text-muted-foreground">BOUNTY BOARD</div>
          <div className="text-xs text-muted-foreground">Q2 2026</div>
        </div>
      </div>

      {/* Phase 2 callout */}
      <Card className="border-border bg-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    PHASE 2
                  </span>
                  <span className="font-display text-sm font-semibold uppercase tracking-tight text-muted-foreground">
                    Bounty Board
                  </span>
                </div>
                <p className="mt-1 max-w-lg text-xs text-muted-foreground">
                  Escrowed rewards, on-chain claim/submit/approve, and automated fund release — coming Q2 2026.
                </p>
              </div>
              <Link
                to="/bounty-board"
                className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                LEARN MORE
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Email capture */}
            {isJoined ? (
              <div className="flex items-center gap-2 pl-12 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold">You're on the list!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-12">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinWaitlist()}
                  className="h-8 max-w-xs text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={handleJoinWaitlist}
                  disabled={!email || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Bell className="mr-1.5 h-3 w-3" />
                      NOTIFY ME
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
