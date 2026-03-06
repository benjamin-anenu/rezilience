import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Code2, RefreshCw, Copy, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function IDLExplorer() {
  const [programId, setProgramId] = useState('');
  const [queryId, setQueryId] = useState('');

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['idl-explorer', queryId],
    queryFn: async () => {
      if (!queryId) return null;
      const { data, error } = await supabase.functions.invoke('fetch-idl', {
        body: { programId: queryId },
      });
      if (error) throw error;
      return data as { idl: any; source: string; programId: string } | { error: string };
    },
    enabled: !!queryId,
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = programId.trim();
    if (trimmed.length >= 32) setQueryId(trimmed);
  };

  const idl = data && !('error' in data) ? data.idl : null;
  const fetchError = data && 'error' in data ? data.error : error?.message;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">IDL Explorer</h2>
        <span className="font-mono text-xs text-muted-foreground">Decode any Solana program</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          placeholder="Paste a Solana program ID (e.g. JUP6L...)"
          className="font-mono text-sm flex-1"
        />
        <Button type="submit" disabled={programId.trim().length < 32 || isFetching} className="gap-2 font-display uppercase tracking-wider">
          {isFetching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Decode
        </Button>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-display text-sm font-semibold text-foreground">IDL not found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {fetchError}. The program may not have a published Anchor IDL, or the address may be invalid.
            </p>
          </div>
        </div>
      )}

      {/* IDL Result */}
      {idl && (
        <div className="space-y-4">
          {/* Program info */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/20 text-primary font-mono text-xs">
              {data && !('error' in data) ? data.source : 'anchor'}
            </Badge>
            {idl.name && (
              <span className="font-display text-sm font-semibold text-foreground">{idl.name}</span>
            )}
            {idl.version && (
              <span className="font-mono text-xs text-muted-foreground">v{idl.version}</span>
            )}
          </div>

          {/* Instructions */}
          {idl.instructions && idl.instructions.length > 0 && (
            <IDLSection title="Instructions" count={idl.instructions.length}>
              {idl.instructions.map((ix: any, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                  <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-mono text-sm text-foreground">{ix.name}</span>
                    {ix.args && ix.args.length > 0 && (
                      <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                        ({ix.args.map((a: any) => `${a.name}: ${typeof a.type === 'string' ? a.type : JSON.stringify(a.type)}`).join(', ')})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </IDLSection>
          )}

          {/* Accounts */}
          {idl.accounts && idl.accounts.length > 0 && (
            <IDLSection title="Accounts" count={idl.accounts.length}>
              {idl.accounts.map((acc: any, i: number) => (
                <div key={i} className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
                  <span className="font-mono text-sm text-foreground">{acc.name}</span>
                  {acc.type?.fields && (
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      {acc.type.fields.length} field{acc.type.fields.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </IDLSection>
          )}

          {/* Raw JSON */}
          <RawIDLBlock idl={idl} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !idl && !fetchError && !queryId && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 p-12 text-center">
          <Code2 className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="font-display text-lg font-semibold text-foreground">Decode any program</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Paste a Solana program ID to fetch its Anchor IDL — view instructions, accounts, and types.
          </p>
        </div>
      )}
    </div>
  );
}

function IDLSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-2 group"
      >
        <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
        <span className="font-display text-sm font-semibold text-foreground">{title}</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{count}</Badge>
      </button>
      {expanded && <div className="space-y-1.5 pl-5">{children}</div>}
    </div>
  );
}

function RawIDLBlock({ idl }: { idl: any }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(idl, null, 2);

  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', show && 'rotate-90')} />
        Raw JSON
      </button>
      {show && (
        <div className="relative mt-2">
          <button
            onClick={() => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
          <pre className="rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto text-xs font-mono text-foreground max-h-[400px]">
            {json}
          </pre>
        </div>
      )}
    </div>
  );
}
