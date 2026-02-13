import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { solanaServices } from '@/data/solana-docs';

interface DocsSearchBarProps {
  onAskGpt: (query: string) => void;
}

export function DocsSearchBar({ onAskGpt }: DocsSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const serviceList = solanaServices.map(s => `${s.name} (${s.sections.map(sec => sec.title).join(', ')})`).join('; ');
    const prompt = `I'm looking for Solana documentation about: "${query.trim()}".

Here are the services in our index: ${serviceList}.

Based on this query, suggest which services and specific API sections are most relevant. Include the direct documentation URLs. If none match perfectly, suggest official documentation URLs from the broader Solana ecosystem that would help, and add a disclaimer: "These are AI suggestions — always verify against official documentation."`;

    onAskGpt(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What are you building? e.g. 'swap tokens' or 'verify NFT ownership'..."
        className="w-full h-14 rounded-sm border border-border bg-card pl-12 pr-28 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-sm bg-gradient-to-r from-[#7B3FCC] to-[#10C77E] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white/90 shadow-[0_0_12px_rgba(123,63,204,0.2)] transition-all hover:shadow-[0_0_18px_rgba(123,63,204,0.35)] hover:brightness-105 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask GPT
      </button>
    </form>
  );
}
