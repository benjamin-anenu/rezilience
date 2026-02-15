import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function RegistryFloatingWidget() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky top-24 hidden xl:block w-56 shrink-0">
      <div className="rounded-sm border border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Mini score preview */}
        <div className="border-b border-border bg-primary/5 px-4 py-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sample Score
          </p>
          <p className="font-mono text-3xl font-bold text-primary mt-1">72</p>
          <p className="font-mono text-[10px] text-primary/60 uppercase">Healthy</p>
        </div>

        {/* Mini dimensions */}
        <div className="px-4 py-3 space-y-2">
          <DimRow icon={TrendingUp} label="GitHub" value={82} />
          <DimRow icon={Zap} label="Deps" value={68} />
          <DimRow icon={Heart} label="Gov" value={55} />
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <Button asChild size="sm" className="w-full gap-1.5 font-display text-xs uppercase tracking-wider">
            <Link to="/claim-profile">
              <ShieldCheck className="h-3.5 w-3.5" />
              Join Registry
            </Link>
          </Button>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Free · No lock-in · Public good
          </p>
        </div>
      </div>
    </div>
  );
}

function DimRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
        </div>
        <span className="font-mono text-[10px] font-bold text-foreground w-6 text-right">{value}</span>
      </div>
    </div>
  );
}
