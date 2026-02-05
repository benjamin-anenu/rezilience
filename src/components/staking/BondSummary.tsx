 import { useWallet } from '@solana/wallet-adapter-react';
 import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
 import { TrendingUp, Calendar, Percent, AlertTriangle, Shield } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 
 interface BondSummaryProps {
   formData: {
     programId: string;
     programName: string;
     amount: number;
     lockupMonths: number;
     isValid: boolean;
   };
 }
 
 export function BondSummary({ formData }: BondSummaryProps) {
   const { connected } = useWallet();
 
   // Calculate projected values
   const baseScore = 78;
   const scoreImpact = Math.min(formData.amount * 0.001 * (formData.lockupMonths / 6), 15);
   const projectedScore = Math.min(baseScore + scoreImpact, 99);
   const estimatedAPY = 5 + (formData.lockupMonths - 6) * 0.5;
 
   const unlockDate = new Date();
   unlockDate.setMonth(unlockDate.getMonth() + formData.lockupMonths);
 
   return (
     <div className="space-y-6">
       {/* Bond Summary */}
       <Card className="border-primary/30 bg-card">
         <CardHeader>
           <CardTitle className="font-display text-lg uppercase tracking-tight">
             BOND SUMMARY
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
           {/* Score Impact Visualization */}
           <div>
             <div className="mb-2 flex items-center justify-between text-sm">
               <span className="text-muted-foreground">Score Impact</span>
               <span className="font-mono text-primary">+{scoreImpact.toFixed(1)}</span>
             </div>
             <div className="relative h-4 rounded-sm bg-muted">
               <div
                 className="absolute left-0 top-0 h-full rounded-sm bg-muted-foreground/30"
                 style={{ width: `${baseScore}%` }}
               />
               <div
                 className="absolute left-0 top-0 h-full rounded-sm bg-primary"
                 style={{ width: `${projectedScore}%` }}
               />
             </div>
             <div className="mt-2 flex justify-between text-xs">
               <span className="text-muted-foreground">Current: {baseScore}</span>
               <span className="text-primary">Projected: {projectedScore.toFixed(1)}</span>
             </div>
           </div>
 
           {/* Details Grid */}
           <div className="grid grid-cols-2 gap-4">
             <div className="rounded-sm border border-border p-3">
               <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                 <TrendingUp className="h-3 w-3" />
                 <span>PROJECTED SCORE</span>
               </div>
               <p className="font-mono text-xl font-bold text-primary">
                 {projectedScore.toFixed(1)}
               </p>
             </div>
             <div className="rounded-sm border border-border p-3">
               <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                 <Percent className="h-3 w-3" />
                 <span>ESTIMATED APY</span>
               </div>
               <p className="font-mono text-xl font-bold text-foreground">
                 {estimatedAPY.toFixed(1)}%
               </p>
             </div>
           </div>
 
           {/* Financial Details */}
           <div className="space-y-3 border-t border-border pt-4">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Stake Amount</span>
               <span className="font-mono text-foreground">{formData.amount} SOL</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Lockup Period</span>
               <span className="font-mono text-foreground">{formData.lockupMonths} months</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Unlock Date</span>
               <span className="font-mono text-foreground">
                 {unlockDate.toLocaleDateString('en-US', {
                   year: 'numeric',
                   month: 'short',
                   day: 'numeric',
                 })}
               </span>
             </div>
             <div className="flex justify-between border-t border-border pt-3 text-sm">
               <span className="font-medium text-foreground">Estimated Rewards</span>
               <span className="font-mono font-bold text-primary">
                 ~{((formData.amount * estimatedAPY / 100) * (formData.lockupMonths / 12)).toFixed(2)} SOL
               </span>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Risk Disclosure */}
       <Card className="border-destructive/30 bg-destructive/5">
         <CardContent className="p-4">
           <div className="flex gap-3">
             <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
             <div>
               <p className="mb-1 font-display text-sm font-semibold uppercase text-destructive">
                 RISK DISCLOSURE
               </p>
               <p className="text-xs text-muted-foreground">
                 Staked SOL is locked for the duration of the lockup period and cannot be withdrawn early.
                 The protocol does not guarantee returns. Please stake responsibly.
               </p>
             </div>
           </div>
         </CardContent>
       </Card>
 
       {/* Action Button */}
       {!connected ? (
         <div className="space-y-3">
           <p className="text-center text-sm text-muted-foreground">
             Connect your wallet to create a bond
           </p>
           <div className="flex justify-center">
             <WalletMultiButton />
           </div>
         </div>
       ) : (
         <Button
           className="w-full font-display text-lg font-bold uppercase tracking-wider"
           size="lg"
           disabled={!formData.isValid || formData.amount <= 0}
         >
           <Shield className="mr-2 h-5 w-5" />
           CREATE BOND
         </Button>
       )}
 
       {connected && (
         <p className="text-center text-xs text-muted-foreground">
           Clicking "Create Bond" will prompt your wallet for a signature
         </p>
       )}
     </div>
   );
 }