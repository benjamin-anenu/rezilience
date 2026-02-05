 // Resilience Type Definitions
 
 export interface Program {
   id: string;
   name: string;
   programId: string;
   score: number;
   livenessStatus: 'active' | 'dormant' | 'degraded';
   originalityStatus: 'verified' | 'unverified' | 'fork';
   stakedAmount: number;
   lastUpgrade: string;
   upgradeCount: number;
   rank: number;
 }
 
 export interface UpgradeEvent {
   date: string;
   type: 'upgrade' | 'authority_change' | 'stake_added' | 'stake_removed';
   description: string;
   txHash: string;
 }
 
 export interface ChartDataPoint {
   month: string;
   upgrades: number;
   score: number;
 }
 
 export interface EcosystemStats {
   programsIndexed: number;
   averageScore: number;
   totalStaked: number;
   activePrograms: number;
 }
 
 export interface StakingFormData {
   programId: string;
   programName: string;
   amount: number;
   lockupMonths: number;
 }
 
 export interface BondSummary {
   currentScore: number;
   projectedScore: number;
   scoreIncrease: number;
   estimatedAPY: number;
   unlockDate: string;
 }