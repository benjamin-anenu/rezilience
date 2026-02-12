import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './CodeBlock';
import { AskGptModal, AskGptButton } from './AskGptModal';
import { CheckCircle2, ChevronDown, BookOpen, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DictionaryEntry as DictEntry } from '@/data/dictionary';

interface DictionaryEntryProps {
  entry: DictEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const categoryColors: Record<string, string> = {
  Transactions: 'border-primary/40 bg-primary/10 text-primary',
  Accounts: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  Programs: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  Consensus: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  Tokens: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  Security: 'border-red-500/40 bg-red-500/10 text-red-400',
  Infrastructure: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
};

export function DictionaryEntryCard({ entry, isExpanded, onToggle }: DictionaryEntryProps) {
  const catColor = categoryColors[entry.category] ?? 'border-primary/40 bg-primary/10 text-primary';
  const [gptOpen, setGptOpen] = useState(false);

  return (
    <div className="relative flex gap-4 px-4 sm:px-6" id={`term-${entry.id}`}>
      {/* Timeline dot + connector */}
      <div className="flex flex-col items-center shrink-0 w-5 pt-5">
        <button
          onClick={onToggle}
          className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300 ${
            isExpanded
              ? 'border-primary bg-primary shadow-[0_0_10px_rgba(0,194,182,0.4)]'
              : 'border-primary/30 bg-background hover:border-primary hover:shadow-[0_0_6px_rgba(0,194,182,0.2)]'
          }`}
        >
          <div className={`h-1.5 w-1.5 rounded-full ${isExpanded ? 'bg-primary-foreground' : 'bg-primary/50'}`} />
        </button>
        <div className="w-px flex-1 border-l border-dashed border-primary/15" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <button
          onClick={onToggle}
          className={`group w-full text-left rounded-sm border p-4 transition-all duration-300 ${
            isExpanded
              ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(0,194,182,0.06)]'
              : 'border-border/50 bg-background hover:border-primary/30 hover:bg-primary/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {entry.abbreviation && (
                <span className="font-mono text-xs font-bold text-primary shrink-0">{entry.abbreviation}</span>
              )}
              <h3 className="font-display text-sm font-bold text-foreground truncate">{entry.term}</h3>
              <Badge variant="outline" className={`shrink-0 rounded-sm px-1.5 py-0 text-[9px] font-mono tracking-wider ${catColor}`}>
                {entry.category}
              </Badge>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">{entry.definition}</p>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-px border border-t-0 border-primary/20 rounded-b-sm bg-background p-5 pl-6 relative space-y-5">
                {/* Teal accent bar */}
                <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-primary/60 to-primary/10 rounded-full" />

                {/* Definition */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1.5">Definition</h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{entry.definition}</p>
                </div>

                {/* When to Use */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1.5">When to Use</h4>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.whenToUse}</p>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1.5">Example</h4>
                  <CodeBlock code={entry.example} language="typescript" />
                </div>

                {/* Related Terms */}
                {entry.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Related</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.relatedTerms.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-mono text-primary"
                        >
                          <Link2 className="h-2.5 w-2.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ask GPT */}
                <AskGptButton onClick={(e) => { e.stopPropagation(); setGptOpen(true); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AskGptModal
        open={gptOpen}
        onOpenChange={setGptOpen}
        topic={entry.term}
        context={`${entry.abbreviation ? `(${entry.abbreviation}) ` : ''}Definition: ${entry.definition}. When to use: ${entry.whenToUse}`}
      />
    </div>
  );
}
