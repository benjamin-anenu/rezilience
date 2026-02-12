import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { experienceTiers } from '@/data/learning-paths';
import { ExperienceSelector } from '@/components/library/ExperienceSelector';
import { ArrowLeft, Clock, ExternalLink, ChevronRight, ChevronDown, CheckCircle2, BookOpen, Wrench, Rocket, Compass, Hammer, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExperienceLevel, ModuleDifficulty } from '@/data/learning-paths';

const difficultyConfig: Record<ModuleDifficulty, { label: string; className: string; icon: typeof BookOpen }> = {
  concept: { label: 'CONCEPT', className: 'border-primary/40 bg-primary/10 text-primary', icon: BookOpen },
  'hands-on': { label: 'HANDS-ON', className: 'border-amber-500/40 bg-amber-500/10 text-amber-400', icon: Wrench },
  project: { label: 'PROJECT', className: 'border-violet-500/40 bg-violet-500/10 text-violet-400', icon: Rocket },
};

const tierIcons: Record<string, typeof Compass> = { Compass, Hammer, Building2 };

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export default function LibraryLearn() {
  const { level } = useParams<{ level?: string }>();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const tier = level ? experienceTiers.find((t) => t.id === level) : null;

  if (!tier) {
    return (
      <Layout>
        <section className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3 w-3" /> Back to Library
            </Link>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">GUIDED LEARNING</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Where are you on your Solana journey?
            </h1>
            <p className="mt-2 text-muted-foreground">Choose your experience level to see tailored learning modules.</p>
          </div>
          <ExperienceSelector />
        </section>
      </Layout>
    );
  }

  const toggle = (id: string) => setExpandedModule((prev) => (prev === id ? null : id));

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/library" className="hover:text-primary">Library</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/library/learn" className="hover:text-primary">Learn</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{tier.label}</span>
          </div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">{tier.experience}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {tier.label} Path
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">{tier.description}</p>
        </div>

        {/* Timeline Curriculum */}
        <div className="relative">
          {tier.modules.map((mod, i) => {
            const isExpanded = expandedModule === mod.id;
            const isLast = i === tier.modules.length - 1;
            const diff = difficultyConfig[mod.difficulty];
            const DiffIcon = diff.icon;

            return (
              <div key={mod.id} className="relative flex gap-5" id={`module-${mod.id}`}>
                {/* Timeline Column */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  {/* Node */}
                  <button
                    onClick={() => toggle(mod.id)}
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-all duration-300 ${
                      isExpanded
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,194,182,0.4)]'
                        : 'border-primary/30 bg-background text-primary hover:border-primary hover:shadow-[0_0_8px_rgba(0,194,182,0.2)]'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                  {/* Connector Line */}
                  {!isLast && (
                    <div className="w-px flex-1 border-l border-dashed border-primary/20" />
                  )}
                </div>

                {/* Content Column */}
                <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
                  {/* Summary Row */}
                  <button
                    onClick={() => toggle(mod.id)}
                    className={`group w-full text-left rounded-sm border p-4 transition-all duration-300 ${
                      isExpanded
                        ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(0,194,182,0.06)]'
                        : 'border-border/50 bg-background hover:border-primary/30 hover:bg-primary/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h3 className="font-display text-sm font-bold text-foreground truncate">{mod.title}</h3>
                        <Badge variant="outline" className={`shrink-0 rounded-sm px-1.5 py-0 text-[9px] font-mono tracking-wider ${diff.className}`}>
                          <DiffIcon className="mr-1 h-2.5 w-2.5" />
                          {diff.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden sm:flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
                          <Clock className="h-3 w-3" />
                          {mod.estimatedTime}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-px border border-t-0 border-primary/20 rounded-b-sm bg-background p-5 pl-6 relative">
                          {/* Teal accent bar */}
                          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-primary/60 to-primary/10 rounded-full" />

                          {/* Time on mobile */}
                          <span className="sm:hidden flex items-center gap-1 text-muted-foreground font-mono text-[11px] mb-3">
                            <Clock className="h-3 w-3" />
                            {mod.estimatedTime}
                          </span>

                          {/* Description */}
                          <p className="text-sm leading-relaxed text-muted-foreground mb-5">{mod.description}</p>

                          {/* What You'll Learn */}
                          <div className="mb-5">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2.5">What You'll Learn</h4>
                            <div className="grid gap-1.5 sm:grid-cols-2">
                              {mod.topics.map((topic) => (
                                <div key={topic} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                                  <span className="text-xs text-foreground/80">{topic}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Resources */}
                          <div className="mb-4">
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2.5">Resources</h4>
                            <div className="space-y-1">
                              {mod.resources.map((r) => (
                                <a
                                  key={r.url}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-3 rounded-sm border border-border/40 bg-muted/20 px-3 py-2 text-xs transition-colors hover:border-primary/30 hover:bg-primary/[0.03] group/link"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="text-foreground/90 truncate">{r.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">{extractDomain(r.url)}</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/link:text-primary transition-colors" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>

                          {/* Prerequisites */}
                          {mod.prerequisites && mod.prerequisites.length > 0 && (
                            <div>
                              <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Prerequisites</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {mod.prerequisites.map((preReqId) => {
                                  const preReqModule = tier.modules.find((m) => m.id === preReqId);
                                  return (
                                    <button
                                      key={preReqId}
                                      onClick={() => {
                                        setExpandedModule(preReqId);
                                        document.getElementById(`module-${preReqId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-mono text-primary hover:border-primary/40 transition-colors"
                                    >
                                      {preReqModule?.title ?? preReqId}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other Paths */}
        <div className="mt-16">
          <h2 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-primary">Other Paths</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {experienceTiers
              .filter((t) => t.id !== tier.id)
              .map((t) => {
                const TierIcon = tierIcons[t.icon] ?? Compass;
                return (
                  <Link
                    key={t.id}
                    to={`/library/learn/${t.id}`}
                    className="group flex items-center gap-4 rounded-sm border border-border/40 bg-background/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(0,194,182,0.06)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary/20 bg-primary/5 shrink-0">
                      <TierIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">{t.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.experience} · {t.modules.length} modules</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1 truncate">{t.tagline}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
