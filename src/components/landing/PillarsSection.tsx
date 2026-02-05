 import { Activity, Fingerprint, Shield, Lock } from 'lucide-react';
 
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
     hasLock: true,
   },
   {
     icon: Shield,
     title: 'Staked Assurance',
     description: 'Economic guarantees for maintenance. Skin-in-the-game for developers.',
   },
 ];
 
 export function PillarsSection() {
   return (
     <section className="border-t border-border bg-card/30 py-16">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
           {pillars.map((pillar) => (
             <div
               key={pillar.title}
               className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary/40"
               style={{ boxShadow: '0 0 30px hsl(214 18% 10% / 0.5)' }}
             >
               {/* Icon Badge */}
               <div
                 className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-lg border border-primary/30 bg-card transition-all group-hover:border-primary/60"
                 style={{
                   boxShadow: '0 0 20px hsl(174 100% 38% / 0.15), inset 0 0 20px hsl(174 100% 38% / 0.05)',
                 }}
               >
                 {/* Corner accents */}
                 <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-primary/50" />
                 <div className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-primary/50" />
                 <div className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-primary/50" />
                 <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-primary/50" />
 
                 {/* Lock overlay for Bytecode Originality */}
                 {pillar.hasLock && (
                   <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded bg-card border border-primary/30">
                     <Lock className="h-3 w-3 text-primary" />
                   </div>
                 )}
 
                 <pillar.icon
                   className="h-10 w-10 text-primary transition-all group-hover:scale-110"
                   style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.6))' }}
                 />
               </div>
 
               {/* Title */}
               <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                 {pillar.title}
               </h3>
 
               {/* Description */}
               <p className="text-sm leading-relaxed text-muted-foreground">
                 {pillar.description}
               </p>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }