import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './CodeBlock';
import type { DictionaryEntry as DictEntry } from '@/data/dictionary';

interface DictionaryEntryProps {
  entry: DictEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DictionaryEntryCard({ entry, isExpanded, onToggle }: DictionaryEntryProps) {
  return (
    <div
      className="group border-b border-border transition-colors last:border-b-0 hover:bg-card/50"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-4 py-4 text-left sm:px-6"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm font-bold text-foreground">
              {entry.abbreviation ? `${entry.abbreviation} — ${entry.term}` : entry.term}
            </h3>
            <Badge variant="secondary" className="text-[10px]">
              {entry.category}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entry.definition}</p>
        </div>
        <span className="mt-1 shrink-0 font-mono text-xs text-muted-foreground transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-4 px-4 pb-6 sm:px-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Definition</p>
            <p className="mt-1 text-sm text-foreground">{entry.definition}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">When to Use</p>
            <p className="mt-1 text-sm text-muted-foreground">{entry.whenToUse}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Example</p>
            <CodeBlock code={entry.example} language="typescript" />
          </div>
          {entry.relatedTerms.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Related</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {entry.relatedTerms.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
