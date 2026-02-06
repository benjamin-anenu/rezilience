import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Unlock, Wallet, Clock, ArrowRight } from 'lucide-react';

/**
 * My Bonds Page - Phase 2 Placeholder
 * 
 * Bond staking and yield claiming will be implemented in Phase 2.
 * This page serves as a placeholder showing the upcoming feature.
 */
const MyBonds = () => {
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
          </div>

          {/* Portfolio Overview Cards - Empty State */}
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
                  0 SOL
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
                <div className="font-mono text-2xl font-bold text-muted-foreground">
                  0 SOL
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
                <div className="font-mono text-2xl font-bold text-muted-foreground">
                  0 SOL
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
                  0
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Phase 2 Coming Soon */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                COMING IN PHASE 2
              </h2>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Bond staking and yield mechanisms are under development. Stake SOL on verified 
                programs to earn yield based on their Resilience Score.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button asChild variant="outline">
                  <Link to="/explorer">
                    EXPLORE REGISTRY
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/claim-profile">
                    JOIN THE REGISTRY
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Preview */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-sm uppercase tracking-tight text-foreground">
                  STAKE SOL
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bond SOL to programs you believe in. Longer lockups earn higher yields.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-sm uppercase tracking-tight text-foreground">
                  EARN YIELD
                </h3>
                <p className="text-xs text-muted-foreground">
                  Yield unlocks when program Resilience Score stays above 70.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-sm uppercase tracking-tight text-foreground">
                  CLAIM REWARDS
                </h3>
                <p className="text-xs text-muted-foreground">
                  Withdraw earned yield anytime. Principal unlocks after lockup ends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyBonds;
