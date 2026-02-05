 import { ArrowUpCircle, Shield, Users, ArrowDownCircle } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { recentEvents } from '@/data/mockData';
 import type { UpgradeEvent } from '@/types';
 
 const getEventIcon = (type: UpgradeEvent['type']) => {
   switch (type) {
     case 'upgrade':
       return <ArrowUpCircle className="h-4 w-4 text-primary" />;
     case 'authority_change':
       return <Users className="h-4 w-4 text-destructive" />;
     case 'stake_added':
       return <Shield className="h-4 w-4 text-primary" />;
     case 'stake_removed':
       return <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />;
   }
 };
 
 const getEventLabel = (type: UpgradeEvent['type']) => {
   switch (type) {
     case 'upgrade':
       return 'UPGRADE';
     case 'authority_change':
       return 'AUTHORITY';
     case 'stake_added':
       return 'STAKE+';
     case 'stake_removed':
       return 'STAKE-';
   }
 };
 
 export function RecentEvents() {
   return (
     <Card className="border-border bg-card">
       <CardHeader>
         <CardTitle className="font-display text-lg uppercase tracking-tight">
           RECENT EVENTS
         </CardTitle>
       </CardHeader>
       <CardContent>
         <div className="space-y-4">
           {recentEvents.map((event, index) => (
             <div key={index} className="flex gap-3">
               <div className="flex flex-col items-center">
                 <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
                   {getEventIcon(event.type)}
                 </div>
                 {index < recentEvents.length - 1 && (
                   <div className="mt-2 h-full w-px bg-border" />
                 )}
               </div>
               <div className="flex-1 pb-4">
                 <div className="mb-1 flex items-center gap-2">
                   <span className="font-mono text-xs font-medium text-primary">
                     {getEventLabel(event.type)}
                   </span>
                   <span className="text-xs text-muted-foreground">{event.date}</span>
                 </div>
                 <p className="text-sm text-muted-foreground">{event.description}</p>
                 <code className="mt-1 inline-block font-mono text-xs text-muted-foreground/70">
                   tx: {event.txHash}
                 </code>
               </div>
             </div>
           ))}
         </div>
       </CardContent>
     </Card>
   );
 }