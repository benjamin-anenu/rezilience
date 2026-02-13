import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocsSectionPanel } from '@/components/library/DocsSectionPanel';
import type { SolanaService, DocSection } from '@/data/solana-docs';

interface DocsServiceSectionProps {
  service: SolanaService;
  index: number;
  onAskGpt: (topic: string, context: string) => void;
}

export function DocsServiceSection({ service, index, onAskGpt }: DocsServiceSectionProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DocSection>(service.sections[0]);

  const openPanel = (sec: DocSection) => {
    setActiveSection(sec);
    setPanelOpen(true);
  };

  return (
    <section id={service.slug} className="scroll-mt-24">
      {/* Service Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={service.logoUrl}
            alt={`${service.name} logo`}
            className="h-8 w-8 rounded-sm object-contain bg-background border border-border p-1"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{service.name}</h2>
            <Badge variant="secondary" className="mt-1 text-[10px]">{service.category}</Badge>
          </div>
        </div>
        <a
          href={service.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/5 px-3 py-1.5 font-mono text-[11px] text-primary transition-colors hover:bg-primary/10"
        >
          Official Docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Description */}
      <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{service.description}</p>

      {/* API Section Cards — now buttons that open the panel */}
      <div className="grid gap-3 sm:grid-cols-2">
        {service.sections.map((sec, i) => (
          <button
            key={sec.title}
            onClick={() => openPanel(sec)}
            className="group text-left rounded-sm border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:shadow-[0_0_12px_rgba(0,194,182,0.08)]"
            style={{ animationDelay: `${(index * 5 + i) * 30}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {sec.title}
              </h3>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{sec.description}</p>
          </button>
        ))}
      </div>

      {/* Slide-out Panel */}
      <DocsSectionPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        service={service}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onAskGpt={onAskGpt}
      />
    </section>
  );
}
