import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Package, AlertTriangle, CheckCircle, AlertCircle, GitFork, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DependencyNodeData = {
  label: string;
  type: 'project' | 'dependency' | 'dependent';
  version?: string | null;
  latestVersion?: string | null;
  monthsBehind?: number;
  isCritical?: boolean;
  isOutdated?: boolean;
  dependents?: number;
  forks?: number;
  dependencyType?: 'crate' | 'npm' | 'pypi';
};

const getStatusColor = (data: DependencyNodeData) => {
  if (data.type === 'project') return 'border-primary bg-primary/10';
  if (data.type === 'dependent') return 'border-blue-500 bg-blue-500/10';
  
  if (!data.isOutdated) return 'border-green-500 bg-green-500/10';
  if ((data.monthsBehind || 0) >= 6) return 'border-destructive bg-destructive/10';
  return 'border-amber-500 bg-amber-500/10';
};

const getStatusIcon = (data: DependencyNodeData) => {
  if (data.type === 'project') return <Box className="h-4 w-4 text-primary" />;
  if (data.type === 'dependent') return <GitFork className="h-4 w-4 text-blue-500" />;
  
  if (!data.isOutdated) return <CheckCircle className="h-4 w-4 text-green-500" />;
  if ((data.monthsBehind || 0) >= 6) return <AlertCircle className="h-4 w-4 text-destructive" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
};

const getTypeIcon = (dependencyType?: 'crate' | 'npm' | 'pypi') => {
  if (dependencyType === 'npm') return '📦';
  if (dependencyType === 'pypi') return '🐍';
  return '🦀';
};

export const DependencyNode = memo(function DependencyNode({ 
  data,
  selected,
}: NodeProps & { data: DependencyNodeData }) {
  const statusColor = getStatusColor(data);
  const statusIcon = getStatusIcon(data);
  const isProject = data.type === 'project';
  const isDependent = data.type === 'dependent';
  const typeIcon = data.type === 'dependency' ? getTypeIcon(data.dependencyType) : null;

  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 shadow-lg transition-all',
        statusColor,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isProject && 'min-w-[180px]',
        'bg-card'
      )}
    >
      {/* Input handle - for dependencies flowing in */}
      {!isProject && (
        <Handle
          type="target"
          position={isDependent ? Position.Left : Position.Right}
          className="!bg-muted-foreground !border-background !w-3 !h-3"
        />
      )}

      {/* Output handle - for dependencies flowing out */}
      <Handle
        type="source"
        position={isDependent ? Position.Right : Position.Left}
        className="!bg-muted-foreground !border-background !w-3 !h-3"
      />

      <div className="flex items-start gap-3">
        <div className="mt-0.5">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {typeIcon && (
              <span className="text-sm" title={data.dependencyType === 'npm' ? 'NPM Package' : data.dependencyType === 'pypi' ? 'PyPI Package' : 'Rust Crate'}>
                {typeIcon}
              </span>
            )}
            <span className={cn(
              'font-medium truncate',
              isProject ? 'text-lg' : 'text-sm'
            )}>
              {data.label}
            </span>
            {data.isCritical && (
              <span className="shrink-0 text-[10px] font-bold uppercase text-destructive bg-destructive/20 px-1.5 py-0.5 rounded">
                CRITICAL
              </span>
            )}
          </div>
          
          {data.type === 'dependency' && data.version && (
            <div className="mt-1 text-xs text-muted-foreground font-mono">
              {data.version}
              {data.latestVersion && data.isOutdated && (
                <span className="text-amber-500"> → {data.latestVersion}</span>
              )}
            </div>
          )}
          
          {data.type === 'dependency' && data.monthsBehind !== undefined && data.monthsBehind > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {data.monthsBehind} month{data.monthsBehind !== 1 ? 's' : ''} behind
            </div>
          )}
          
          {data.type === 'dependent' && data.dependents !== undefined && (
            <div className="mt-1 text-xs text-muted-foreground">
              {data.dependents.toLocaleString()} project{data.dependents !== 1 ? 's' : ''} depend on this
            </div>
          )}
          
          {data.type === 'project' && data.forks !== undefined && data.forks > 0 && (
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {data.forks.toLocaleString()} fork{data.forks !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
