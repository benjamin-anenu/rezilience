 import { Star, Utensils, HeartPulse, Fingerprint, Shield } from 'lucide-react';
 
 const redOceanProblems = [
   'Opaque upgrade history creates trust vacuum',
   'No standardized way to assess program health',
   'Forks and clones erode ecosystem integrity',
   'Manual due diligence doesn\'t scale',
 ];
 
 const blueOceanSolutions = [
   'Transparent liveness indexing on every program',
   'Quantified resilience scores across ecosystem',
   'Bytecode originality verification & fingerprinting',
   'Automated, real-time program risk assessment',
 ];
 
 const redOceanMetrics = [
   { icon: Star, label: 'GitHub Stars' },
   { icon: Utensils, label: 'TVL' },
 ];
 
 const blueOceanMetrics = [
   { icon: HeartPulse, label: 'Liveness Score' },
   { icon: Fingerprint, label: 'Originality Index' },
   { icon: Shield, label: 'Staked Assurance' },
 ];
 
 export function ProblemSolutionSection() {
   return (
     <section className="border-t border-border bg-background py-20">
       <div className="container mx-auto px-4 lg:px-8">
         {/* Section Header */}
         <div className="mb-12">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             THE PROBLEM: VANITY METRICS FAIL.
           </h2>
           <p className="max-w-2xl text-muted-foreground">
             Solana's upgrade authority model enables rapid iteration, but creates a trust vacuum. 
             Resilience bridges this gap.
           </p>
         </div>
 
         {/* Two-Panel Comparison */}
         <div className="grid gap-6 lg:grid-cols-2">
           {/* Red Ocean Panel */}
           <div className="relative overflow-hidden rounded-lg border border-destructive/20 bg-destructive/5 p-8">
             {/* Panel Header */}
             <div className="mb-8">
               <h3 className="font-display text-xl font-bold uppercase tracking-tight text-destructive">
                 THE RED OCEAN
               </h3>
               <p className="text-sm text-muted-foreground">What Exists Today</p>
             </div>
 
             {/* Metric Icons */}
             <div className="mb-8 flex justify-center gap-12">
               {redOceanMetrics.map(({ icon: Icon, label }) => (
                 <div key={label} className="flex flex-col items-center gap-2">
                   <Icon className="h-12 w-12 text-muted-foreground" />
                   <span className="text-center text-xs font-medium text-muted-foreground">
                     {label}
                   </span>
                 </div>
               ))}
             </div>
 
             {/* Bullet Points */}
             <ul className="mb-10 space-y-3">
               {redOceanProblems.map((problem, index) => (
                 <li key={index} className="flex items-start gap-3">
                   <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                   <span className="text-sm text-muted-foreground">{problem}</span>
                 </li>
               ))}
             </ul>
 
             {/* Slanted Stamp */}
             <div className="flex justify-center">
               <div className="inline-block -rotate-6 border-2 border-dashed border-destructive px-6 py-3">
                 <span className="font-mono text-sm font-medium uppercase tracking-wider text-destructive">
                   DECAY DETECTED
                 </span>
               </div>
             </div>
 
             {/* Subtle label */}
             <div className="absolute bottom-4 right-4">
               <span className="font-mono text-xs uppercase tracking-wider text-destructive/50">
                 Rot
               </span>
             </div>
           </div>
 
           {/* Blue Ocean Panel */}
           <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-card p-8 shadow-[0_0_30px_hsl(174_100%_38%_/_0.1)]">
             {/* Panel Header */}
             <div className="mb-8">
               <h3 className="font-display text-xl font-bold uppercase tracking-tight text-primary">
                 THE BLUE OCEAN
               </h3>
               <p className="text-sm text-muted-foreground">What Resilience Unlocks</p>
             </div>
 
             {/* Metric Icons with Glow */}
             <div className="mb-8 flex justify-center gap-8">
               {blueOceanMetrics.map(({ icon: Icon, label }) => (
                 <div key={label} className="flex flex-col items-center gap-2">
                   <Icon 
                     className="h-12 w-12 text-primary" 
                     style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }}
                   />
                   <span className="text-center text-xs font-medium text-primary">
                     {label}
                   </span>
                 </div>
               ))}
             </div>
 
             {/* Bullet Points */}
             <ul className="mb-10 space-y-3">
               {blueOceanSolutions.map((solution, index) => (
                 <li key={index} className="flex items-start gap-3">
                   <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                   <span className="text-sm text-muted-foreground">{solution}</span>
                 </li>
               ))}
             </ul>
 
             {/* Slanted Stamp with Glow */}
             <div className="flex justify-center">
               <div 
                 className="inline-block rotate-6 border-2 border-primary px-6 py-3"
                 style={{ boxShadow: '0 0 15px hsl(174 100% 38% / 0.4)' }}
               >
                 <span className="font-mono text-sm font-medium uppercase tracking-wider text-primary">
                   VERIFIED ACTIVE
                 </span>
               </div>
             </div>
 
             {/* Subtle label */}
             <div className="absolute bottom-4 right-4">
               <span className="font-mono text-xs uppercase tracking-wider text-primary/50">
                 Signal
               </span>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }