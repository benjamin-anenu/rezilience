 import { Link } from 'react-router-dom';
 import { ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 const useCases = [
   {
     title: 'PROTOCOL RISK',
     description:
       'Eliminate counterparty risk via real-time upgrade monitoring and institutional-grade reports.',
   },
   {
     title: 'DAO DILIGENCE',
     description:
       'Scalable due diligence for treasury decisions with on-chain evidence and compliance trails.',
   },
   {
     title: 'COMPLIANCE REPORTING',
     description:
       'Continuous monitoring provides evaluators with immutable data for audits and DAO governance.',
   },
 ];
 
 export function UseCasesSection() {
   return (
     <section className="py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             USE CASES: INSTITUTIONAL GRADE.
           </h2>
         </div>
 
         <div className="mx-auto max-w-3xl space-y-4">
           {useCases.map((useCase) => (
             <div
               key={useCase.title}
               className="flex gap-4 rounded-sm border border-border bg-card p-6"
             >
               {/* Teal accent line */}
               <div className="w-1 shrink-0 rounded-full bg-primary" />
               
               <div>
                 <h3 className="mb-2 font-display text-lg font-bold uppercase tracking-tight text-foreground">
                   {useCase.title}
                 </h3>
                 <p className="text-sm text-muted-foreground">{useCase.description}</p>
               </div>
             </div>
           ))}
         </div>
 
         {/* CTA */}
         <div className="mt-16 rounded-sm border border-primary/30 bg-primary/5 p-8 text-center lg:p-12">
           <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
             READY TO EXPLORE?
           </h3>
           <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
             Browse the Resilience Explorer to see trust metrics for over 2,800 Solana programs.
           </p>
           <Button asChild size="lg" className="font-display font-semibold uppercase tracking-wider">
             <Link to="/explorer">
               LAUNCH EXPLORER
               <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
           </Button>
         </div>
       </div>
     </section>
   );
 }