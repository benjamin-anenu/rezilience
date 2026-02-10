import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useExplorerProjects, ExplorerProject } from '@/hooks/useExplorerProjects';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Filter, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type HealthStatus = 'healthy' | 'stale' | 'decaying' | 'locked';

interface HeatmapCell {
  project: ExplorerProject;
  healthStatus: HealthStatus;
}

function getHealthStatus(score: number, project: ExplorerProject): HealthStatus {
  if (project.claimStatus === 'unclaimed' && !project.github_analyzed_at) return 'locked';
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'stale';
  return 'decaying';
}

function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-primary/80 hover:bg-primary';
    case 'stale':
      return 'bg-chart-4/80 hover:bg-chart-4';
    case 'decaying':
      return 'bg-[hsl(212,11%,40%)]/80 hover:bg-[hsl(212,11%,40%)]';
    case 'locked':
      return 'bg-[#1a1a1a] hover:bg-[#222]';
  }
}

function getStatusLabel(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return 'HEALTHY';
    case 'stale':
      return 'EVOLVING';
    case 'decaying':
      return 'UNDER OBSERVATION';
    case 'locked':
      return 'LOCKED';
  }
}

export function EcosystemHeatmap() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useExplorerProjects();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique categories from projects
  const categories = useMemo(() => {
    if (!projects) return [];
    const cats = [...new Set(projects.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [projects]);

  // Transform projects into heatmap cells with filtering
  const heatmapCells = useMemo((): HeatmapCell[] => {
    if (!projects) return [];

    return projects
      .filter((project) => {
        if (categoryFilter !== 'all' && project.category !== categoryFilter) return false;
        const health = getHealthStatus(project.resilience_score, project);
        if (statusFilter !== 'all' && health !== statusFilter) return false;
        return true;
      })
      .map((project) => ({
        project,
        healthStatus: getHealthStatus(project.resilience_score, project),
      }));
  }, [projects, categoryFilter, statusFilter]);

  // Stats summary
  const stats = useMemo(() => {
    const cells = heatmapCells;
    return {
      total: cells.length,
      healthy: cells.filter((c) => c.healthStatus === 'healthy').length,
      stale: cells.filter((c) => c.healthStatus === 'stale').length,
      decaying: cells.filter((c) => c.healthStatus === 'decaying').length,
      locked: cells.filter((c) => c.healthStatus === 'locked').length,
    };
  }, [heatmapCells]);

  if (error) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">Failed to load heatmap data</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
              TITAN WATCH
            </h2>
            <Badge variant="outline" className="ml-2 text-[10px]">
              LIVE
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="stale">Evolving</SelectItem>
                <SelectItem value="decaying">Under Observation</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span>Healthy (70+)</span>
            <span className="font-mono text-foreground">{stats.healthy}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-chart-4" />
            <span>Evolving (40-69)</span>
            <span className="font-mono text-foreground">{stats.stale}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-[hsl(212,11%,40%)]" />
            <span>Under Observation (1-39)</span>
            <span className="font-mono text-foreground">{stats.decaying}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-[#1a1a1a] border border-border" />
            <Lock className="h-3 w-3" />
            <span>Locked</span>
            <span className="font-mono text-foreground">{stats.locked}</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        {isLoading ? (
          <div className="grid grid-cols-8 gap-0.5 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16">
            {[...Array(32)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-sm" />
            ))}
          </div>
        ) : heatmapCells.length === 0 ? (
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No projects match the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-0.5 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-16">
            <AnimatePresence mode="popLayout">
              {heatmapCells.map((cell) => (
                <Tooltip key={cell.project.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(`/program/${cell.project.id}`)}
                      className={`relative h-8 w-full rounded-sm transition-all duration-200 sm:h-9 ${getHealthColor(
                        cell.healthStatus
                      )} cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white/90 sm:text-[10px]">
                        {cell.healthStatus === 'locked' ? (
                          <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                        ) : (
                          cell.project.resilience_score
                        )}
                      </span>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-[200px] border-primary/20 p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-display text-sm font-bold truncate">
                        {cell.project.program_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            cell.healthStatus === 'healthy'
                              ? 'default'
                              : cell.healthStatus === 'stale'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {getStatusLabel(cell.healthStatus)}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          Score: {cell.project.resilience_score}
                        </span>
                      </div>
                      {cell.project.github_last_commit && (
                        <p className="text-[10px] text-muted-foreground">
                          Last activity:{' '}
                          {formatDistanceToNow(new Date(cell.project.github_last_commit), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                      {cell.project.category && (
                        <p className="text-[10px] text-muted-foreground">
                          {cell.project.category}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
