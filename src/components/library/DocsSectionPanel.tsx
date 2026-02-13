import { ExternalLink, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SolanaService, DocSection } from '@/data/solana-docs';

interface DocsSectionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: SolanaService;
  activeSection: DocSection;
  onSectionChange: (section: DocSection) => void;
  onAskGpt: (topic: string, context: string) => void;
}

export function DocsSectionPanel({
  open,
  onOpenChange,
  service,
  activeSection,
  onSectionChange,
  onAskGpt,
}: DocsSectionPanelProps) {
  const handleAskGpt = () => {
    onAskGpt(
      `${activeSection.title} — ${service.name}`,
      `You are a Solana documentation assistant specializing in ${service.name}. Help the user understand "${activeSection.title}": ${activeSection.description}. Reference the official docs at ${activeSection.url}.`
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!max-w-none w-[90vw] sm:w-[80vw] lg:w-[75vw] flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={service.logoUrl}
                alt={`${service.name} logo`}
                className="h-7 w-7 shrink-0 rounded-sm object-contain bg-background border border-border p-0.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="min-w-0">
                <SheetTitle className="font-display text-base font-bold text-foreground truncate">
                  {activeSection.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground truncate">
                  {service.name} Documentation
                </SheetDescription>
              </div>
            </div>

            <a
              href={activeSection.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/5 px-3 py-1.5 font-mono text-[11px] text-primary transition-colors hover:bg-primary/10"
            >
              View Full Docs <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </SheetHeader>

        {/* Body: TOC + Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* TOC Sidebar */}
          <div className="w-[200px] shrink-0 border-r border-border bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-3">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Sections
                </p>
                <nav className="space-y-1">
                  {service.sections.map((sec) => (
                    <button
                      key={sec.title}
                      onClick={() => onSectionChange(sec)}
                      className={cn(
                        'w-full text-left rounded-sm px-2.5 py-2 text-xs transition-all duration-150',
                        sec.title === activeSection.title
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      {sec.title}
                    </button>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </div>

          {/* Markdown Content Area */}
          <div className="flex-1 min-w-0 bg-background">
            <ScrollArea className="h-full">
              <div className="px-8 py-6 max-w-3xl">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-xs prose-pre:bg-background prose-pre:border prose-pre:border-border prose-a:text-primary prose-th:text-foreground/80 prose-td:text-foreground/70 prose-table:text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeSection.content}
                  </ReactMarkdown>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-5 py-3">
          <button
            onClick={handleAskGpt}
            className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-[#7B3FCC]/80 to-[#10C77E]/80 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask GPT about "{activeSection.title}"
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
