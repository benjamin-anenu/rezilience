 import { Program, EcosystemStats, UpgradeEvent, ChartDataPoint } from '@/types';
 
 export const ecosystemStats: EcosystemStats = {
   programsIndexed: 2847,
   averageScore: 73.4,
   totalStaked: 1284750,
   activePrograms: 2341,
 };
 
 export const programs: Program[] = [
   {
     id: '1',
     name: 'Jupiter Exchange',
     programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
     score: 94,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 245000,
     lastUpgrade: '2024-01-15',
     upgradeCount: 12,
     rank: 1,
   },
   {
     id: '2',
     name: 'Marinade Finance',
     programId: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
     score: 91,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 189000,
     lastUpgrade: '2024-01-10',
     upgradeCount: 8,
     rank: 2,
   },
   {
     id: '3',
     name: 'Raydium AMM',
     programId: 'RaydiumPFKoXLY8HbXUqe6ZZ4D2jXZ5xCp1uxSp9yQB1',
     score: 88,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 156000,
     lastUpgrade: '2024-01-08',
     upgradeCount: 15,
     rank: 3,
   },
   {
     id: '4',
     name: 'Orca Whirlpool',
     programId: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
     score: 85,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 134000,
     lastUpgrade: '2024-01-05',
     upgradeCount: 10,
     rank: 4,
   },
   {
     id: '5',
     name: 'Drift Protocol',
     programId: 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
     score: 82,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 98000,
     lastUpgrade: '2024-01-03',
     upgradeCount: 18,
     rank: 5,
   },
   {
     id: '6',
     name: 'Mango Markets',
     programId: 'mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68',
     score: 79,
     livenessStatus: 'dormant',
     originalityStatus: 'verified',
     stakedAmount: 67000,
     lastUpgrade: '2023-11-20',
     upgradeCount: 22,
     rank: 6,
   },
   {
     id: '7',
     name: 'Serum DEX',
     programId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
     score: 76,
     livenessStatus: 'dormant',
     originalityStatus: 'verified',
     stakedAmount: 45000,
     lastUpgrade: '2023-09-15',
     upgradeCount: 5,
     rank: 7,
   },
   {
     id: '8',
     name: 'Tensor NFT',
     programId: 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN',
     score: 74,
     livenessStatus: 'active',
     originalityStatus: 'fork',
     stakedAmount: 34000,
     lastUpgrade: '2024-01-12',
     upgradeCount: 7,
     rank: 8,
   },
   {
     id: '9',
     name: 'Phoenix DEX',
     programId: 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
     score: 71,
     livenessStatus: 'active',
     originalityStatus: 'verified',
     stakedAmount: 28000,
     lastUpgrade: '2024-01-01',
     upgradeCount: 4,
     rank: 9,
   },
   {
     id: '10',
     name: 'Kamino Finance',
     programId: 'KAMino1e3wZhLpFYsExBQQFfYJkQrCfTxk1qgCv8iqt',
     score: 68,
     livenessStatus: 'active',
     originalityStatus: 'unverified',
     stakedAmount: 21000,
     lastUpgrade: '2023-12-28',
     upgradeCount: 6,
     rank: 10,
   },
 ];
 
 export const recentEvents: UpgradeEvent[] = [
   {
     date: '2024-01-15',
     type: 'upgrade',
     description: 'Program bytecode updated to v2.3.1',
     txHash: '5KtP...9xQw',
   },
   {
     date: '2024-01-10',
     type: 'stake_added',
     description: '25,000 SOL staked by 0x7a2b...4f1c',
     txHash: '3mNp...7yRt',
   },
   {
     date: '2024-01-08',
     type: 'authority_change',
     description: 'Upgrade authority transferred to multisig',
     txHash: '8wXz...2kLm',
   },
   {
     date: '2024-01-05',
     type: 'upgrade',
     description: 'Security patch applied',
     txHash: '1qAz...5tGb',
   },
   {
     date: '2024-01-02',
     type: 'stake_removed',
     description: '5,000 SOL unstaked (lockup expired)',
     txHash: '6pLk...0mVn',
   },
 ];
 
 export const upgradeChartData: ChartDataPoint[] = [
   { month: 'Feb', upgrades: 2, score: 78 },
   { month: 'Mar', upgrades: 1, score: 80 },
   { month: 'Apr', upgrades: 3, score: 82 },
   { month: 'May', upgrades: 0, score: 81 },
   { month: 'Jun', upgrades: 2, score: 84 },
   { month: 'Jul', upgrades: 1, score: 86 },
   { month: 'Aug', upgrades: 0, score: 85 },
   { month: 'Sep', upgrades: 2, score: 88 },
   { month: 'Oct', upgrades: 1, score: 90 },
   { month: 'Nov', upgrades: 0, score: 89 },
   { month: 'Dec', upgrades: 1, score: 92 },
   { month: 'Jan', upgrades: 2, score: 94 },
 ];
 
 export const getProgramById = (id: string): Program | undefined => {
   return programs.find((p) => p.id === id);
 };
 
 export const searchPrograms = (query: string): Program[] => {
   const lowerQuery = query.toLowerCase();
   return programs.filter(
     (p) =>
       p.name.toLowerCase().includes(lowerQuery) ||
       p.programId.toLowerCase().includes(lowerQuery)
   );
 };