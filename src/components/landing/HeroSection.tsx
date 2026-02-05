 import { Link } from 'react-router-dom';
 import { ArrowRight, Shield, Activity, Fingerprint } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import heroBg from '@/assets/hero-bg.png';
 
 export function HeroSection() {
   return (
     <section className="relative overflow-hidden py-20 lg:py-32">
       {/* Background image with dark overlay */}
       <div 
         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${heroBg})` }}
       />
       <div className="absolute inset-0 bg-background/80" />
 
       <div className="container relative mx-auto px-4 lg:px-8">
         <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
           {/* Left content */}
           <div className="flex flex-col justify-center">
             <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1">
               <Activity className="h-4 w-4 text-primary" />
               <span className="font-mono text-xs text-primary">ON-CHAIN ASSURANCE</span>
             </div>
 
             <h1 className="mb-6 font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
               MAINTENANCE IS{' '}
               <span className="text-primary">RESILIENCE</span>
             </h1>
 
             <p className="mb-8 max-w-xl text-lg text-muted-foreground">
               Quantified trust metrics for Solana programs. Track upgrade frequency, 
               verify bytecode originality, and stake on program integrity.
             </p>
 
             <div className="flex flex-wrap gap-4">
               <Button asChild size="lg" className="font-display font-semibold uppercase tracking-wider">
                 <Link to="/explorer">
                   EXPLORE PROGRAMS
                   <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
               <Button asChild variant="outline" size="lg" className="font-display font-semibold uppercase tracking-wider">
                 <Link to="/staking">
                   STAKE NOW
                 </Link>
               </Button>
             </div>
 
             {/* Stats */}
             <div className="mt-12 grid grid-cols-3 gap-8">
               <div>
                 <p className="font-mono text-2xl font-bold text-primary">2,847</p>
                 <p className="text-sm text-muted-foreground">Programs Indexed</p>
               </div>
               <div>
                 <p className="font-mono text-2xl font-bold text-primary">$1.28M</p>
                 <p className="text-sm text-muted-foreground">Total Staked</p>
               </div>
               <div>
                 <p className="font-mono text-2xl font-bold text-primary">73.4</p>
                 <p className="text-sm text-muted-foreground">Avg. Score</p>
               </div>
             </div>
           </div>
 
           {/* Right content - Abstract geometric illustration */}
           <div className="relative hidden lg:flex lg:items-center lg:justify-center">
             <div className="relative h-96 w-96">
               {/* Central node */}
               <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-primary bg-primary/20 glow-signal">
                 <Shield className="h-10 w-10 text-primary" />
               </div>
 
               {/* Orbital nodes */}
               <div className="absolute left-0 top-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                 <Activity className="h-6 w-6 text-muted-foreground" />
               </div>
               <div className="absolute right-0 top-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                 <Fingerprint className="h-6 w-6 text-muted-foreground" />
               </div>
               <div className="absolute bottom-0 left-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                 <Shield className="h-6 w-6 text-muted-foreground" />
               </div>
               <div className="absolute bottom-0 right-1/4 flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                 <Activity className="h-6 w-6 text-muted-foreground" />
               </div>
 
               {/* Connection lines */}
               <svg className="absolute inset-0 h-full w-full" style={{ zIndex: -1 }}>
                 <line x1="48" y1="96" x2="160" y2="160" stroke="hsl(var(--border))" strokeWidth="1" />
                 <line x1="336" y1="96" x2="224" y2="160" stroke="hsl(var(--border))" strokeWidth="1" />
                 <line x1="96" y1="336" x2="160" y2="224" stroke="hsl(var(--border))" strokeWidth="1" />
                 <line x1="288" y1="336" x2="224" y2="224" stroke="hsl(var(--border))" strokeWidth="1" />
               </svg>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }