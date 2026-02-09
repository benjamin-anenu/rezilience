import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';

interface ScoreBreakdown {
  github: number;
  dependency: number;
  governance: number;
  tvl: number;
}

interface ScoreBreakdownTooltipProps {
  breakdown?: ScoreBreakdown | null;
  totalScore: number;
  children: React.ReactNode;
}

export function ScoreBreakdownTooltip({
  breakdown,
  totalScore,
  children,
}: ScoreBreakdownTooltipProps) {
  // Default breakdown if not provided
  const defaultBreakdown: ScoreBreakdown = {
    github: totalScore, // Assume all from GitHub if no breakdown
    dependency: 50,
    governance: 0,
    tvl: 0,
  };

  const scores = breakdown || defaultBreakdown;

  // Calculate weighted contributions
  const weights = {
    github: 0.40,
    dependency: 0.25,
    governance: 0.20,
    tvl: 0.15,
  };

  const contributions = {
    github: Math.round(scores.github * weights.github),
    dependency: Math.round(scores.dependency * weights.dependency),
    governance: Math.round(scores.governance * weights.governance),
    tvl: Math.round(scores.tvl * weights.tvl),
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-primary';
    if (score >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="w-64 p-4" side="bottom">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                Score Breakdown
              </span>
              <span className="font-mono text-sm font-bold">
                {totalScore}/100
              </span>
            </div>

            {/* GitHub (40%) */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">GitHub Activity (40%)</span>
                <span className={`font-mono font-medium ${getScoreColor(scores.github)}`}>
                  +{contributions.github}
                </span>
              </div>
              <Progress value={scores.github} className="h-1.5" />
            </div>

            {/* Dependencies (25%) */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dependency Health (25%)</span>
                <span className={`font-mono font-medium ${getScoreColor(scores.dependency)}`}>
                  +{contributions.dependency}
                </span>
              </div>
              <Progress 
                value={scores.dependency} 
                className={`h-1.5 ${scores.dependency < 50 ? '[&>div]:bg-amber-500' : ''}`} 
              />
            </div>

            {/* Governance (20%) */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Governance (20%)</span>
                <span className={`font-mono font-medium ${getScoreColor(scores.governance)}`}>
                  +{contributions.governance}
                </span>
              </div>
              <Progress 
                value={scores.governance} 
                className={`h-1.5 ${scores.governance < 30 ? '[&>div]:bg-muted-foreground' : ''}`} 
              />
            </div>

            {/* TVL (15%) */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Economic Health (15%)</span>
                <span className={`font-mono font-medium ${getScoreColor(scores.tvl)}`}>
                  +{contributions.tvl}
                </span>
              </div>
              <Progress 
                value={scores.tvl} 
                className={`h-1.5 ${scores.tvl < 30 ? '[&>div]:bg-muted-foreground' : ''}`} 
              />
            </div>

            {/* Formula explanation */}
            <div className="border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground/70">
                R = 0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
