 import { Copy, ExternalLink, Activity, AlertCircle, CheckCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import type { Program } from '@/types';
 
 interface ProgramHeaderProps {
   program: Program;
 }
 
 export function ProgramHeader({ program }: ProgramHeaderProps) {
   const copyToClipboard = (text: string) => {
     navigator.clipboard.writeText(text);
   };
 
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
 
   return (
     <div className="rounded-sm border border-border bg-card p-6">
       <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
         {/* Left side - Program info */}
         <div className="flex items-start gap-4">
           <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-primary/10">
             <span className="font-display text-2xl font-bold text-primary">
               {program.name.charAt(0)}
             </span>
           </div>
           <div>
             <div className="mb-2 flex items-center gap-3">
               <h1 className="font-display text-2xl font-bold text-foreground">
                 {program.name}
               </h1>
               {getStatusBadge(program.livenessStatus)}
             </div>
             <div className="flex items-center gap-2">
               <code className="font-mono text-sm text-muted-foreground">
                 {program.programId}
               </code>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-6 w-6"
                 onClick={() => copyToClipboard(program.programId)}
               >
                 <Copy className="h-3 w-3" />
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-6 w-6"
                 asChild
               >
                 <a
                   href={`https://explorer.solana.com/address/${program.programId}`}
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   <ExternalLink className="h-3 w-3" />
                 </a>
               </Button>
             </div>
           </div>
         </div>
 
         {/* Right side - Score */}
         <div className="flex items-center gap-8">
           <div className="text-center">
             <p className="mb-1 text-xs uppercase text-muted-foreground">Resilience Score</p>
             <p className={cn('font-mono text-5xl font-bold', getScoreColor(program.score))}>
               {program.score}
             </p>
           </div>
           <div className="hidden h-16 w-px bg-border lg:block" />
           <div className="hidden text-center lg:block">
             <p className="mb-1 text-xs uppercase text-muted-foreground">Rank</p>
             <p className="font-mono text-2xl font-bold text-foreground">#{program.rank}</p>
           </div>
         </div>
       </div>
     </div>
   );
 }