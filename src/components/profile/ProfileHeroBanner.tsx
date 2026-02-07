import { ExternalLink, RefreshCw, Eye, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ClaimedProfile } from '@/types';

interface ProfileHeroBannerProps {
  profile: ClaimedProfile;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ProfileHeroBanner({ profile, onRefresh, isRefreshing }: ProfileHeroBannerProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-primary';
    if (score >= 70) return 'text-foreground';
    return 'text-destructive';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 85) return 'shadow-[0_0_60px_rgba(0,194,182,0.4)]';
    if (score >= 70) return 'shadow-[0_0_40px_rgba(0,194,182,0.2)]';
    return 'shadow-[0_0_30px_rgba(194,78,0,0.3)]';
  };

  // Calculate score ring percentage for animated ring
  const scorePercentage = Math.min(profile.score, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-sm border border-border">
      {/* Web3 Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.05) 0%, transparent 40%),
                          radial-gradient(circle at 40% 20%, hsl(var(--chart-5) / 0.1) 0%, transparent 30%)`
      }} />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Owner Badge + Actions - Top Right */}
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
          <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/40 font-display font-bold uppercase tracking-wider gap-1.5 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5" />
            YOUR PROTOCOL
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Left Side: Logo + Name + Actions */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Logo */}
            <div className={cn(
              "mb-4 flex h-20 w-20 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 sm:h-24 sm:w-24",
              profile.verified && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
            )}>
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.projectName}
                  className="h-full w-full rounded-sm object-cover"
                />
              ) : (
                <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  {profile.projectName.charAt(0)}
                </span>
              )}
            </div>

            {/* Project Name */}
            <h1 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {profile.projectName}
            </h1>

            {/* Status Badges Row */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {profile.livenessStatus === 'active' && (
                <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  ACTIVE
                </Badge>
              )}
              {profile.livenessStatus === 'dormant' && (
                <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground text-xs">
                  DORMANT
                </Badge>
              )}
              {profile.livenessStatus === 'degraded' && (
                <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive text-xs">
                  DEGRADED
                </Badge>
              )}
              
              {profile.verified && (
                <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
                  VERIFIED
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-display text-xs uppercase tracking-wider"
                      asChild
                    >
                      <Link to={`/profile/${profile.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Public Page
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>See how others view your profile</p>
                  </TooltipContent>
                </Tooltip>

                {onRefresh && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-display text-xs uppercase tracking-wider"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                        Refresh Metrics
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Re-sync GitHub data and recalculate score</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {profile.websiteUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        asChild
                      >
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit website</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>

          {/* Right Side: Animated Score Ring */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "relative flex h-40 w-40 items-center justify-center rounded-full sm:h-48 sm:w-48",
              getScoreGlow(profile.score)
            )}>
              {/* Background ring */}
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="4"
                />
                {/* Animated progress ring */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))'
                  }}
                />
              </svg>
              
              {/* Score content */}
              <div className="z-10 text-center">
                <p className="mb-1 font-display text-[10px] uppercase tracking-wider text-muted-foreground">
                  Resilience
                </p>
                <p className={cn(
                  'font-mono text-5xl font-bold sm:text-6xl',
                  getScoreColor(profile.score)
                )}>
                  {profile.score}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  / 100
                </p>
              </div>
            </div>

            {/* Last updated */}
            {profile.verifiedAt && (
              <p className="mt-4 text-[10px] text-muted-foreground">
                Last updated: {new Date(profile.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
