 import { Fingerprint, Shield, Lock } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import type { Program } from '@/types';
 
 interface MetricCardsProps {
   program: Program;
 }
 
 export function MetricCards({ program }: MetricCardsProps) {
   const metrics = [
     {
       icon: Fingerprint,
       title: 'BYTECODE ORIGINALITY',
       subtitle: program.originalityStatus === 'verified' ? 'Verified Original' : program.originalityStatus === 'fork' ? 'Known Fork' : 'Unverified',
       value: program.originalityStatus === 'verified' ? 100 : program.originalityStatus === 'fork' ? 45 : 60,
       description: 'Cryptographic fingerprint comparison against known program database.',
       isPositive: program.originalityStatus === 'verified',
     },
     {
       icon: Shield,
       title: 'STAKED ASSURANCE',
       subtitle: `${(program.stakedAmount / 1000).toFixed(0)}K SOL Staked`,
       value: Math.min((program.stakedAmount / 300000) * 100, 100),
       description: 'Economic security layer providing stake-backed guarantees.',
       isPositive: program.stakedAmount > 100000,
     },
     {
       icon: Lock,
       title: 'ADMIN CONSTRAINTS',
       subtitle: 'Multisig Required',
       value: 85,
       description: 'Upgrade authority is controlled by a 3/5 multisig wallet.',
       isPositive: true,
     },
   ];
 
   return (
     <div className="grid gap-4 md:grid-cols-3">
       {metrics.map((metric) => (
         <Card key={metric.title} className="border-border bg-card">
           <CardHeader className="pb-2">
             <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                 <metric.icon className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <CardTitle className="font-display text-sm uppercase tracking-tight">
                   {metric.title}
                 </CardTitle>
                 <CardDescription className={metric.isPositive ? 'text-primary' : 'text-muted-foreground'}>
                   {metric.subtitle}
                 </CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent>
             <div className="mb-2">
               <Progress value={metric.value} className="h-2" />
             </div>
             <p className="text-xs text-muted-foreground">{metric.description}</p>
           </CardContent>
         </Card>
       ))}
     </div>
   );
 }