import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export type BlueprintNodeData = {
  label: string;
  description: string;
  type: 'goal' | 'step';
  stepNumber?: number;
  language?: string;
  alternatives?: string[];
  tools: string[];
  dependencies: string[];
  apis?: string[];
  estimatedCost?: string;
  docsUrl?: string;
};

export const BlueprintNode = memo(function BlueprintNode({
  data,
  selected,
}: NodeProps & { data: BlueprintNodeData }) {
  const isGoal = data.type === 'goal';

  return (
    <div
      className={cn(
        'rounded-lg border-2 px-5 py-4 shadow-lg transition-all bg-card max-w-[280px]',
        isGoal
          ? 'border-primary bg-primary/10 min-w-[260px]'
          : 'border-border hover:border-primary/50',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {!isGoal && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-primary !border-background !w-3 !h-3"
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !border-background !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        {data.stepNumber && (
          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 font-mono text-xs font-bold text-primary">
            {data.stepNumber}
          </span>
        )}
        <h3 className={cn('font-display font-bold', isGoal ? 'text-lg text-primary' : 'text-sm text-foreground')}>
          {data.label}
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{data.description}</p>

      {/* Language */}
      {data.language && (
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
            {data.language}
          </span>
          {data.alternatives?.map((alt) => (
            <span key={alt} className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {alt}
            </span>
          ))}
        </div>
      )}

      {/* Dependencies */}
      {data.dependencies.length > 0 && (
        <div className="mb-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Deps</span>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {data.dependencies.map((dep) => (
              <span key={dep} className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* APIs */}
      {data.apis && data.apis.length > 0 && (
        <div className="mb-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">APIs</span>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {data.apis.map((api) => (
              <span key={api} className="rounded-sm border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                {api}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cost */}
      {data.estimatedCost && (
        <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-destructive">
          💰 {data.estimatedCost}
        </div>
      )}

      {/* Docs link */}
      {data.docsUrl && (
        <a
          href={data.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Docs <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
});
