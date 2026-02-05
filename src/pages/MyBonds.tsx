import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Coins, TrendingUp, Unlock, Wallet, AlertTriangle, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock bond data demonstrating different states
const mockBonds = [
  {
    id: '1',
    programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    programName: 'Jupiter Aggregator',
    stakedAmount: 250,
    lockupEndDate: '2026-08-15',
    currentScore: 94,
    accumulatedYield: 12.5,
    estimatedAPY: 8.2,
    createdAt: '2025-08-15',
  },
  {
    id: '2',
    programId: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    programName: 'Orca Whirlpools',
    stakedAmount: 100,
    lockupEndDate: '2026-06-01',
    currentScore: 91,
    accumulatedYield: 4.8,
    estimatedAPY: 7.5,
    createdAt: '2025-06-01',
  },
  {
    id: '3',
    programId: 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
    programName: 'Solend Protocol',
    stakedAmount: 75,
    lockupEndDate: '2025-12-01',
    currentScore: 65,
    accumulatedYield: 2.1,
    estimatedAPY: 5.8,
    createdAt: '2024-12-01',
  },
];

const MyBonds = () => {
  const today = new Date();
  
  // Calculate portfolio stats
  const totalStaked = mockBonds.reduce((sum, bond) => sum + bond.stakedAmount, 0);
  const totalYield = mockBonds.reduce((sum, bond) => sum + bond.accumulatedYield, 0);
  const claimableNow = mockBonds
    .filter((bond) => bond.currentScore >= 70)
    .reduce((sum, bond) => sum + bond.accumulatedYield, 0);
  const activeBonds = mockBonds.length;

  // Check if any bond has low score
  const hasLowScoreBond = mockBonds.some((bond) => bond.currentScore < 70);

  const truncateProgramId = (id: string) => {
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const isLockupExpired = (endDate: string) => {
    return new Date(endDate) <= today;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                MY BONDS
              </h1>
              <p className="text-muted-foreground">
                Manage your staked bonds and claim earned yield.
              </p>
            </div>
            <Button asChild>
              <Link to="/staking">
                <Plus className="mr-2 h-4 w-4" />
                CREATE NEW BOND
              </Link>
            </Button>
          </div>

          {/* Portfolio Overview Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Staked
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {totalStaked.toLocaleString()} SOL
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Yield Earned
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold text-primary">
                  +{totalYield.toFixed(2)} SOL
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Claimable Now
                </CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold text-primary">
                  {claimableNow.toFixed(2)} SOL
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Bonds
                </CardTitle>
                <Unlock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold text-foreground">
                  {activeBonds}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <AlertDescription className="text-sm text-muted-foreground">
              <strong className="text-foreground">Yield Claiming Rules:</strong> You can claim
              accumulated yield when the program's Resilience Score is ≥ 70. This ensures you only
              earn from actively maintained protocols.
            </AlertDescription>
          </Alert>

          {/* Low Score Warning */}
          {hasLowScoreBond && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-destructive">
                <strong>Yield Locked:</strong> One or more of your bonded programs has a Resilience
                Score below 70. Yield claiming is disabled for these bonds until the program's health
                improves.
              </AlertDescription>
            </Alert>
          )}

          {/* Bonds Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg uppercase tracking-tight">
                Your Bonds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Program ID</TableHead>
                    <TableHead className="text-right">Staked</TableHead>
                    <TableHead>Lock-up End</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Yield</TableHead>
                    <TableHead className="text-right">APY</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBonds.map((bond) => {
                    const canClaim = bond.currentScore >= 70;
                    const canUnstake = isLockupExpired(bond.lockupEndDate);
                    const daysRemaining = getDaysRemaining(bond.lockupEndDate);

                    return (
                      <TableRow key={bond.id}>
                        <TableCell>
                          <Link
                            to={`/program/${bond.programId}`}
                            className="flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {bond.programName}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-xs text-muted-foreground">
                            {truncateProgramId(bond.programId)}
                          </code>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {bond.stakedAmount} SOL
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(bond.lockupEndDate)}
                            {!canUnstake && (
                              <div className="text-xs text-muted-foreground">
                                {daysRemaining} days left
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={canClaim ? 'default' : 'destructive'}
                            className={cn(
                              'font-mono',
                              canClaim
                                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                : 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                            )}
                          >
                            {bond.currentScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          +{bond.accumulatedYield.toFixed(2)} SOL
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {bond.estimatedAPY}%
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={canClaim ? 'default' : 'outline'}
                              disabled={!canClaim}
                              className={cn(
                                'text-xs',
                                !canClaim && 'cursor-not-allowed opacity-50'
                              )}
                            >
                              {canClaim ? 'CLAIM YIELD' : 'CLAIM LOCKED'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canUnstake}
                              className={cn(
                                'text-xs',
                                !canUnstake && 'cursor-not-allowed opacity-50'
                              )}
                            >
                              {canUnstake ? 'UNSTAKE' : 'LOCKED'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MyBonds;
