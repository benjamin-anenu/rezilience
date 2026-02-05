import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, AlertCircle, Copy, ShieldCheck } from 'lucide-react';
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
import type { DBProject, LivenessStatus } from '@/types/database';

interface ProgramLeaderboardProps {
  projects: DBProject[];
}

export function ProgramLeaderboard({ projects }: ProgramLeaderboardProps) {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-primary';
    if (score >= 70) return 'text-foreground';
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

  const getOriginalityBadge = (verified: boolean, isFork: boolean) => {
    if (isFork) {
      return (
        <Badge variant="outline" className="border-destructive/50 text-destructive">
          Fork
        </Badge>
      );
    }
    if (verified) {
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

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  const truncateProgramId = (id: string) => {
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-sm border border-border">
      <Table className="data-table">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-16">RANK</TableHead>
            <TableHead>PROGRAM</TableHead>
            <TableHead className="hidden lg:table-cell">PROGRAM ID</TableHead>
            <TableHead className="text-right">SCORE</TableHead>
            <TableHead className="hidden md:table-cell">LIVENESS</TableHead>
            <TableHead className="hidden lg:table-cell">ORIGINALITY</TableHead>
            <TableHead className="hidden md:table-cell text-right">STAKED</TableHead>
            <TableHead className="hidden lg:table-cell">LAST COMMIT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, index) => (
            <TableRow
              key={project.id}
              className="cursor-pointer border-border transition-colors hover:bg-muted/50"
              onClick={() => navigate(`/program/${project.program_id}`)}
            >
              <TableCell className="font-mono text-muted-foreground">
                #{index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                    <span className="font-display text-xs font-bold text-primary">
                      {project.program_name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">{project.program_name}</span>
                  {project.verified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Project</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-muted-foreground">
                    {truncateProgramId(project.program_id)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => copyToClipboard(project.program_id, e)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
                  {Math.round(project.resilience_score)}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {getStatusBadge(project.liveness_status)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {getOriginalityBadge(project.verified, project.is_fork)}
              </TableCell>
              <TableCell className="hidden md:table-cell text-right">
                <span className="font-mono text-sm text-foreground">
                  {(project.total_staked / 1000).toFixed(0)}K
                </span>
                <span className="ml-1 text-xs text-muted-foreground">SOL</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(project.github_last_commit)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
