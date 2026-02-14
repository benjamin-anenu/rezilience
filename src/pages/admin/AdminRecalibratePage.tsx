import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Search, Gauge, ArrowRight, Loader2 } from 'lucide-react';

interface ProfileResult {
  id: string;
  project_name: string;
  resilience_score: number | null;
  liveness_status: string | null;
  category: string | null;
  github_commits_30d: number | null;
  github_commit_velocity: number | null;
  dependency_health_score: number | null;
  score_breakdown: any;
}

export function AdminRecalibrate() {
  const { user } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [selected, setSelected] = useState<ProfileResult | null>(null);
  const [targetScore, setTargetScore] = useState(70);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from('claimed_profiles')
      .select('id, project_name, resilience_score, liveness_status, category, github_commits_30d, github_commit_velocity, dependency_health_score, score_breakdown')
      .ilike('project_name', `%${search}%`)
      .limit(10);
    setResults((data as ProfileResult[]) || []);
    setSearching(false);
  };

  const handleRecalibrate = async () => {
    if (!selected || !user?.email) return;
    setLoading(true);
    try {
      const res = await supabase.functions.invoke('admin-recalibrate', {
        body: {
          profile_id: selected.id,
          target_score: targetScore,
          admin_email: user.email,
        },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data;

      if (data?.success) {
        toast({
          title: 'Recalibration Complete',
          description: `${data.profile_name}: ${data.old_score} → ${data.new_score}`,
        });
        setSelected({ ...selected, resilience_score: data.new_score, liveness_status: 'ACTIVE' });
        // Refresh search
        handleSearch();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide">Score Recalibration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Strategic baseline reset for profiles that lost history or changed repos.
        </p>
      </div>

      {/* Search */}
      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search profile by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelected(p); setTargetScore(70); }}
                  className={`w-full flex items-center justify-between rounded-sm px-4 py-3 text-left transition-colors ${
                    selected?.id === p.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-secondary/20 hover:bg-secondary/40'
                  }`}
                >
                  <div>
                    <span className="font-medium text-sm">{p.project_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{p.category || 'uncategorized'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.liveness_status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px]">
                      {p.liveness_status || 'UNKNOWN'}
                    </Badge>
                    <span className="font-mono text-sm font-bold">{p.resilience_score ?? 0}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Profile Details + Recalibrate */}
      {selected && (
        <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              {selected.project_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Current Score', value: selected.resilience_score ?? 0 },
                { label: 'Status', value: selected.liveness_status || 'UNKNOWN' },
                { label: 'Commits/30d', value: selected.github_commits_30d ?? 0 },
                { label: 'Dep Health', value: selected.dependency_health_score ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-sm bg-secondary/20 p-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{label}</p>
                  <p className="text-lg font-bold font-mono">{value}</p>
                </div>
              ))}
            </div>

            {/* Target slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Target Score</span>
                <span className="font-mono text-xl font-bold text-primary">{targetScore}</span>
              </div>
              <Slider
                value={[targetScore]}
                onValueChange={([v]) => setTargetScore(v)}
                min={50}
                max={90}
                step={1}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{selected.resilience_score ?? 0}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-mono text-primary font-bold">{targetScore}</span>
              </div>
            </div>

            {/* Recalibrate button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Gauge className="h-4 w-4 mr-2" />
                  )}
                  Recalibrate to {targetScore}%
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Recalibration</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This will update <strong>{selected.project_name}</strong>'s score from{' '}
                      <strong>{selected.resilience_score ?? 0}</strong> to <strong>{targetScore}</strong>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GitHub velocity, commits, last activity, liveness status, and score breakdown will all be updated. A score history entry will be written.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRecalibrate}>Recalibrate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
