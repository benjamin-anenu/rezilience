import { useState } from 'react';
import { StorySection } from './StorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Network, Heart, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RealmsResult {
  total: number;
  completed: number;
  active: number;
  delivery_rate: number | null;
  state_breakdown: Record<string, number>;
  latency_ms: number;
}

const exampleDAOs = [
  { name: 'Marinade DAO', address: 'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw' },
  { name: 'Realms Ecosystem DAO', address: 'By2sVGqhDB4aWvTcSwpCPMePF983W2fGro8VJf4qEBYB' },
];

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

export function LiveAnalysisSection() {
  const [daoAddress, setDaoAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RealmsResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (address: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    setDaoAddress(address);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-realms-governance', {
        body: {
          realm_address: address,
          profile_id: '00000000-0000-0000-0000-000000000000',
        },
      });
      if (fnError) throw fnError;
      if (data.proposals === 0 || !data.total) {
        setError("No governance proposals found for this address. Make sure you're using a Realm address from realms.today — not a Solana program ID.");
        return;
      }
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to send') || msg.includes('fetch') || msg.includes('CORS') || msg.includes('NetworkError')) {
        setError('Request timed out. The DAO may have too many governance accounts for real-time analysis. Try a smaller DAO or try again.');
      } else {
        setError(msg || 'Failed to fetch governance data');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">Try It Yourself</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        Live DAO Analysis
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Paste any Realms DAO address and see its delivery rate computed in real time from on-chain data.
      </p>

      <div className="max-w-2xl mx-auto">
        <Card className="card-premium mb-6">
          <CardHeader>
            <CardTitle className="font-display text-sm uppercase tracking-tight">Analyze a DAO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste a Realm address from realms.today..."
                value={daoAddress}
                onChange={(e) => setDaoAddress(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={() => handleAnalyze(daoAddress)}
                disabled={loading || !daoAddress}
                className="font-display uppercase tracking-wider"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Analyzing...</> : 'Analyze'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use the Realm address from your DAO's page on realms.today — this is different from a Solana program ID.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              {exampleDAOs.map((dao) => (
                <Button key={dao.name} variant="outline" size="sm" className="text-xs font-mono" onClick={() => handleAnalyze(dao.address)} disabled={loading}>
                  {dao.name}
                </Button>
              ))}
            </div>
            {loading && (
              <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm text-muted-foreground">⏳ This may take up to 30 seconds for large DAOs...</p>
              </div>
            )}
            {error && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Delivery Rate */}
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
                    <p className="text-xs text-muted-foreground">{getScoreImpact(result.delivery_rate).label}</p>
                  </div>
                </div>
                {result.delivery_rate !== null && (
                  <Progress
                    value={result.delivery_rate}
                    className={`h-3 ${result.delivery_rate < 40 ? '[&>div]:bg-destructive' : result.delivery_rate < 70 ? '[&>div]:bg-amber-500' : ''}`}
                  />
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { value: result.total, label: 'Total Proposals', color: 'text-foreground' },
                { value: result.completed, label: 'Completed / Executing', color: 'text-primary' },
                { value: result.active, label: 'Active Voting', color: 'text-amber-500' },
              ].map((s) => (
                <Card key={s.label} className="border-border bg-card">
                  <CardContent className="pt-6 text-center">
                    <p className={`font-mono text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* State breakdown */}
            {result.state_breakdown && Object.keys(result.state_breakdown).length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-sm uppercase tracking-tight">Proposal State Breakdown</CardTitle>
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

            {/* Score mapping */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="font-display text-sm uppercase tracking-wider text-foreground mb-3">How This Maps to Rezilience</h3>
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
      </div>
    </StorySection>
  );
}
