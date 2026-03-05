import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, Copy, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DecodedTx {
  signature: string;
  slot: number;
  block_time: string | null;
  success: boolean;
  error: unknown;
  fee_sol: number;
  signers: string[];
  instructions: Array<{
    index: number;
    program: string;
    program_name: string | null;
    parsed: unknown;
    data: string | null;
    accounts: string[];
  }>;
  token_balance_changes: Array<{
    mint: string;
    owner: string;
    change: number;
    decimals: number;
  }>;
  log_messages: string[];
  compute_units: number | null;
}

export function TransactionDecoder() {
  const [sig, setSig] = useState('');

  const decode = useMutation({
    mutationFn: async (signature: string) => {
      const { data, error } = await supabase.functions.invoke('decode-transaction', {
        body: { signature: signature.trim() },
      });
      if (error) throw new Error(error.message || JSON.stringify(error));
      if (data.error) throw new Error(data.error);
      return data as DecodedTx;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sig.trim()) decode.mutate(sig.trim());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const tx = decode.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Transaction Decoder</h2>
        <p className="text-sm text-muted-foreground">
          Paste a transaction signature to get a human-readable breakdown of instructions, fees, and token changes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={sig}
            onChange={(e) => setSig(e.target.value)}
            placeholder="Enter transaction signature..."
            className="pl-10 font-mono text-sm"
          />
        </div>
        <Button type="submit" disabled={decode.isPending || !sig.trim()}>
          {decode.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decode'}
        </Button>
      </form>

      {decode.isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{(decode.error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {tx && (
        <div className="space-y-4">
          {/* Overview */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tx.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <CardTitle className="text-base font-display">
                    {tx.success ? 'Success' : 'Failed'}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(tx.signature)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCell label="Slot" value={tx.slot?.toLocaleString()} />
                <InfoCell label="Time" value={tx.block_time ? new Date(tx.block_time).toLocaleString() : '—'} />
                <InfoCell label="Fee" value={`${tx.fee_sol} SOL`} />
                <InfoCell label="Compute Units" value={tx.compute_units?.toLocaleString() ?? '—'} />
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Instructions ({tx.instructions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tx.instructions.map((ix) => (
                <Collapsible key={ix.index}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-sm border border-border/50 bg-muted/30 px-3 py-2 text-left hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">#{ix.index}</Badge>
                      <span className="text-sm font-mono text-foreground">
                        {ix.program_name || ix.program?.slice(0, 8) + '...'}
                      </span>
                      {(ix.parsed as any)?.type && (
                        <Badge variant="secondary" className="text-[10px]">{(ix.parsed as any).type}</Badge>
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 py-2 border border-t-0 border-border/50 rounded-b-sm bg-muted/10">
                    <p className="text-xs font-mono text-muted-foreground break-all mb-2">
                      Program: {ix.program}
                    </p>
                    {ix.parsed && (
                      <pre className="text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(ix.parsed, null, 2)}
                      </pre>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          {/* Token Balance Changes */}
          {tx.token_balance_changes.length > 0 && (
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">Token Balance Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tx.token_balance_changes.map((change, i) => (
                    <div key={i} className="flex items-center justify-between rounded-sm border border-border/50 bg-muted/30 px-3 py-2">
                      <p className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                        {change.mint.slice(0, 8)}...
                      </p>
                      <span className={cn(
                        'font-mono text-sm font-semibold',
                        change.change > 0 ? 'text-emerald-400' : 'text-destructive'
                      )}>
                        {change.change > 0 ? '+' : ''}{change.change}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logs */}
          {tx.log_messages.length > 0 && (
            <Collapsible>
              <Card className="border-border/50 bg-card/50">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-display">
                      Logs ({tx.log_messages.length})
                    </CardTitle>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="max-h-60 overflow-y-auto rounded-sm bg-muted/30 p-3">
                      {tx.log_messages.map((log, i) => (
                        <p key={i} className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                          {log}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/50 bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className="font-mono text-sm text-foreground">{value}</p>
    </div>
  );
}
