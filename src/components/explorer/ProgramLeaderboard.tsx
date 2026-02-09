import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, AlertCircle, Copy, ShieldCheck, TrendingUp, TrendingDown, Minus, Sparkles, Cloud, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProgramCards } from './MobileProgramCard';
import { Sparkline } from './Sparkline';
import { useRankMovement, type MovementType } from '@/hooks/useRankMovement';
import { PROJECT_CATEGORIES } from '@/types';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';
import type { LivenessStatus } from '@/types/database';

interface ProgramLeaderboardProps {
  projects: ExplorerProject[];
}

export function ProgramLeaderboard({ projects }: ProgramLeaderboardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch rank movements and score histories
  const profileIds = projects.map(p => p.id);
  const { data: rankData } = useRankMovement(profileIds);

  // Render mobile cards on small screens
  if (isMobile) {
    return <MobileProgramCards projects={projects} rankData={rankData} />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-primary';
    if (score >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const getStatusBadge = (status: LivenessStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
            <Activity className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'STALE':
        return (
          <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground">
            Stale
          </Badge>
        );
      case 'DECAYING':
        return (
          <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Decaying
          </Badge>
        );
    }
  };

  const getOriginalityBadge = (project: ExplorerProject) => {
    // Handle unclaimed profiles first
    if (project.claimStatus === 'unclaimed') {
      return (
        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Unclaimed
        </Badge>
      );
    }
    
    if (project.is_fork) {
      return (
        <Badge variant="outline" className="border-destructive/50 text-destructive">
          Fork
        </Badge>
      );
    }
    if (project.verified) {
      return (
        <Badge variant="outline" className="border-primary/50 text-primary">
          <CheckCircle className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
        Unverified
      </Badge>
    );
  };

  const getCategoryLabel = (value: string | null) => {
    if (!value) return '—';
    const cat = PROJECT_CATEGORIES.find(c => c.value === value);
    return cat?.label || value;
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  // Smart Program ID display - detects off-chain projects
  const formatProgramId = (programId: string, projectId: string) => {
    // If program_id equals project id (UUID fallback) or is missing, it's off-chain
    if (!programId || programId === projectId || programId.includes('-')) {
      return { display: 'Off-chain', isOnChain: false };
    }
    // Real Solana program IDs are Base58 encoded (32-44 chars, no dashes)
    return { 
      display: `${programId.slice(0, 4)}...${programId.slice(-4)}`, 
      isOnChain: true 
    };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMovementIndicator = (movement: MovementType | undefined) => {
    switch (movement) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      case 'new':
        return null;
      default:
        return null;
    }
  };

  const handleRowClick = (project: ExplorerProject, e: React.MouseEvent) => {
    // Prevent navigation if clicking on the Claim button
    if ((e.target as HTMLElement).closest('button')) return;
    
    // For unclaimed profiles, navigate to claim flow
    if (project.claimStatus === 'unclaimed') {
      const params = new URLSearchParams({
        profile_id: project.id,
        project: project.program_name,
      });
      navigate(`/claim-profile?${params.toString()}`);
      return;
    }
    
    // Navigate to full program detail view
    // Use program_id if it's a real Solana address, otherwise use claimed profile id
    const routeId = project.program_id && project.program_id !== project.id 
      ? project.program_id 
      : project.id;
    navigate(`/program/${routeId}`);
  };

  return (
    <div className="rounded-sm border border-border">
      <Table className="data-table">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-16">RANK</TableHead>
            <TableHead className="max-w-[140px]">PROJECT</TableHead>
            <TableHead className="hidden lg:table-cell">TYPE</TableHead>
            <TableHead className="hidden lg:table-cell">PROGRAM ID</TableHead>
            <TableHead className="text-right">SCORE</TableHead>
            <TableHead className="hidden xl:table-cell w-20">TREND</TableHead>
            <TableHead className="hidden md:table-cell">LIVENESS</TableHead>
            <TableHead className="hidden lg:table-cell">STATUS</TableHead>
            <TableHead className="hidden md:table-cell text-right">STAKED</TableHead>
            <TableHead className="hidden lg:table-cell">LAST ACTIVITY</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, index) => {
            const programIdInfo = formatProgramId(project.program_id, project.id);
            const movement = rankData?.movements[project.id];
            const scoreHistory = rankData?.scoreHistories[project.id] || [project.resilience_score];
            
            return (
              <TableRow
                key={project.id}
                className="cursor-pointer border-border transition-colors hover:bg-muted/50"
                onClick={(e) => handleRowClick(project, e)}
              >
                <TableCell className="font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>#{index + 1}</span>
                    {getMovementIndicator(movement)}
                  </div>
                </TableCell>
                <TableCell className="max-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                      <span className="font-display text-xs font-bold text-primary">
                        {project.program_name.charAt(0)}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate font-medium text-foreground cursor-default">
                          {project.program_name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{project.program_name}</p>
                      </TooltipContent>
                    </Tooltip>
                    {project.verified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="shrink-0">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Project</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline" className="border-border text-xs">
                    {getCategoryLabel(project.category)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    {programIdInfo.isOnChain ? (
                      <>
                        <code className="font-mono text-xs text-muted-foreground">
                          {programIdInfo.display}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => copyToClipboard(project.program_id, e)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
                        <Cloud className="mr-1 h-3 w-3" />
                        {programIdInfo.display}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
                    {Math.round(project.resilience_score)}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Sparkline values={scoreHistory} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getStatusBadge(project.liveness_status)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {getOriginalityBadge(project)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  <span className="font-mono text-sm text-foreground">
                    {(project.total_staked / 1000).toFixed(0)}K
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">SOL</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.claimStatus === 'unclaimed' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-display text-[10px] uppercase"
                      onClick={(e) => {
                        e.stopPropagation();
                        const params = new URLSearchParams({
                          profile_id: project.id,
                          project: project.program_name,
                        });
                        navigate(`/claim-profile?${params.toString()}`);
                      }}
                    >
                      Claim This
                    </Button>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDate(project.github_last_commit)}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
