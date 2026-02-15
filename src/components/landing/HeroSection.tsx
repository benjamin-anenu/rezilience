import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Lock, Info, GitBranch, Network, Coins, HeartPulse, Fingerprint, Shield, Landmark, BookOpen } from 'lucide-react';
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
  const registryDisplay = heroStats ?
  getRegistryDisplay(heroStats.registryCount, heroStats.displayMode) :
  { value: '...', badge: '' };

  const stats = [
  {
    value: registryDisplay.value,
    label: heroStats?.displayMode === 'launching' ? 'Registry Status' : 'Registered Projects',
    tooltip: heroStats?.displayMode === 'launching' ?
    'The Resilience Registry is launching soon. Be among the first to claim your project.' :
    'Verified projects in the Resilience Registry who have secured their standing.',
    badge: registryDisplay.badge
  },
  {
    value: heroStats ? `${heroStats.activeCount}` : '...',
    label: 'Active Heartbeats',
    tooltip: 'Projects with verified activity in the last 14 days and 5+ events.',
    badge: undefined
  },
  {
    value: heroStats ? heroStats.averageScore.toFixed(1) : '...',
    label: 'Avg. Resilience',
    tooltip: 'Average Resilience Score across all verified projects in the registry.',
    badge: undefined
  }];


  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }} />

      <div className="absolute inset-0 bg-background/80" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs text-primary">DECENTRALIZED ASSURANCE LAYER OF SOLANA</span>
            </div>

            <h1 className="mb-4 font-display text-3xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              REPUTATION CAN'T BE{' '}
              <span className="text-primary">FORKED.</span>
            </h1>

            <p className="mb-6 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground sm:text-base">
              SECURE THE ECOSYSTEM. GET{' '}
              <span className="text-primary">REWARDED</span>{' '}
              FOR LONGEVITY.
            </p>

            <p className="mb-8 max-w-xl text-base text-muted-foreground sm:text-lg">
              Rezilience indexes every Solana project's dependencies, maps supply chain risk, and detects vulnerabilities before they cascade. We score real-time project health across 8 dimensions so broken crates never silently take down the ecosystem. Claim your spot in the Registry, build an on-chain reputation, and stake on proven resilience.
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
                className="w-full min-h-[48px] font-display font-semibold uppercase tracking-wider cursor-not-allowed sm:w-auto">

                <Lock className="mr-2 h-4 w-4" />
                STAKE NOW
                <span className="ml-2 text-xs text-muted-foreground">(COMING SOON)</span>
              </Button>
            </div>

            {/* Stats - Stack vertically on mobile */}
            <TooltipProvider>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-8">
                {isLoading ?
                <>
                    {[1, 2, 3].map((i) =>
                  <div key={i} className="flex items-center justify-between rounded-sm border border-border bg-card/50 p-4 sm:block sm:border-0 sm:bg-transparent sm:p-0">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="mt-1 h-4 w-24" />
                      </div>
                  )}
                  </> :

                stats.map((stat) =>
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-sm border border-border bg-card/50 p-4 sm:block sm:border-0 sm:bg-transparent sm:p-0">

                      <div className="flex items-center gap-2 sm:block">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xl font-bold text-primary sm:text-2xl">{stat.value}</p>
                          {stat.badge &&
                      <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                              {stat.badge}
                            </span>
                      }
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
                )
                }
              </div>
            </TooltipProvider>
          </div>

          {/* Right content - Abstract geometric illustration */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center">
            <div className="relative h-[420px] w-[420px]">
              {/* Rotating scanning ring */}
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" style={{ animation: 'spin 12s linear infinite' }} />
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/5" style={{ animation: 'spin 20s linear infinite reverse' }} />

              {/* Central node - Solana logo */}
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border-2 border-primary bg-primary/10 glow-signal-strong pulse-subtle">
                <svg viewBox="0 0 397.7 311.7" className="h-10 w-10" fill="none">
                  <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="hsl(var(--primary))" />
                  <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="hsl(var(--primary))" />
                  <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="hsl(var(--primary))" />
                </svg>
              </div>

              {/* Orbital nodes - 8 Dimensions of Trust (containerless with glow) */}
              {/* 0. KNOWLEDGE - top center */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ top: '0%', left: '50%', transform: 'translateX(-50%)' }}>
                <BookOpen className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">KNOWLEDGE</span>
              </div>

              {/* 1. CODE - top-left */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ top: '8%', left: '12%' }}>
                <GitBranch className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">CODE</span>
              </div>

              {/* 2. DEPS - top-right */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ top: '8%', right: '12%' }}>
                <Network className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">DEPENDENCIES</span>
              </div>

              {/* 3. LIVENESS - right */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ top: '42%', right: '0%' }}>
                <HeartPulse className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">LIVENESS</span>
              </div>

              {/* 4. ORIGINALITY - bottom-right */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ bottom: '8%', right: '10%' }}>
                <Fingerprint className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">ORIGINALITY</span>
              </div>

              {/* 5. ASSURANCE - bottom center */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ bottom: '0%', left: '50%', transform: 'translateX(-50%)' }}>
                <Shield className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">ASSURANCE</span>
              </div>

              {/* 6. GOV - bottom-left */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ bottom: '8%', left: '10%' }}>
                <Landmark className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">GOVERNANCE</span>
              </div>

              {/* 7. ECON - left */}
              <div className="absolute flex flex-col items-center gap-1.5" style={{ top: '42%', left: '0%' }}>
                <Coins className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} />
                <span className="font-mono text-[10px] text-primary">ECONOMICS</span>
              </div>

              {/* Connection lines - dashed blueprint style (8 lines to center ~210,210) */}
              <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
                <line x1="210" y1="20" x2="210" y2="190" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="72" y1="55" x2="190" y2="190" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="348" y1="55" x2="230" y2="190" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="400" y1="196" x2="235" y2="210" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="340" y1="365" x2="230" y2="230" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="210" y1="400" x2="210" y2="235" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="72" y1="365" x2="190" y2="230" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                <line x1="20" y1="196" x2="185" y2="210" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>);

}