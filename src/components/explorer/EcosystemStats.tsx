 import { Database, TrendingUp, Coins, Activity } from 'lucide-react';
 import { ecosystemStats } from '@/data/mockData';
 
 const stats = [
   {
     icon: Database,
     label: 'Programs Indexed',
     value: ecosystemStats.programsIndexed.toLocaleString(),
   },
   {
     icon: TrendingUp,
     label: 'Average Score',
     value: ecosystemStats.averageScore.toFixed(1),
   },
   {
     icon: Coins,
     label: 'Total Staked',
     value: `$${(ecosystemStats.totalStaked / 1000).toFixed(0)}K`,
   },
   {
     icon: Activity,
     label: 'Active Programs',
     value: ecosystemStats.activePrograms.toLocaleString(),
   },
 ];
 
 export function EcosystemStats() {
   return (
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
       {stats.map((stat) => (
         <div
           key={stat.label}
           className="flex items-center gap-4 rounded-sm border border-border bg-card p-4"
         >
           <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
             <stat.icon className="h-5 w-5 text-primary" />
           </div>
           <div>
             <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
             <p className="text-xs text-muted-foreground">{stat.label}</p>
           </div>
         </div>
       ))}
     </div>
   );
 }