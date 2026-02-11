import React from 'react';
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
            <TableHead className="w-12 px-2">#</TableHead>
            <TableHead className="max-w-[120px] px-2">PROJECT</TableHead>
            <TableHead className="hidden lg:table-cell px-2 w-20">TYPE</TableHead>
            <TableHead className="hidden lg:table-cell px-2 w-24">PROGRAM</TableHead>
            <TableHead className="text-right px-2 w-14">SCORE</TableHead>
            <TableHead className="hidden xl:table-cell px-1 w-14 text-center">HEALTH</TableHead>
            <TableHead className="hidden xl:table-cell px-1 w-16">TREND</TableHead>
            <TableHead className="hidden md:table-cell px-2 w-16">LIVE</TableHead>
            <TableHead className="hidden xl:table-cell px-1 w-14">DECAY</TableHead>
            <TableHead className="hidden lg:table-cell px-2 w-16">ORIG</TableHead>
            <TableHead className="hidden lg:table-cell px-2 w-20">STATUS</TableHead>
            <TableHead className="hidden md:table-cell text-right px-2 w-16">STAKED</TableHead>
            <TableHead className="hidden lg:table-cell px-2 w-20">COMMIT</TableHead>
            <TableHead className="px-1 w-16 text-center">ACTION</TableHead>
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
              velocityHistory={rankData?.velocityHistories[project.id] || []}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
