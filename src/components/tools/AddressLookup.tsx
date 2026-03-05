import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LookupResult {
  address: string;
  type: string;
  exists: boolean;
  known_name: string | null;
  details?: Record<string, unknown>;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  program: { label: 'Program', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  token_mint: { label: 'Token Mint', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  token_account: { label: 'Token Account', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  wallet: { label: 'Wallet', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  unknown: { label: 'Not Found', color: 'bg-muted text-muted-foreground border-border' },
};

export function AddressLookup() {
  const [address, setAddress] = useState('');

  const lookup = useMutation({
    mutationFn: async (addr: string) => {
      const { data, error } = await supabase.functions.invoke('lookup-address', {
        body: { address: addr.trim() },
      });
      if (error) throw error;
      return data as LookupResult;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) lookup.mutate(address.trim());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const result = lookup.data;
  const tc = result ? typeConfig[result.type] || typeConfig.unknown : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Token / Program Lookup</h2>
        <p className="text-sm text-muted-foreground">
          Paste any Solana address to get decoded account info, type detection, and metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter a Solana address (base58)..."
            className="pl-10 font-mono text-sm"
          />
        </div>
        <Button type="submit" disabled={lookup.isPending || !address.trim()}>
          {lookup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
        </Button>
      </form>

      {lookup.isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{(lookup.error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-display">
                  {result.known_name || result.type.replace('_', ' ').toUpperCase()}
                </CardTitle>
                {tc && (
                  <Badge variant="outline" className={cn('text-xs', tc.color)}>
                    {tc.label}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(result.address)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={`https://solscan.io/account/${result.address}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground break-all">{result.address}</p>
          </CardHeader>
          {result.details && (
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(result.details).map(([key, value]) => (
                  <div key={key} className="rounded-sm border border-border/50 bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="font-mono text-sm text-foreground break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
