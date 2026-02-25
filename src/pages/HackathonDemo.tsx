import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Search, ArrowRight, CheckCircle, AlertTriangle, ExternalLink, Loader2, Shield, Brain, Network, Coins, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealmsResult {
  total: number;
  completed: number;
  active: number;
  delivery_rate: number | null;
  state_breakdown: Record<string, number>;
  latency_ms: number;
}

export default function HackathonDemo() {
  const [daoAddress, setDaoAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RealmsResult | null>(null);
  const [error, setError] = useState('');

  const exampleDAOs = [
    { name: 'Marinade DAO', address: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw' },
    { name: 'Mango DAO', address: 'DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE' },
    { name: 'Drift DAO', address: 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH' },
  ];

  const handleAnalyze = async (address: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    setDaoAddress(address);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-realms-governance', {
        body: {
          realm_address: address,
          profile_id: '00000000-0000-0000-0000-000000000000', // Demo mode — won't update a real profile
        },
      });

      if (fnError) throw fnError;
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch governance data');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryColor = (rate: number | null) => {
    if (rate === null) return 'text-muted-foreground';
    if (rate >= 70) return 'text-primary';
    if (rate >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const getScoreImpact = (rate: number | null) => {
    if (rate === null) return { modifier: '—', label: 'No data', color: 'text-muted-foreground' };
    if (rate >= 70) return { modifier: '+10', label: 'Governance bonus applied', color: 'text-primary' };
    if (rate >= 40) return { modifier: '±0', label: 'No modifier', color: 'text-amber-500' };
    return { modifier: '-15', label: 'Governance penalty applied', color: 'text-destructive' };
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero */}
        <section className="border-b border-border py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase tracking-wider">
              HACKATHON DEMO
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-foreground mb-4">
              Rezilience × Realms
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              DAO Accountability Layer
            </p>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Track whether governance-funded projects actually deliver.
              Realms proposal execution mapped to Rezilience scores.
            </p>
          </div>
        </section>

        {/* Pipeline visualization */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-lg uppercase tracking-wider text-foreground mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-12">
              {[
                { icon: Search, num: '01', title: 'INDEX', desc: 'Read spl-governance proposals from any Realms DAO' },
                { icon: Shield, num: '02', title: 'CATEGORIZE', desc: 'Map proposal states: Draft, Voting, Completed, Defeated' },
                { icon: Heart, num: '03', title: 'SCORE', desc: 'Calculate Delivery Rate and apply governance modifier' },
                { icon: Zap, num: '04', title: 'TRACK', desc: 'Continuous hourly refresh via governance cron' },
              ].map((step, i) => (
                <div key={step.num} className="relative rounded-sm border border-border bg-card/40 p-4">
                  <span className="font-mono text-3xl font-bold text-primary/20">{step.num}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold tracking-wider text-foreground">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{step.desc}</p>
                  {i < 3 && (
                    <ArrowRight className="absolute -right-3 top-1/2 h-4 w-4 text-primary/40 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            {/* Live Demo */}
            <Card className="card-premium mb-8">
              <CardHeader>
                <CardTitle className="font-display text-lg uppercase tracking-tight">
                  Live DAO Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste a Realms DAO address..."
                    value={daoAddress}
                    onChange={(e) => setDaoAddress(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    onClick={() => handleAnalyze(daoAddress)}
                    disabled={loading || !daoAddress}
                    className="font-display uppercase tracking-wider"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Analyze'
                    )}
                  </Button>
                </div>

                {/* Example DAOs */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Try:</span>
                  {exampleDAOs.map((dao) => (
                    <Button
                      key={dao.name}
                      variant="outline"
                      size="sm"
                      className="text-xs font-mono"
                      onClick={() => handleAnalyze(dao.address)}
                      disabled={loading}
                    >
                      {dao.name}
                    </Button>
                  ))}
                </div>

                {error && (
                  <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Delivery Rate Hero */}
                <Card className="card-premium">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Delivery Rate</p>
                        <p className={`font-mono text-5xl font-bold ${getDeliveryColor(result.delivery_rate)}`}>
                          {result.delivery_rate !== null ? `${result.delivery_rate}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Rezilience Score Impact</p>
                        <p className={`font-mono text-2xl font-bold ${getScoreImpact(result.delivery_rate).color}`}>
                          {getScoreImpact(result.delivery_rate).modifier}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getScoreImpact(result.delivery_rate).label}
                        </p>
                      </div>
                    </div>
                    {result.delivery_rate !== null && (
                      <Progress
                        value={result.delivery_rate}
                        className={`h-3 ${
                          result.delivery_rate < 40
                            ? '[&>div]:bg-destructive'
                            : result.delivery_rate < 70
                            ? '[&>div]:bg-amber-500'
                            : ''
                        }`}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Breakdown */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6 text-center">
                      <p className="font-mono text-3xl font-bold text-foreground">{result.total}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Proposals</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6 text-center">
                      <p className="font-mono text-3xl font-bold text-primary">{result.completed}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Completed / Executing</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border bg-card">
                    <CardContent className="pt-6 text-center">
                      <p className="font-mono text-3xl font-bold text-amber-500">{result.active}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Voting</p>
                    </CardContent>
                  </Card>
                </div>

                {/* State Breakdown */}
                {result.state_breakdown && Object.keys(result.state_breakdown).length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="font-display text-sm uppercase tracking-tight">
                        Proposal State Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(result.state_breakdown).map(([state, count]) => (
                          <div key={state} className="rounded-sm border border-border bg-muted/20 px-3 py-2">
                            <p className="font-mono text-lg font-bold text-foreground">{count}</p>
                            <p className="text-xs text-muted-foreground">{state}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scoring explanation */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="font-display text-sm uppercase tracking-wider text-foreground mb-3">
                      How This Maps to Rezilience
                    </h3>
                    <div className="grid gap-3 md:grid-cols-4">
                      {[
                        { icon: Brain, label: 'Brain (40%)', desc: 'GitHub Activity — unchanged' },
                        { icon: Network, label: 'Nervous System (25%)', desc: 'Dependencies — unchanged' },
                        { icon: Heart, label: 'Heart (20%)', desc: `Governance — ${getScoreImpact(result.delivery_rate).modifier} Realms modifier` },
                        { icon: Coins, label: 'Limbs (15%)', desc: 'TVL/Economics — unchanged' },
                      ].map((dim) => (
                        <div key={dim.label} className="flex gap-2">
                          <dim.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-foreground">{dim.label}</p>
                            <p className="text-xs text-muted-foreground">{dim.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-center font-mono text-xs text-muted-foreground/50">
                  Analysis completed in {result.latency_ms}ms • Data from Solana RPC
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 text-center border-t border-border pt-12">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
                This Is What Accountability Looks Like
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Rezilience doesn't just track if a project is alive — it tracks if governance-funded
                projects actually deliver on their promises.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild className="font-display uppercase tracking-wider">
                  <a href="/explorer">Explore Registry</a>
                </Button>
                <Button asChild variant="outline" className="font-display uppercase tracking-wider">
                  <a href="/readme">Read the Methodology</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
