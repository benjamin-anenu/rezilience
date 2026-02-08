import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Activity, Fingerprint, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeroStats } from '@/hooks/useHeroStats';
import heroBg from '@/assets/hero-bg.png';

function getRegistryDisplay(count: number, mode: 'launching' | 'early' | 'growing') {
  if (mode === 'launching') {
    return { value: 'LAUNCHING', badge: 'SOON' };
  }
  if (mode === 'early') {
    return { value: count.toString(), badge: 'EARLY ACCESS' };
  }
  return { value: count.toLocaleString(), badge: 'GROWING' };
}

export function HeroSection() {
  const { data: heroStats, isLoading } = useHeroStats();

  // Build dynamic stats from database
  const registryDisplay = heroStats 
    ? getRegistryDisplay(heroStats.registryCount, heroStats.displayMode)
    : { value: '...', badge: '' };

  const stats = [
    {
      value: registryDisplay.value,
      label: heroStats?.displayMode === 'launching' ? 'Registry Status' : 'Registered Protocols',
      tooltip: heroStats?.displayMode === 'launching' 
        ? 'The Resilience Registry is launching soon. Be among the first to claim your protocol.'
        : 'Verified protocols in the Resilience Registry who have secured their standing.',
      badge: registryDisplay.badge,
    },
    {
      value: heroStats ? `${heroStats.activeCount}` : '...',
      label: 'Active Heartbeats',
      tooltip: 'Protocols with verified activity in the last 14 days and 5+ events.',
      badge: undefined,
    },
    {
      value: heroStats ? heroStats.averageScore.toFixed(1) : '...',
      label: 'Avg. Resilience',
      tooltip: 'Average Resilience Score across all verified protocols in the registry.',
      badge: undefined,
    }
  ];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background image with dark overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/80" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-primary">ON-CHAIN ASSURANCE</span>
            </div>

            <h1 className="mb-6 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              REPUTATION CAN'T BE{' '}
              <span className="text-primary">FORKED.</span>
            </h1>

            <p className="mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
              Any dev can copy a repo. You can't fake a heartbeat. We turn your development velocity into an immutable Resilience score that investors can bank on. Don't just launch. Outlast.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button asChild size="lg" className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider touch-feedback sm:w-auto">
                <Link to="/explorer">
                  SOLANA PROJECT VITALS
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                disabled 
                className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider cursor-not-allowed sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                STAKE NOW
                <span className="ml-2 text-xs text-muted-foreground">(COMING SOON)</span>
              </Button>
            </div>

            {/* Stats - Stack vertically on mobile */}
            <TooltipProvider>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-8">
                {isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between rounded-sm border border-border bg-card/50 p-4 sm:block sm:border-0 sm:bg-transparent sm:p-0">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="mt-1 h-4 w-24" />
                      </div>
                    ))}
                  </>
                ) : (
                  stats.map((stat) => (
                    <div 
                      key={stat.label} 
                      className="flex items-center justify-between rounded-sm border border-border bg-card/50 p-4 sm:block sm:border-0 sm:bg-transparent sm:p-0"
                    >
                      <div className="flex items-center gap-2 sm:block">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
                          {stat.badge && (
                            <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                              {stat.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground sm:hidden">{stat.label}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="hidden text-sm text-muted-foreground sm:block">{stat.label}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help sm:h-3 sm:w-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs border-primary/20">
                            <p className="text-xs">{stat.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>

          {/* Right content - Abstract geometric illustration */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-96 w-96">
              {/* Central node */}
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-primary bg-primary/20 glow-signal">
                <Shield className="h-10 w-10 text-primary" />
              </div>

              {/* Orbital nodes */}
              <div className="absolute left-0 top-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="absolute right-0 top-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                <Fingerprint className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="absolute bottom-0 left-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="absolute bottom-0 right-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
                <line x1="48" y1="96" x2="160" y2="160" stroke="hsl(var(--border))" strokeWidth="1" />
                <line x1="336" y1="96" x2="224" y2="160" stroke="hsl(var(--border))" strokeWidth="1" />
                <line x1="96" y1="336" x2="160" y2="224" stroke="hsl(var(--border))" strokeWidth="1" />
                <line x1="288" y1="336" x2="224" y2="224" stroke="hsl(var(--border))" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
