 import { ArrowRight } from 'lucide-react';
 
 const pipelineSteps = [
   { label: 'Solana Mainnet', sublabel: 'Geyser' },
   { label: 'Ingestion Engine', sublabel: 'Rust' },
   { label: 'Bytecode Analyzer', sublabel: 'SSDeep' },
   { label: 'Resilience Score', sublabel: 'API' },
 ];
 
 const codeSnippet = `struct ProgramHealth {
     pub program_id: Pubkey,
     pub last_maintenance: i64,
     pub originality_score: u8,
     pub staked_sol: u64,
 }`;
 
 export function HowItWorksSection() {
   return (
     <section className="py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             HOW IT WORKS: THE TRUTH ENGINE
           </h2>
         </div>
 
         {/* Pipeline Diagram */}
         <div className="mb-12 flex flex-wrap items-center justify-center gap-2 md:gap-4">
           {pipelineSteps.map((step, index) => (
             <div key={step.label} className="flex items-center gap-2 md:gap-4">
               <div className="flex flex-col items-center rounded-sm border border-border bg-card px-4 py-3 md:px-6 md:py-4">
                 <span className="font-mono text-xs font-medium text-foreground md:text-sm">{step.label}</span>
                 <span className="font-mono text-[10px] text-primary md:text-xs">{step.sublabel}</span>
               </div>
               {index < pipelineSteps.length - 1 && (
                 <ArrowRight className="h-4 w-4 text-primary md:h-5 md:w-5" />
               )}
             </div>
           ))}
         </div>
 
         {/* Code Snippet */}
         <div className="mx-auto max-w-2xl">
           <div className="rounded-sm border border-border bg-card">
             <div className="border-b border-border px-4 py-2">
               <span className="font-mono text-xs text-muted-foreground">program_health.rs</span>
             </div>
             <pre className="overflow-x-auto p-4">
               <code className="font-mono text-sm text-foreground">{codeSnippet}</code>
             </pre>
           </div>
         </div>
       </div>
     </section>
   );
 }