import { forwardRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

export const StepIndicator = forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ steps, className }, ref) => {
  const completedCount = steps.filter(s => s.isComplete).length;
  const progressPercent = (completedCount / steps.length) * 100;

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-display uppercase tracking-wider text-muted-foreground">
          Step {steps.findIndex(s => s.isCurrent) + 1} of {steps.length}
        </span>
        <span className="font-mono text-muted-foreground">
          {Math.round(progressPercent)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between gap-2">
        {steps.map((step) => (
          <div
            key={step.number}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 text-center',
              step.isComplete ? 'text-primary' : step.isCurrent ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors',
                step.isComplete
                  ? 'bg-primary text-primary-foreground'
                  : step.isCurrent
                  ? 'border-2 border-primary bg-background'
                  : 'border border-muted-foreground/30 bg-background'
              )}
            >
              {step.isComplete ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="font-mono">{step.number}</span>
              )}
            </div>
            <span className="hidden text-[10px] uppercase tracking-wide sm:block">
              {step.label}
            </span>
          </div>
          ))}
        </div>
      </div>
    );
  }
);

StepIndicator.displayName = 'StepIndicator';
