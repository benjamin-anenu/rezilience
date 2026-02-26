import { StorySection } from './StorySection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, Network, Coins, CheckCircle } from 'lucide-react';

const mockBreakdown = [
  { icon: Brain, label: 'Brain (GitHub)', weight: '40%', score: 72, color: 'text-primary' },
  { icon: Network, label: 'Nervous System (Deps)', weight: '25%', score: 65, color: 'text-muted-foreground' },
  { icon: Heart, label: 'Heart (Governance)', weight: '20%', score: 58, modifier: '+10', color: 'text-primary' },
  { icon: Coins, label: 'Limbs (TVL)', weight: '15%', score: 44, color: 'text-muted-foreground' },
];

export function MockDashboardSection() {
  return (
    <StorySection>
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">What It Looks Like</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-4">
        DAO Accountability Dashboard
      </h2>
      <p className="text-muted-foreground max-w-xl mb-10">
        Every project page on Rezilience shows real-time governance accountability data.
      </p>

      <div className="max-w-2xl mx-auto">
        {/* Mock project card */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg uppercase tracking-tight">Marinade Finance</CardTitle>
                <p className="text-xs text-muted-foreground font-mono mt-1">mSo1...rKs3 • DeFi</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-bold text-primary">68</p>
                <Badge variant="outline" className="text-[10px] font-mono">HEALTHY</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DAO Accountability mini card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">DAO Accountability</p>
                  <Badge className="ml-auto text-[10px] font-mono bg-primary/20 text-primary border-0">
                    <CheckCircle className="h-3 w-3 mr-1" /> Realms Linked
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Delivery Rate</span>
                  <span className="font-mono text-sm font-bold text-primary">78%</span>
                </div>
                <Progress value={78} className="h-2 mb-3" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-sm border border-border bg-background/50 p-2">
                    <p className="font-mono text-sm font-bold text-foreground">47</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-sm border border-border bg-background/50 p-2">
                    <p className="font-mono text-sm font-bold text-primary">34</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-sm border border-border bg-background/50 p-2">
                    <p className="font-mono text-sm font-bold text-amber-500">3</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Score Breakdown</p>
              {mockBreakdown.map((dim) => (
                <div key={dim.label} className="flex items-center gap-3">
                  <dim.icon className={`h-4 w-4 ${dim.color} shrink-0`} />
                  <span className="text-xs text-muted-foreground w-40">{dim.label} ({dim.weight})</span>
                  <div className="flex-1">
                    <Progress value={dim.score} className="h-1.5" />
                  </div>
                  <span className="font-mono text-xs text-foreground w-8 text-right">{dim.score}</span>
                  {dim.modifier && (
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                      {dim.modifier} realms
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
          ↑ Mock data for demonstration purposes
        </p>
      </div>
    </StorySection>
  );
}
