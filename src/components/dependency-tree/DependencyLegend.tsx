import { CheckCircle, AlertTriangle, AlertCircle, Box, GitFork } from 'lucide-react';

export function DependencyLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-lg">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Legend
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" />
          <span className="text-foreground">This Project</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-foreground">Outdated (1-6 mo)</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-foreground">Critical (6+ mo)</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-blue-500" />
          <span className="text-foreground">Dependents/Forks</span>
        </div>
      </div>
    </div>
  );
}
