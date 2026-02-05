 import { Activity, Fingerprint, Shield } from 'lucide-react';
 
 const pillars = [
   {
     icon: Activity,
     title: 'Liveness Indexer',
     description: 'Tracks real-time upgrades and admin actions directly from the ledger.',
   },
   {
     icon: Fingerprint,
     title: 'Bytecode Originality',
     description: 'Cryptographically distinguishes novel code from low-effort forks.',
   },
   {
     icon: Shield,
     title: 'Staked Assurance',
     description: 'Economic guarantees for maintenance. Skin-in-the-game for developers.',
   },
 ];
 
 export function PillarsSection() {
   return (
     <section className="border-t border-border bg-card/30 py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="grid gap-6 md:grid-cols-3">
           {pillars.map((pillar) => (
             <div
               key={pillar.title}
               className="rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/50"
             >
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                 <pillar.icon className="h-6 w-6 text-primary" />
               </div>
               <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-foreground">
                 {pillar.title}
               </h3>
               <p className="text-sm text-muted-foreground">{pillar.description}</p>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }