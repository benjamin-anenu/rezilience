 import { Database, Cpu, Shield, BarChart3 } from 'lucide-react';
 
 const pipelineNodes = [
   { icon: Database, title: 'Solana Mainnet', subtitle: '(Geyser)' },
   { icon: Cpu, title: 'Ingestion Engine', subtitle: '(Rust)' },
   { icon: Shield, title: 'Bytecode Analyzer', subtitle: '(SSDeep)' },
   { icon: BarChart3, title: 'Resilience', subtitle: 'Score API' },
 ];
 
 const codeSnippet = `struct ProgramHealth {
     pub program_id: Pubkey,
     pub last_maintenance: i64,
     pub originality_score: u8,
     pub staked_sol: u64
 }`;
 
 export function HowItWorksSection() {
   return (
     <section className="border-t border-border bg-background py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             HOW IT WORKS
           </h2>
           <p className="mx-auto max-w-2xl text-muted-foreground">
             A three-stage pipeline that transforms raw on-chain data into actionable trust metrics.
           </p>
         </div>
 
         {/* Pipeline Diagram */}
         <div className="relative mx-auto max-w-5xl rounded-lg border border-border bg-card/50 p-8 md:p-12">
           {/* Connection Lines - SVG Overlay */}
           <svg 
             className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" 
             preserveAspectRatio="none"
           >
             {/* Horizontal line connecting nodes */}
             <line 
               x1="12%" y1="35%" x2="88%" y2="35%" 
               stroke="hsl(174 100% 38%)" 
               strokeWidth="2"
               strokeDasharray="0"
             />
             {/* Vertical line down to code block */}
             <line 
               x1="62%" y1="35%" x2="62%" y2="55%" 
               stroke="hsl(174 100% 38%)" 
               strokeWidth="2"
             />
             {/* Horizontal line to code block */}
             <line 
               x1="62%" y1="55%" x2="75%" y2="55%" 
               stroke="hsl(174 100% 38%)" 
               strokeWidth="2"
             />
             {/* Arrow heads */}
             <polygon 
               points="0,-4 8,0 0,4" 
               fill="hsl(174 100% 38%)" 
               transform="translate(315, 107)"
             />
           </svg>
 
           {/* Pipeline Nodes */}
           <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
             {pipelineNodes.map((node, index) => (
               <div key={node.title} className="flex flex-col items-center">
                 <div 
                   className="mb-3 flex h-16 w-full items-center justify-center gap-2 rounded border border-primary/40 bg-card px-3 py-2 transition-all hover:border-primary hover:glow-signal"
                   style={{ boxShadow: '0 0 20px hsl(174 100% 38% / 0.1)' }}
                 >
                   <node.icon 
                     className="h-5 w-5 shrink-0 text-primary" 
                     style={{ filter: 'drop-shadow(0 0 4px hsl(174 100% 38% / 0.5))' }}
                   />
                   <div className="text-center">
                     <p className="font-display text-xs font-semibold uppercase tracking-tight text-foreground md:text-sm">
                       {node.title}
                     </p>
                     <p className="font-mono text-[10px] text-muted-foreground md:text-xs">
                       {node.subtitle}
                     </p>
                   </div>
                 </div>
                 {/* Arrow indicator for mobile */}
                 {index < pipelineNodes.length - 1 && (
                   <div className="my-2 text-primary md:hidden">→</div>
                 )}
               </div>
             ))}
           </div>
 
           {/* Code Snippet Panel */}
           <div className="mt-8 flex justify-center md:justify-end">
             <div className="w-full max-w-sm rounded border border-border bg-background p-4 md:mr-8">
               <div className="mb-2 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-primary" />
                 <span className="font-mono text-xs text-muted-foreground">Concrete</span>
               </div>
               <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
                 <code>
                   <span className="text-primary">struct</span>{' '}
                   <span className="text-foreground">ProgramHealth</span>{' '}
                   <span className="text-muted-foreground">{'{'}</span>
                   {'\n'}
                   {'    '}<span className="text-primary">pub</span>{' '}
                   <span className="text-foreground">program_id</span>:{' '}
                   <span className="text-muted-foreground">Pubkey</span>,
                   {'\n'}
                   {'    '}<span className="text-primary">pub</span>{' '}
                   <span className="text-foreground">last_maintenance</span>:{' '}
                   <span className="text-muted-foreground">i64</span>,
                   {'\n'}
                   {'    '}<span className="text-primary">pub</span>{' '}
                   <span className="text-foreground">originality_score</span>:{' '}
                   <span className="text-muted-foreground">u8</span>,
                   {'\n'}
                   {'    '}<span className="text-primary">pub</span>{' '}
                   <span className="text-foreground">staked_sol</span>:{' '}
                   <span className="text-muted-foreground">u64</span>
                   {'\n'}
                   <span className="text-muted-foreground">{'}'}</span>
                 </code>
               </pre>
             </div>
           </div>
         </div>
       </div>
     </section>
   );
 }