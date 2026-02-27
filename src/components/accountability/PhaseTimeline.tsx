import { Clock, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

export function PhaseTimeline() {
  const { trackEvent } = useAnalyticsTracker();

  const handleJoinWaitlist = () => {
    trackEvent('click', 'bounty_board_waitlist');
    toast.success('Thanks for your interest!', {
      description: "We'll notify you when the Bounty Board launches in Phase 2.",
    });
  };

  return (
    <div className="mb-8">
      {/* Phase progress strip — compact, non-intrusive */}
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

      {/* Phase 2 callout — below content, de-emphasized */}
      <Card className="border-border bg-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
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
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={handleJoinWaitlist}
            >
              <Bell className="mr-1.5 h-3 w-3" />
              NOTIFY ME
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
