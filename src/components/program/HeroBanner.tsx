import { CheckCircle, ExternalLink, Globe, Github, MessageCircle, Send, Shield, RefreshCw, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Program } from '@/types';

interface HeroBannerProps {
  program: Program;
  websiteUrl?: string;
  xUsername?: string;
  discordUrl?: string;
  telegramUrl?: string;
  githubUrl?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  description?: string;
  logoUrl?: string;
  // Owner mode props
  isOwner?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function HeroBanner({
  program,
  websiteUrl,
  xUsername,
  discordUrl,
  telegramUrl,
  githubUrl,
  isVerified,
  verifiedAt,
  description,
  logoUrl,
  isOwner,
  onRefresh,
  isRefreshing,
}: HeroBannerProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
  const scorePercentage = Math.min(program.score, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
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
        {/* Badge - Top Right: Owner or Verified */}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          {isOwner ? (
            <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/40 font-display font-bold uppercase tracking-wider gap-1.5 px-3 py-1.5">
              <Shield className="h-3.5 w-3.5" />
              YOUR PROTOCOL
            </Badge>
          ) : isVerified ? (
            <Badge className="bg-primary/20 text-primary border-primary/40 font-display font-bold uppercase tracking-wider gap-1.5 px-3 py-1.5 glow-signal">
              <Shield className="h-3.5 w-3.5" />
              VERIFIED TITAN
            </Badge>
          ) : null}
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Left Side: Logo + Name + Description */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Logo */}
            <div className={cn(
              "mb-4 flex h-20 w-20 items-center justify-center rounded-sm border border-primary/30 bg-primary/10 sm:h-24 sm:w-24",
              isVerified && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
            )}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={program.name}
                  className="h-full w-full rounded-sm object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={cn(
                "font-display text-3xl font-bold text-primary sm:text-4xl",
                logoUrl && "hidden"
              )}>
                {program.name.charAt(0)}
              </span>
            </div>

            {/* Project Name */}
            <h1 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {program.name}
            </h1>

            {/* Status Badges Row */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {program.livenessStatus === 'active' && (
                <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary text-xs">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  ACTIVE
                </Badge>
              )}
              {program.livenessStatus === 'dormant' && (
                <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground text-xs">
                  DORMANT
                </Badge>
              )}
              {program.livenessStatus === 'degraded' && (
                <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive text-xs">
                  DEGRADED
                </Badge>
              )}
              
              {program.rank > 0 && (
                <Badge variant="outline" className="border-border text-muted-foreground font-mono text-xs">
                  RANK #{program.rank}
                </Badge>
              )}
            </div>

            {/* Short Description */}
            {description && (
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {description.replace(/<[^>]+>/g, '').substring(0, 160)}
                {description.length > 160 ? '...' : ''}
              </p>
            )}

            {/* Program ID */}
            {program.programId && (
              <div className="mb-6 flex items-center gap-2 rounded-sm border border-border bg-muted/30 px-3 py-2">
                <code className="font-mono text-xs text-muted-foreground">
                  {program.programId.length > 20
                    ? `${program.programId.slice(0, 8)}...${program.programId.slice(-8)}`
                    : program.programId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(program.programId)}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                >
                  <a
                    href={`https://explorer.solana.com/address/${program.programId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            )}

            {/* Owner Actions Row */}
            {isOwner && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-display text-xs uppercase tracking-wider"
                        asChild
                      >
                        <Link to={`/program/${program.id}`}>
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
                </TooltipProvider>
              </div>
            )}

            {/* Social Icons Row */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-2">
                {/* Website */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {websiteUrl ? (
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10" asChild>
                        <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-9 w-9 cursor-not-allowed opacity-30" disabled>
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{websiteUrl ? 'Website' : 'No website'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* X/Twitter */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {xUsername ? (
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-primary/50 hover:bg-primary/10" asChild>
                        <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer">
                          <span className="text-sm font-bold">𝕏</span>
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-9 w-9 cursor-not-allowed opacity-30" disabled>
                        <span className="text-sm font-bold">𝕏</span>
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{xUsername ? `@${xUsername}` : 'No X account'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Discord */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {discordUrl ? (
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10" asChild>
                        <a href={discordUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 text-[#5865F2]" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-9 w-9 cursor-not-allowed opacity-30" disabled>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{discordUrl ? 'Discord' : 'No Discord'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Telegram */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {telegramUrl ? (
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:border-[#0088cc]/50 hover:bg-[#0088cc]/10" asChild>
                        <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                          <Send className="h-4 w-4 text-[#0088cc]" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-9 w-9 cursor-not-allowed opacity-30" disabled>
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{telegramUrl ? 'Telegram' : 'No Telegram'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* GitHub */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    {githubUrl ? (
                      <Button variant="outline" size="icon" className="h-9 w-9 border-primary/40 bg-primary/10 hover:bg-primary/20" asChild>
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 text-primary" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-9 w-9 cursor-not-allowed opacity-30" disabled>
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{githubUrl ? 'GitHub' : 'No GitHub'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Right Side: Animated Score Ring */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "relative flex h-40 w-40 items-center justify-center rounded-full sm:h-48 sm:w-48",
              getScoreGlow(program.score)
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
                  getScoreColor(program.score)
                )}>
                  {program.score}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  / 100
                </p>
              </div>
            </div>

            {/* Score explanation tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-2 hover:text-primary hover:underline">
                  What is this score?
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  The Resilience Score measures a project's long-term sustainability based on development activity, 
                  code originality, community engagement, and on-chain verification.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Verified timestamp */}
            {isVerified && verifiedAt && (
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-primary" />
                Verified {new Date(verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
