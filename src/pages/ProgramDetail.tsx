 import { useParams, Link } from 'react-router-dom';
 import { ArrowLeft } from 'lucide-react';
 import { Layout } from '@/components/layout';
 import { ProgramHeader, UpgradeChart, RecentEvents, MetricCards } from '@/components/program';
 import { Button } from '@/components/ui/button';
 import { getProgramById } from '@/data/mockData';
 
 const ProgramDetail = () => {
   const { id } = useParams<{ id: string }>();
   const program = getProgramById(id || '1');
 
   if (!program) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-20 text-center lg:px-8">
           <h1 className="mb-4 font-display text-3xl font-bold text-foreground">
             PROGRAM NOT FOUND
           </h1>
           <p className="mb-8 text-muted-foreground">
             The program you're looking for doesn't exist.
           </p>
           <Button asChild>
             <Link to="/explorer">
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back to Explorer
             </Link>
           </Button>
         </div>
       </Layout>
     );
   }
 
   return (
     <Layout>
       <div className="py-8">
         <div className="container mx-auto px-4 lg:px-8">
           {/* Back link */}
           <div className="mb-6">
             <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
               <Link to="/explorer">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Explorer
               </Link>
             </Button>
           </div>
 
           {/* Header */}
           <div className="mb-8">
             <ProgramHeader program={program} />
           </div>
 
           {/* Main content grid */}
           <div className="grid gap-6 lg:grid-cols-3">
             {/* Chart - takes 2 columns */}
             <div className="lg:col-span-2">
               <UpgradeChart />
             </div>
 
             {/* Recent Events - takes 1 column */}
             <div>
               <RecentEvents />
             </div>
           </div>
 
           {/* Metric Cards */}
           <div className="mt-6">
             <MetricCards program={program} />
           </div>
 
           {/* Stake CTA */}
           <div className="mt-8 rounded-sm border border-primary/30 bg-primary/5 p-6 text-center">
             <h3 className="mb-2 font-display text-xl font-bold uppercase text-foreground">
               SUPPORT THIS PROGRAM
             </h3>
             <p className="mb-4 text-sm text-muted-foreground">
               Stake SOL to increase the resilience score and earn rewards.
             </p>
             <Button asChild className="font-display font-semibold uppercase tracking-wider">
               <Link to={`/staking?program=${program.programId}`}>
                 STAKE ON {program.name.toUpperCase()}
               </Link>
             </Button>
           </div>
         </div>
       </div>
     </Layout>
   );
 };
 
 export default ProgramDetail;