 import { Link } from 'react-router-dom';
 import { ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 
 export function HeroSection() {
   return (
     <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-32 pb-20">
       {/* Background gradient mesh */}
       <div className="absolute inset-0">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
         <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
         <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/3 blur-2xl" />
       </div>
 
       <div className="container relative mx-auto px-4 lg:px-8">
         <div className="grid items-center gap-12 lg:grid-cols-2">
           {/* Left column - Content */}
           <div className="flex flex-col">
             <h1 className="mb-6 font-display text-4xl font-bold uppercase leading-none tracking-tight text-foreground md:text-5xl lg:text-6xl">
               MAINTENANCE IS{' '}
               <span className="text-primary">RESILIENCE.</span>
             </h1>
 
             <p className="mb-8 max-w-xl text-lg text-muted-foreground">
               The objective, immutable credit bureau for Solana code. 
               Verify liveness, originality, and economic stake.
             </p>
 
             <div className="flex flex-wrap gap-4">
               <Button asChild size="lg" className="font-display font-semibold uppercase tracking-wider">
                 <Link to="/explorer">
                   EXPLORE LIVENESS DATA
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
             </div>
           </div>
 
           {/* Right column - Network Visualization */}
           <div className="relative hidden lg:block">
             <div className="relative aspect-square">
               {/* Glowing nodes */}
               <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                 {/* Connection lines */}
                 <line x1="200" y1="100" x2="120" y2="180" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="200" y1="100" x2="280" y2="180" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="200" y1="100" x2="200" y2="200" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.5" />
                 <line x1="120" y1="180" x2="200" y2="200" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="280" y1="180" x2="200" y2="200" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="200" y1="200" x2="100" y2="280" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="200" y1="200" x2="200" y2="300" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.5" />
                 <line x1="200" y1="200" x2="300" y2="280" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.3" />
                 <line x1="100" y1="280" x2="200" y2="300" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.2" />
                 <line x1="300" y1="280" x2="200" y2="300" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.2" />
                 <line x1="120" y1="180" x2="80" y2="140" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                 <line x1="280" y1="180" x2="340" y2="120" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                 <line x1="100" y1="280" x2="60" y2="320" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                 <line x1="300" y1="280" x2="360" y2="300" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                 
                 {/* Outer small nodes */}
                 <circle cx="80" cy="140" r="4" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 <circle cx="340" cy="120" r="4" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 <circle cx="60" cy="320" r="4" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 <circle cx="360" cy="300" r="4" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 
                 {/* Medium nodes */}
                 <circle cx="120" cy="180" r="8" fill="hsl(var(--primary))" fillOpacity="0.4" />
                 <circle cx="280" cy="180" r="8" fill="hsl(var(--primary))" fillOpacity="0.4" />
                 <circle cx="100" cy="280" r="6" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 <circle cx="300" cy="280" r="6" fill="hsl(var(--primary))" fillOpacity="0.3" />
                 
                 {/* Main nodes with glow */}
                 <circle cx="200" cy="100" r="12" fill="hsl(var(--primary))" fillOpacity="0.6">
                   <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />
                 </circle>
                 <circle cx="200" cy="200" r="16" fill="hsl(var(--primary))" fillOpacity="0.8">
                   <animate attributeName="r" values="16;18;16" dur="2.5s" repeatCount="indefinite" />
                 </circle>
                 <circle cx="200" cy="300" r="10" fill="hsl(var(--primary))" fillOpacity="0.5">
                   <animate attributeName="r" values="10;12;10" dur="3s" repeatCount="indefinite" />
                 </circle>
               </svg>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }