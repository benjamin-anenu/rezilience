import { Database, Cpu, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: 'INDEX',
    description: 'Multi-dimensional scoring of every Solana project — GitHub, dependencies, governance, and TVL analyzed continuously.',
  },
  {
    icon: Cpu,
    title: 'VERIFY',
    description: 'On-chain authority verification, GitHub ownership proof, bytecode originality and dependency health checks.',
  },
  {
    icon: Shield,
    title: 'COMMIT',
    description: 'Economic commitment through staked assurance bonds with public milestone tracking and timeline alerts.',
  },
  {
    icon: AlertTriangle,
    title: 'DETECT',
    description: 'AEGIS Supply Chain Intelligence — real-time dependency graph mapping, automated CVE detection, and cross-program risk alerts.',
  },
];
 
 export function HowItWorksSection() {
   return (
     <section className="py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             HOW IT WORKS
           </h2>
           <p className="mx-auto max-w-2xl text-muted-foreground">
             A three-stage pipeline that transforms raw on-chain data into actionable trust metrics.
           </p>
         </div>
 
         <div className="relative">
           {/* Connection line (desktop) */}
           <div className="absolute left-0 right-0 top-12 hidden h-px bg-border md:block" />
 
           <div className="grid gap-8 md:grid-cols-4">
             {steps.map((step, index) => (
               <div key={step.title} className="relative">
                 {/* Step card */}
                 <div className="flex flex-col items-center text-center">
                   {/* Icon container */}
                   <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-sm border border-border bg-card">
                     <step.icon className="h-10 w-10 text-primary" />
                   </div>
 
                   {/* Step number */}
                   <div className="mb-2 font-mono text-xs text-muted-foreground">
                     STEP {index + 1}
                   </div>
 
                   <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                     {step.title}
                   </h3>
 
                   <p className="text-sm text-muted-foreground">{step.description}</p>
                 </div>
 
                 {/* Arrow (between cards) */}
                 {index < steps.length - 1 && (
                   <div className="absolute -right-4 top-12 hidden md:block">
                     <ArrowRight className="h-6 w-6 text-primary" />
                   </div>
                 )}
               </div>
             ))}
           </div>
         </div>
       </div>
     </section>
   );
 }