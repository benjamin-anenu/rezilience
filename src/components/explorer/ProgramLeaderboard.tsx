 import { useNavigate } from 'react-router-dom';
 import { Activity, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
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
 import { cn } from '@/lib/utils';
 import type { Program } from '@/types';
 
 interface ProgramLeaderboardProps {
   programs: Program[];
 }
 
 export function ProgramLeaderboard({ programs }: ProgramLeaderboardProps) {
   const navigate = useNavigate();
 
   const getScoreColor = (score: number) => {
     if (score >= 85) return 'text-primary';
     if (score >= 70) return 'text-foreground';
     return 'text-destructive';
   };
 
   const getStatusBadge = (status: Program['livenessStatus']) => {
     switch (status) {
       case 'active':
         return (
           <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary">
             <Activity className="mr-1 h-3 w-3" />
             Active
           </Badge>
         );
       case 'dormant':
         return (
           <Badge variant="outline" className="border-muted-foreground/50 bg-muted text-muted-foreground">
             Dormant
           </Badge>
         );
       case 'degraded':
         return (
           <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
             <AlertCircle className="mr-1 h-3 w-3" />
             Degraded
           </Badge>
         );
     }
   };
 
   const getOriginalityBadge = (status: Program['originalityStatus']) => {
     switch (status) {
       case 'verified':
         return (
           <Badge variant="outline" className="border-primary/50 text-primary">
             <CheckCircle className="mr-1 h-3 w-3" />
             Verified
           </Badge>
         );
       case 'fork':
         return (
           <Badge variant="outline" className="border-destructive/50 text-destructive">
             Fork
           </Badge>
         );
       case 'unverified':
         return (
           <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
             Unverified
           </Badge>
         );
     }
   };
 
   const copyToClipboard = (text: string, e: React.MouseEvent) => {
     e.stopPropagation();
     navigator.clipboard.writeText(text);
   };
 
   const truncateProgramId = (id: string) => {
     return `${id.slice(0, 4)}...${id.slice(-4)}`;
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
             <TableHead className="hidden lg:table-cell">LAST UPGRADE</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {programs.map((program) => (
             <TableRow
               key={program.id}
               className="cursor-pointer border-border transition-colors hover:bg-muted/50"
               onClick={() => navigate(`/program/${program.id}`)}
             >
               <TableCell className="font-mono text-muted-foreground">
                 #{program.rank}
               </TableCell>
               <TableCell>
                 <div className="flex items-center gap-2">
                   <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                     <span className="font-display text-xs font-bold text-primary">
                       {program.name.charAt(0)}
                     </span>
                   </div>
                   <span className="font-medium text-foreground">{program.name}</span>
                 </div>
               </TableCell>
               <TableCell className="hidden lg:table-cell">
                 <div className="flex items-center gap-2">
                   <code className="font-mono text-xs text-muted-foreground">
                     {truncateProgramId(program.programId)}
                   </code>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6"
                     onClick={(e) => copyToClipboard(program.programId, e)}
                   >
                     <Copy className="h-3 w-3" />
                   </Button>
                 </div>
               </TableCell>
               <TableCell className="text-right">
                 <span className={cn('font-mono text-lg font-bold', getScoreColor(program.score))}>
                   {program.score}
                 </span>
               </TableCell>
               <TableCell className="hidden md:table-cell">
                 {getStatusBadge(program.livenessStatus)}
               </TableCell>
               <TableCell className="hidden lg:table-cell">
                 {getOriginalityBadge(program.originalityStatus)}
               </TableCell>
               <TableCell className="hidden md:table-cell text-right">
                 <span className="font-mono text-sm text-foreground">
                   {(program.stakedAmount / 1000).toFixed(0)}K
                 </span>
                 <span className="ml-1 text-xs text-muted-foreground">SOL</span>
               </TableCell>
               <TableCell className="hidden lg:table-cell">
                 <span className="font-mono text-xs text-muted-foreground">
                   {program.lastUpgrade}
                 </span>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </div>
   );
 }