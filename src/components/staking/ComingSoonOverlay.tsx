import { Clock, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
interface ComingSoonOverlayProps {
  onJoinWaitlist?: () => void;
}
export function ComingSoonOverlay({
  onJoinWaitlist
}: ComingSoonOverlayProps) {
  return <div className="mb-8">
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/20">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-sm bg-primary/20 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    PHASE 2
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                    STAKING COMING SOON
                  </h3>
                </div>
                <p className="max-w-lg text-sm text-muted-foreground">
                  Continuity Bonds will launch in Phase 2. Stake SOL on Projects you believe in, earn yield based on their Resilience Score, and help fund ecosystem sustainability.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 border-primary/50 hover:bg-primary/10" onClick={onJoinWaitlist}>
              <Bell className="mr-2 h-4 w-4" />
              JOIN WAITLIST
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Phase Timeline */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4">
            <div className="text-center">
              <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 0</div>
              <div className="font-display text-sm font-semibold text-primary">REGISTRY</div>
              <div className="text-xs text-primary/70">✓ LIVE</div>
            </div>
            <div className="text-center">
              <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 1</div>
              <div className="font-display text-sm font-semibold text-foreground">HEATMAP</div>
              <div className="text-xs text-muted-foreground">IN PROGRESS</div>
            </div>
            <div className="text-center">
              <div className="mb-1 font-mono text-xs text-muted-foreground">PHASE 2</div>
              <div className="font-display text-sm font-semibold text-muted-foreground">STAKING</div>
              <div className="text-xs text-muted-foreground">Q2 2026</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}