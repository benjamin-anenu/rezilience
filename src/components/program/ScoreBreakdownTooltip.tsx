import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface ScoreBreakdown {
  github: number;
  dependencies: number;
  /** @deprecated Use `dependencies` instead */
  dependency?: number;
  governance: number | null;
  tvl: number | null;
  continuityDecay?: number;
  baseScore?: number;
  weights?: {
    github: number;
    dependencies: number;
    governance: number;
    tvl: number;
  };
  applicableDimensions?: string[];
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
  const raw = breakdown || {
    github: totalScore,
    dependencies: 50,
    governance: null,
    tvl: null,
  };
  // Normalize: support both `dependencies` (new) and `dependency` (legacy)
  const scores = {
    ...raw,
    dependencies: (raw as any).dependencies ?? (raw as any).dependency ?? 0,
  };

  // Use stored weights or fall back to defaults
  const weights = (scores as any).weights || {
    github: 0.60,
    dependencies: 0.40,
    governance: 0,
    tvl: 0,
  };

  const applicable = (scores as any).applicableDimensions || ['github', 'dependencies'];
  const showGov = applicable.includes('governance');
  const showTvl = applicable.includes('tvl');

  const contributions = {
    github: Math.round((scores.github || 0) * weights.github),
    dependencies: Math.round((scores.dependencies || 0) * weights.dependencies),
    governance: showGov ? Math.round((scores.governance || 0) * weights.governance) : 0,
    tvl: showTvl ? Math.round((scores.tvl || 0) * weights.tvl) : 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-primary';
    if (score >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const pct = (n: number) => `${Math.round(n * 100)}%`;

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

            {/* GitHub */}
            <DimensionRow
              label={`GitHub Activity (${pct(weights.github)})`}
              score={scores.github || 0}
              contribution={contributions.github}
              getScoreColor={getScoreColor}
            />

            {/* Dependencies */}
            <DimensionRow
              label={`Dependency Health (${pct(weights.dependencies)})`}
              score={scores.dependencies || 0}
              contribution={contributions.dependencies}
              getScoreColor={getScoreColor}
              progressClass={scores.dependencies != null && scores.dependencies < 50 ? '[&>div]:bg-amber-500' : ''}
            />

            {/* Governance — only if applicable */}
            {showGov && (
              <DimensionRow
                label={`Governance (${pct(weights.governance)})`}
                score={scores.governance || 0}
                contribution={contributions.governance}
                getScoreColor={getScoreColor}
                progressClass={(scores.governance || 0) < 30 ? '[&>div]:bg-muted-foreground' : ''}
              />
            )}

            {/* TVL — only if applicable */}
            {showTvl && (
              <DimensionRow
                label={`Economic Health (${pct(weights.tvl)})`}
                score={scores.tvl || 0}
                contribution={contributions.tvl}
                getScoreColor={getScoreColor}
                progressClass={(scores.tvl || 0) < 30 ? '[&>div]:bg-muted-foreground' : ''}
              />
            )}

            {/* N/A dimensions */}
            {!showGov && !showTvl && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                Governance & TVL not applicable — weights redistributed
              </p>
            )}
            {!showGov && showTvl && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                Governance not applicable — weight redistributed
              </p>
            )}
            {showGov && !showTvl && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                TVL not applicable — weight redistributed
              </p>
            )}

            {/* Continuity Decay */}
            {scores.continuityDecay !== undefined && scores.continuityDecay > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Continuity Decay</span>
                  <span className="font-mono font-medium text-destructive">
                    −{scores.continuityDecay}%
                  </span>
                </div>
                <Progress 
                  value={100 - scores.continuityDecay} 
                  className="h-1.5 [&>div]:bg-destructive" 
                />
              </div>
            )}

            {/* Formula */}
            <div className="border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground/70">
                R = ({pct(weights.github)}×G + {pct(weights.dependencies)}×D
                {showGov ? ` + ${pct(weights.governance)}×Gov` : ''}
                {showTvl ? ` + ${pct(weights.tvl)}×TVL` : ''}) × Continuity
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DimensionRow({
  label,
  score,
  contribution,
  getScoreColor,
  progressClass = '',
}: {
  label: string;
  score: number;
  contribution: number;
  getScoreColor: (s: number) => string;
  progressClass?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-medium ${getScoreColor(score)}`}>
          +{contribution}
        </span>
      </div>
      <Progress value={score} className={`h-1.5 ${progressClass}`} />
    </div>
  );
}
