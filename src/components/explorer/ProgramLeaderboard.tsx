import React from 'react';
import { Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProgramCards } from './MobileProgramCard';
import { LeaderboardRow } from './LeaderboardRow';
import { useRankMovement } from '@/hooks/useRankMovement';
import type { ExplorerProject } from '@/hooks/useExplorerProjects';

interface ProgramLeaderboardProps {
  projects: ExplorerProject[];
}

export function ProgramLeaderboard({ projects }: ProgramLeaderboardProps) {
  const isMobile = useIsMobile();

  // Fetch rank movements and score histories
  const profileIds = projects.map(p => p.id);
  const { data: rankData } = useRankMovement(profileIds);

  // Render mobile cards on small screens
  if (isMobile) {
    return <MobileProgramCards projects={projects} rankData={rankData} />;
  }

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
            <TableHead className="hidden xl:table-cell w-16 text-center">HEALTH</TableHead>
            <TableHead className="hidden xl:table-cell w-20">TREND</TableHead>
            <TableHead className="hidden md:table-cell">LIVENESS</TableHead>
            <TableHead className="hidden xl:table-cell">DECAY</TableHead>
            <TableHead className="hidden lg:table-cell">STATUS</TableHead>
            <TableHead className="hidden md:table-cell text-right">STAKED</TableHead>
            <TableHead className="hidden lg:table-cell">LAST ACTIVITY</TableHead>
            <TableHead className="w-12 text-center">
              <Eye className="h-4 w-4 mx-auto text-muted-foreground" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, index) => (
            <LeaderboardRow
              key={project.id}
              project={project}
              index={index}
              movement={rankData?.movements[project.id]}
              scoreHistory={rankData?.scoreHistories[project.id] || [project.resilience_score]}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
