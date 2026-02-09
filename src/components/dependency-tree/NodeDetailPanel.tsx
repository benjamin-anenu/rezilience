import { X, ExternalLink, Package, AlertTriangle, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { DependencyNodeData } from './DependencyNode';
import { cn } from '@/lib/utils';

interface NodeDetailPanelProps {
  open: boolean;
  onClose: () => void;
  nodeData: DependencyNodeData | null;
  cratesIoUrl?: string | null;
}

export function NodeDetailPanel({ open, onClose, nodeData, cratesIoUrl }: NodeDetailPanelProps) {
  if (!nodeData) return null;

  const getStatusBadge = () => {
    if (nodeData.type === 'project') {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/50">
          <Package className="mr-1 h-3 w-3" />
          Source Project
        </Badge>
      );
    }
    
    if (nodeData.type === 'dependent') {
      return (
        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">
          <Users className="mr-1 h-3 w-3" />
          Dependent
        </Badge>
      );
    }

    if (!nodeData.isOutdated) {
      return (
        <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
          <CheckCircle className="mr-1 h-3 w-3" />
          Up to Date
        </Badge>
      );
    }

    if ((nodeData.monthsBehind || 0) >= 6) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/50">
          <AlertCircle className="mr-1 h-3 w-3" />
          Critical Update Needed
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Update Available
      </Badge>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] border-border bg-card">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-mono">{nodeData.label}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {nodeData.isCritical && (
              <Badge variant="destructive">CRITICAL DEPENDENCY</Badge>
            )}
          </div>

          {/* Version Info */}
          {nodeData.type === 'dependency' && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Version Information</h4>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <code className="text-sm font-mono text-foreground">{nodeData.version || '—'}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Latest</span>
                  <code className={cn(
                    'text-sm font-mono',
                    nodeData.isOutdated ? 'text-amber-500' : 'text-foreground'
                  )}>
                    {nodeData.latestVersion || '—'}
                  </code>
                </div>
                {nodeData.monthsBehind !== undefined && nodeData.monthsBehind > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Behind by</span>
                    <span className={cn(
                      'text-sm font-medium',
                      (nodeData.monthsBehind || 0) >= 6 ? 'text-destructive' : 'text-amber-500'
                    )}>
                      {nodeData.monthsBehind} month{nodeData.monthsBehind !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dependents Count */}
          {nodeData.dependents !== undefined && nodeData.dependents > 0 && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">Ecosystem Impact</h4>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-foreground">
                  {nodeData.dependents.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  projects depend on this crate
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {cratesIoUrl && (
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(cratesIoUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on crates.io
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
