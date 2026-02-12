import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { experienceTiers } from '@/data/learning-paths';
import { ExperienceSelector } from '@/components/library/ExperienceSelector';
import { ArrowLeft, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ExperienceLevel } from '@/data/learning-paths';

export default function LibraryLearn() {
  const { level } = useParams<{ level?: string }>();

  const tier = level ? experienceTiers.find((t) => t.id === level) : null;

  // If no level selected, show selector
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

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/library" className="hover:text-primary">Library</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/library/learn" className="hover:text-primary">Learn</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{tier.label}</span>
          </div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">{tier.experience}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            {tier.label} Path
          </h1>
          <p className="mt-2 text-muted-foreground">{tier.description}</p>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          {tier.modules.map((mod, i) => (
            <div
              key={mod.id}
              className="animate-card-enter rounded-sm border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 font-mono text-xs font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-lg font-bold text-foreground">{mod.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{mod.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{mod.estimatedTime}</span>
                </div>
              </div>

              {/* Topics */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {mod.topics.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>

              {/* Resources */}
              <div className="mt-4 flex flex-wrap gap-3">
                {mod.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {r.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>

              {mod.prerequisites && mod.prerequisites.length > 0 && (
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Prereq: {mod.prerequisites.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Other levels */}
        <div className="mt-12">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Other Paths</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {experienceTiers
              .filter((t) => t.id !== tier.id)
              .map((t) => (
                <Link
                  key={t.id}
                  to={`/library/learn/${t.id}`}
                  className="flex items-center gap-4 rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground">{t.label}</h3>
                    <p className="text-xs text-muted-foreground">{t.experience} · {t.modules.length} modules</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
