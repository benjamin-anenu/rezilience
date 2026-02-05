 import { Star, DollarSign, Activity, Fingerprint, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
 import { Badge } from '@/components/ui/badge';
 
 export function ProblemSolutionSection() {
   return (
     <section className="border-t border-border bg-card/30 py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             THE PROBLEM: VANITY METRICS FAIL.
           </h2>
         </div>
 
         <div className="grid gap-8 md:grid-cols-2">
           {/* Red Ocean - Traditional Metrics */}
           <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8">
             <h3 className="mb-6 font-display text-lg font-bold uppercase tracking-tight text-destructive">
               RED OCEAN
             </h3>
             
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-destructive/20 bg-background">
                   <Star className="h-6 w-6 text-muted-foreground" />
                 </div>
                 <div>
                   <p className="font-mono text-sm text-muted-foreground">GitHub Stars</p>
                   <p className="text-xs text-muted-foreground/60">Popularity ≠ Security</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-destructive/20 bg-background">
                   <DollarSign className="h-6 w-6 text-muted-foreground" />
                 </div>
                 <div>
                   <p className="font-mono text-sm text-muted-foreground">TVL</p>
                   <p className="text-xs text-muted-foreground/60">Capital ≠ Code Quality</p>
                 </div>
               </div>
             </div>
             
             <div className="mt-8">
               <Badge variant="destructive" className="font-mono text-xs uppercase">
                 <AlertTriangle className="mr-1 h-3 w-3" />
                 DECAY DETECTED
               </Badge>
             </div>
           </div>
 
           {/* Blue Ocean - Resilience Metrics */}
           <div className="rounded-sm border border-primary/30 bg-primary/5 p-8">
             <h3 className="mb-6 font-display text-lg font-bold uppercase tracking-tight text-primary">
               BLUE OCEAN: RESILIENCE
             </h3>
             
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary/20 bg-background">
                   <Activity className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                   <p className="font-mono text-sm text-foreground">Liveness Score</p>
                   <p className="text-xs text-muted-foreground">Real-time upgrade tracking</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary/20 bg-background">
                   <Fingerprint className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                   <p className="font-mono text-sm text-foreground">Originality Index</p>
                   <p className="text-xs text-muted-foreground">Bytecode fingerprinting</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary/20 bg-background">
                   <Shield className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                   <p className="font-mono text-sm text-foreground">Staked Assurance</p>
                   <p className="text-xs text-muted-foreground">Economic guarantees</p>
                 </div>
               </div>
             </div>
             
             <div className="mt-8">
               <Badge className="bg-primary font-mono text-xs uppercase text-primary-foreground">
                 <CheckCircle className="mr-1 h-3 w-3" />
                 VERIFIED ACTIVE
               </Badge>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }