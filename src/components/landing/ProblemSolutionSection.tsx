 import { XCircle, CheckCircle } from 'lucide-react';
 import problemSolutionImg from '@/assets/problem-solution.png';
 
 const problems = [
   'Opaque upgrade history creates trust vacuum',
   'No standardized way to assess program health',
   'Forks and clones erode ecosystem integrity',
   'Manual due diligence doesn\'t scale',
 ];
 
 const solutions = [
   'Transparent liveness indexing on every program',
   'Quantified resilience scores across ecosystem',
   'Bytecode originality verification & fingerprinting',
   'Automated, real-time program risk assessment',
 ];
 
 export function ProblemSolutionSection() {
   return (
     <section className="border-t border-border bg-background py-20">
       <div className="container mx-auto px-4 lg:px-8">
         {/* Main visual */}
         <div className="mb-12">
           <img 
             src={problemSolutionImg} 
             alt="The Problem: Vanity Metrics Fail - Red Ocean vs Blue Ocean comparison" 
             className="w-full rounded-sm"
           />
         </div>
 
         {/* Bullet points below */}
         <div className="grid gap-8 md:grid-cols-2">
           {/* Red Ocean - Problems */}
           <div>
             <div className="mb-4 flex items-center gap-2">
               <XCircle className="h-5 w-5 text-destructive" />
               <h3 className="font-display text-lg font-bold uppercase tracking-tight text-destructive">
                 What Exists Today
               </h3>
             </div>
             <ul className="space-y-3">
               {problems.map((problem, index) => (
                 <li key={index} className="flex items-start gap-3">
                   <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                   <span className="text-muted-foreground">{problem}</span>
                 </li>
               ))}
             </ul>
           </div>
 
           {/* Blue Ocean - Solutions */}
           <div>
             <div className="mb-4 flex items-center gap-2">
               <CheckCircle className="h-5 w-5 text-primary" />
               <h3 className="font-display text-lg font-bold uppercase tracking-tight text-primary">
                 What We Unlock
               </h3>
             </div>
             <ul className="space-y-3">
               {solutions.map((solution, index) => (
                 <li key={index} className="flex items-start gap-3">
                   <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                   <span className="text-muted-foreground">{solution}</span>
                 </li>
               ))}
             </ul>
           </div>
         </div>
       </div>
     </section>
   );
 }