 import { XCircle, CheckCircle } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
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
     <section className="border-t border-border bg-card/30 py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             THE TRUST GAP
           </h2>
           <p className="mx-auto max-w-2xl text-muted-foreground">
             Solana's upgrade authority model enables rapid iteration, but creates a trust vacuum. 
             Resilience bridges this gap.
           </p>
         </div>
 
         <div className="grid gap-8 md:grid-cols-2">
           {/* Red Ocean - Problems */}
           <Card className="border-destructive/30 bg-destructive/5">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
                 <XCircle className="h-5 w-5 text-destructive" />
                 <span className="text-destructive">RED OCEAN</span>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ul className="space-y-4">
                 {problems.map((problem, index) => (
                   <li key={index} className="flex items-start gap-3">
                     <div className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive" />
                     <span className="text-muted-foreground">{problem}</span>
                   </li>
                 ))}
               </ul>
             </CardContent>
           </Card>
 
           {/* Blue Ocean - Solutions */}
           <Card className="border-primary/30 bg-primary/5">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
                 <CheckCircle className="h-5 w-5 text-primary" />
                 <span className="text-primary">BLUE OCEAN</span>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ul className="space-y-4">
                 {solutions.map((solution, index) => (
                   <li key={index} className="flex items-start gap-3">
                     <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                     <span className="text-muted-foreground">{solution}</span>
                   </li>
                 ))}
               </ul>
             </CardContent>
           </Card>
         </div>
       </div>
     </section>
   );
 }