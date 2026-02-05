 import { Link } from 'react-router-dom';
 import { TrendingUp, Users, FileCheck, ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 const useCases = [
   {
     icon: TrendingUp,
     title: 'PROTOCOL RISK',
     description:
       'DeFi protocols need to assess counterparty risk before integrating with external programs. Resilience scores provide instant, quantified risk assessment.',
     cta: 'For DeFi Teams',
   },
   {
     icon: Users,
     title: 'DAO DILIGENCE',
     description:
       'DAOs making treasury decisions need transparent program health data. Our indexer provides the on-chain evidence for informed governance.',
     cta: 'For DAOs',
   },
   {
     icon: FileCheck,
     title: 'COMPLIANCE',
     description:
       'Institutional players require audit trails and risk documentation. Resilience reports satisfy regulatory requirements for program assessment.',
     cta: 'For Institutions',
   },
 ];
 
 export function UseCasesSection() {
   return (
     <section className="py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             USE CASES
           </h2>
           <p className="mx-auto max-w-2xl text-muted-foreground">
             Built for everyone who needs to trust the programs they interact with.
           </p>
         </div>
 
         <div className="grid gap-8 md:grid-cols-3">
           {useCases.map((useCase) => (
             <div
               key={useCase.title}
               className="group flex flex-col rounded-sm border border-border bg-card p-6 transition-all hover:border-primary/50"
             >
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-muted">
                 <useCase.icon className="h-6 w-6 text-primary" />
               </div>
 
               <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                 {useCase.title}
               </h3>
 
               <p className="mb-6 flex-1 text-sm text-muted-foreground">{useCase.description}</p>
 
               <div className="flex items-center gap-2 text-sm text-primary">
                 <span className="font-medium">{useCase.cta}</span>
                 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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