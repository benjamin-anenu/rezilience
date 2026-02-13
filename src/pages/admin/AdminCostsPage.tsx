import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, DollarSign, Plus, Trash2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  teal: 'hsl(174, 100%, 38%)',
  orange: 'hsl(24, 100%, 38%)',
  steel: 'hsl(212, 11%, 58%)',
};

const tooltipStyle = {
  background: 'hsl(214, 18%, 19%)',
  border: '1px solid hsl(214, 18%, 25%)',
  borderRadius: '2px',
  fontSize: 12,
};

async function fetchCosts() {
  const { data, error } = await supabase
    .from('admin_costs')
    .select('*')
    .order('period', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function AdminCosts() {
  const queryClient = useQueryClient();
  const { data: costs, isLoading } = useQuery({
    queryKey: ['admin-costs'],
    queryFn: fetchCosts,
    staleTime: 60_000,
  });

  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPeriod, setNewPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [newNotes, setNewNotes] = useState('');

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('admin_costs').insert({
        category: newCategory,
        amount_usd: parseFloat(newAmount),
        period: newPeriod,
        notes: newNotes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-costs'] });
      setNewCategory('');
      setNewAmount('');
      setNewNotes('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_costs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-costs'] }),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allCosts = costs || [];
  const totalMonthly = allCosts
    .filter(c => c.period === newPeriod)
    .reduce((s, c) => s + Number(c.amount_usd), 0);

  const totalAll = allCosts.reduce((s, c) => s + Number(c.amount_usd), 0);

  // Aggregate by period for chart
  const periodTotals: Record<string, number> = {};
  allCosts.forEach(c => {
    periodTotals[c.period] = (periodTotals[c.period] || 0) + Number(c.amount_usd);
  });
  const chartData = Object.entries(periodTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, total]) => ({ period, total: Math.round(total * 100) / 100 }));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Maintenance Costs
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          PLATFORM OPERATIONAL EXPENDITURE TRACKING
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Current Period" value={`$${totalMonthly.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} subtitle={newPeriod} />
        <StatCard title="Total Spend" value={`$${totalAll.toFixed(2)}`} subtitle="all-time" />
        <StatCard title="Cost Entries" value={allCosts.length} subtitle="manual records" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Monthly Cost Trend
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 18%, 25%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: COLORS.steel }} />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.steel }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
                  <Bar dataKey="total" fill={COLORS.orange} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground font-mono">
                NO COST DATA YET
              </div>
            )}
          </div>
        </div>

        {/* Add New Cost */}
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Add Cost Entry
          </h3>
          <div className="space-y-3">
            <Input placeholder="Category (e.g., Hosting)" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-background/50 font-mono text-sm" />
            <Input placeholder="Amount (USD)" type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="bg-background/50 font-mono text-sm" />
            <Input type="month" value={newPeriod} onChange={e => setNewPeriod(e.target.value)} className="bg-background/50 font-mono text-sm" />
            <Input placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} className="bg-background/50 font-mono text-sm" />
            <Button onClick={() => addMutation.mutate()} disabled={!newCategory || !newAmount || addMutation.isPending} className="w-full font-display">
              <Plus className="h-4 w-4 mr-2" />
              {addMutation.isPending ? 'ADDING...' : 'ADD ENTRY'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cost Entries Table */}
      {allCosts.length > 0 && (
        <div className="rounded-sm border border-border bg-card/80 p-5">
          <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            All Cost Entries
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3">Period</th>
                  <th className="text-left pb-3">Category</th>
                  <th className="text-right pb-3">Amount</th>
                  <th className="text-left pb-3">Notes</th>
                  <th className="text-right pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {allCosts.map(cost => (
                  <tr key={cost.id} className="border-b border-border/50">
                    <td className="font-mono text-sm">{cost.period}</td>
                    <td>{cost.category}</td>
                    <td className="text-right font-mono text-primary">${Number(cost.amount_usd).toFixed(2)}</td>
                    <td className="text-muted-foreground text-sm">{cost.notes || '—'}</td>
                    <td className="text-right">
                      <button onClick={() => deleteMutation.mutate(cost.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
