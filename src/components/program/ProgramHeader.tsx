import { Copy, ExternalLink, Activity, AlertCircle, Globe, Github, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Program } from '@/types';

interface ProgramHeaderProps {
  program: Program;
  websiteUrl?: string;
  xUsername?: string;
  discordUrl?: string;
  telegramUrl?: string;
  githubUrl?: string;
}
 
 export function ProgramHeader({ program, websiteUrl, xUsername, discordUrl, telegramUrl, githubUrl }: ProgramHeaderProps) {
   const copyToClipboard = (text: string) => {
     navigator.clipboard.writeText(text);
   };
 
   const getScoreColor = (score: number) => {
     if (score >= 85) return 'text-primary';
     if (score >= 70) return 'text-foreground';
     return 'text-destructive';
   };
 
   const getStatusBadge = (status: Program['livenessStatus']) => {
     switch (status) {
       case 'active':
         return (
           <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
             <Activity className="mr-1 h-3 w-3" />
             Active
           </Badge>
         );
       case 'dormant':
         return (
           <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground">
             Dormant
           </Badge>
         );
       case 'degraded':
         return (
           <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
             <AlertCircle className="mr-1 h-3 w-3" />
             Degraded
           </Badge>
         );
     }
   };
 
  return (
    <div className="rounded-sm border border-border bg-card p-4 sm:p-6">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 lg:hidden">
        {/* Top: Logo + Name + Status centered */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10">
            <span className="font-display text-2xl font-bold text-primary">
              {program.name.charAt(0)}
            </span>
          </div>
          <h1 className="mb-2 font-display text-xl font-bold text-foreground sm:text-2xl">
            {program.name}
          </h1>
          {getStatusBadge(program.livenessStatus)}
        </div>

        {/* Score Display - Prominent */}
        <div className="flex items-center justify-center gap-6 rounded-sm border border-border bg-background p-4">
          <div className="text-center">
            <p className="mb-1 text-xs uppercase text-muted-foreground">Resilience Score</p>
            <p className={cn('font-mono text-4xl font-bold', getScoreColor(program.score))}>
              {program.score}
            </p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="mb-1 text-xs uppercase text-muted-foreground">Rank</p>
            <p className="font-mono text-xl font-bold text-foreground">#{program.rank}</p>
          </div>
        </div>

        {/* Program ID Row */}
        {program.programId && (
          <div className="flex items-center justify-center gap-2 rounded-sm border border-border bg-background p-3">
            <code className="font-mono text-xs text-muted-foreground">
              {program.programId.length > 16 
                ? `${program.programId.slice(0, 6)}...${program.programId.slice(-6)}`
                : program.programId}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-feedback"
              onClick={() => copyToClipboard(program.programId)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-feedback"
              asChild
            >
              <a
                href={`https://explorer.solana.com/address/${program.programId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}

        {/* Social Icons - Horizontal Scrollable */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
          <TooltipProvider delayDuration={200}>
            {/* Website */}
            {websiteUrl ? (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 touch-feedback" asChild>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5 text-foreground" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 cursor-not-allowed opacity-40" disabled>
                <Globe className="h-5 w-5" />
              </Button>
            )}

            {/* X/Twitter */}
            {xUsername ? (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 touch-feedback" asChild>
                <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer">
                  <span className="text-base font-bold">𝕏</span>
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 cursor-not-allowed opacity-40" disabled>
                <span className="text-base font-bold">𝕏</span>
              </Button>
            )}

            {/* Discord */}
            {discordUrl ? (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 touch-feedback" asChild>
                <a href={discordUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 text-[#5865F2]" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 cursor-not-allowed opacity-40" disabled>
                <MessageCircle className="h-5 w-5" />
              </Button>
            )}

            {/* Telegram */}
            {telegramUrl ? (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 touch-feedback" asChild>
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                  <Send className="h-5 w-5 text-[#0088cc]" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 cursor-not-allowed opacity-40" disabled>
                <Send className="h-5 w-5" />
              </Button>
            )}

            {/* GitHub */}
            {githubUrl ? (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 touch-feedback border-primary/50" asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5 text-primary" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 cursor-not-allowed opacity-40" disabled>
                <Github className="h-5 w-5" />
              </Button>
            )}
          </TooltipProvider>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Left side - Program info */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10">
            <span className="font-display text-2xl font-bold text-primary">
              {program.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {program.name}
              </h1>
              {getStatusBadge(program.livenessStatus)}
            </div>
            <div className="flex items-center gap-2">
              {program.programId && (
                <>
                  <code className="font-mono text-sm text-muted-foreground">
                    {program.programId.length > 20 
                      ? `${program.programId.slice(0, 8)}...${program.programId.slice(-6)}`
                      : program.programId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(program.programId)}
                  >
                    <Copy className="h-3 w-3" />
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
                  <div className="mx-2 h-4 w-px bg-border" />
                </>
              )}
              
              {/* Social Icons Row */}
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-1">
                  {/* Website */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {websiteUrl ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 text-foreground" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-not-allowed opacity-40" disabled>
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{websiteUrl ? 'Website' : 'No website linked'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* X/Twitter */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {xUsername ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={`https://x.com/${xUsername}`} target="_blank" rel="noopener noreferrer">
                            <span className="text-sm font-bold">𝕏</span>
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-not-allowed opacity-40" disabled>
                          <span className="text-sm font-bold">𝕏</span>
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{xUsername ? `@${xUsername}` : 'No X account linked'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Discord */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {discordUrl ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={discordUrl} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 text-[#5865F2]" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-not-allowed opacity-40" disabled>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{discordUrl ? 'Discord' : 'No Discord linked'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Telegram */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {telegramUrl ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                            <Send className="h-4 w-4 text-[#0088cc]" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-not-allowed opacity-40" disabled>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{telegramUrl ? 'Telegram' : 'No Telegram linked'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* GitHub */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {githubUrl ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 text-primary" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 cursor-not-allowed opacity-40" disabled>
                          <Github className="h-4 w-4" />
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{githubUrl ? 'GitHub' : 'No GitHub linked'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Right side - Score */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="mb-1 text-xs uppercase text-muted-foreground">Resilience Score</p>
            <p className={cn('font-mono text-5xl font-bold', getScoreColor(program.score))}>
              {program.score}
            </p>
          </div>
          <div className="h-16 w-px bg-border" />
          <div className="text-center">
            <p className="mb-1 text-xs uppercase text-muted-foreground">Rank</p>
            <p className="font-mono text-2xl font-bold text-foreground">#{program.rank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}