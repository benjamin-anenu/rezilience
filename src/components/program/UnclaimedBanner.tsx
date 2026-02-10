import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UnclaimedBannerProps {
  reason: string;
}

export function UnclaimedBanner({ reason }: UnclaimedBannerProps) {
  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card">
      {/* Subtle amber glow */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl" />

      <CardContent className="relative py-8">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>

          {/* Heading */}
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
            Unclaimed Project
          </h3>

          {/* Reason */}
          <p className="mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed">
            {reason}
          </p>

          {/* Secondary text */}
          <p className="mt-2 text-xs text-muted-foreground/60">
            Verify your authority to unlock this tab
          </p>

          {/* CTA */}
          <Button
            asChild
            size="lg"
            className="mt-6 gap-2 font-display uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Link to="/claim-profile">
              <ShieldCheck className="h-5 w-5" />
              Claim This Project
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
