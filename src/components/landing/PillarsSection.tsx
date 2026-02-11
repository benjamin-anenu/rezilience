 import { Activity, Fingerprint, Shield } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 
 const pillars = [
   {
     icon: Activity,
     title: 'LIVENESS INDEXER',
     subtitle: 'Real-time Activity Monitoring',
     description:
       'Continuous tracking of program upgrades, authority changes, and deployment patterns. Know instantly when a program evolves.',
     metrics: [
       { label: 'Update Latency', value: '<500ms' },
       { label: 'Coverage', value: '100%' },
     ],
   },
   {
     icon: Fingerprint,
     title: 'BYTECODE ORIGINALITY',
     subtitle: 'Cryptographic Verification',
     description:
       'Fingerprint comparison across the ecosystem to identify forks, clones, and verify authentic implementations.',
     metrics: [
       { label: 'Fingerprints', value: '2.8M+' },
       { label: 'Accuracy', value: '99.9%' },
     ],
   },
   {
     icon: Shield,
     title: 'STAKED ASSURANCE',
     subtitle: 'Economic Security Layer',
     description:
       'Stake SOL on programs you trust. Higher stakes = higher rezilience scores. Aligned incentives for the ecosystem.',
     metrics: [
       { label: 'Total Staked', value: '$1.28M' },
       { label: 'Programs', value: '847' },
     ],
   },
 ];
 
 export function PillarsSection() {
   return (
     <section className="border-t border-border bg-card/30 py-20">
       <div className="container mx-auto px-4 lg:px-8">
         <div className="mb-12 text-center">
           <h2 className="mb-4 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
             THREE PILLARS OF TRUST
           </h2>
           <p className="mx-auto max-w-2xl text-muted-foreground">
             Our multi-dimensional approach to program assurance combines real-time monitoring, 
             cryptographic verification, and economic incentives.
           </p>
         </div>
 
         <div className="grid gap-6 md:grid-cols-3">
           {pillars.map((pillar) => (
             <Card key={pillar.title} className="border-border bg-card transition-all hover:border-primary/50 hover:glow-signal">
               <CardHeader>
                 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                   <pillar.icon className="h-6 w-6 text-primary" />
                 </div>
                 <CardTitle className="font-display text-lg uppercase tracking-tight">
                   {pillar.title}
                 </CardTitle>
                 <CardDescription className="font-mono text-xs uppercase text-primary">
                   {pillar.subtitle}
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <p className="mb-6 text-sm text-muted-foreground">{pillar.description}</p>
                 <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                   {pillar.metrics.map((metric) => (
                     <div key={metric.label}>
                       <p className="font-mono text-lg font-bold text-foreground">{metric.value}</p>
                       <p className="text-xs text-muted-foreground">{metric.label}</p>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     </section>
   );
 }