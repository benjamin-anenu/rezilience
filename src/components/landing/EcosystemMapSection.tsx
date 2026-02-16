import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegistryGeoData, CountryStats } from '@/hooks/useRegistryGeoData';
import { WORLD_COUNTRIES } from '@/components/admin/world-map-paths';
import { Button } from '@/components/ui/button';

const VIEW_BOX = '0 0 800 420';

function getFillColor(stats: CountryStats | undefined): string {
  if (!stats) return 'hsl(214, 18%, 14%)';
  const count = stats.projectCount;
  if (count >= 15) return 'hsl(173, 80%, 40%)';
  if (count >= 5) return 'hsl(173, 70%, 35%)';
  if (count >= 3) return 'hsl(173, 60%, 30%)';
  return 'hsl(173, 50%, 25%)';
}

function getGlowOpacity(count: number): number {
  if (count >= 15) return 1;
  if (count >= 5) return 0.8;
  return 0.6;
}

const COUNTRY_NAMES: Record<string, string> = {};
WORLD_COUNTRIES.forEach((c) => { COUNTRY_NAMES[c.id] = c.name; });

export function EcosystemMapSection() {
  const { countryStats, summary, isLoading } = useRegistryGeoData();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; code: string; stats: CountryStats } | null>(null);

  const countriesWithData = useMemo(() => {
    const set = new Set<string>();
    countryStats.forEach((_, code) => set.add(code));
    return set;
  }, [countryStats]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<SVGPathElement>, code: string) => {
    const stats = countryStats.get(code);
    if (!stats) return;
    const svg = (e.target as SVGPathElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      code,
      stats,
    });
  }, [countryStats]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    if (!tooltip) return;
    const svg = (e.target as SVGPathElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip(prev => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top - 10 } : null);
  }, [tooltip]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium tracking-wider text-primary uppercase">Live Registry</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Building Across the Globe
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real-time distribution of projects monitored by the Rezilience Registry.
          </p>
        </motion.div>

        {/* Summary Stats */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-8 md:gap-16 mb-10 text-center"
          >
            <div>
              <p className="text-2xl font-bold text-foreground">{summary.totalCountries}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Countries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summary.totalProjects}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Projects</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{summary.mostActiveRegion}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Most Active</p>
            </div>
          </motion.div>
        )}

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 md:p-6"
        >
          <svg viewBox={VIEW_BOX} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Countries */}
            {WORLD_COUNTRIES.map((country) => {
              const stats = countryStats.get(country.id);
              return (
                <path
                  key={country.id}
                  d={country.d}
                  fill={getFillColor(stats)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.3}
                  className="transition-colors duration-200"
                  style={{ cursor: stats ? 'pointer' : 'default' }}
                  onMouseEnter={(e) => handleMouseEnter(e, country.id)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}

            {/* Pulsing dots */}
            {WORLD_COUNTRIES.filter((c) => countriesWithData.has(c.id)).map((country) => {
              const stats = countryStats.get(country.id)!;
              const opacity = getGlowOpacity(stats.projectCount);
              return (
                <g key={`dot-${country.id}`}>
                  <circle cx={country.cx} cy={country.cy} r={3} fill="hsl(173, 80%, 40%)" opacity={opacity}>
                    <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values={`${opacity};${opacity * 0.3};${opacity}`} dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={country.cx} cy={country.cy} r={1.5} fill="hsl(173, 80%, 60%)" />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg text-xs"
                style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
              >
                <p className="font-semibold text-sm mb-1">{COUNTRY_NAMES[tooltip.code] ?? tooltip.code}</p>
                <p className="text-muted-foreground">{tooltip.stats.projectCount} project{tooltip.stats.projectCount !== 1 ? 's' : ''}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-green-400">● {tooltip.stats.activeCount} Active</span>
                  <span className="text-amber-400">● {tooltip.stats.staleCount} Stale</span>
                  <span className="text-red-400">● {tooltip.stats.decayingCount} Decay</span>
                </div>
                {tooltip.stats.topCategories.length > 0 && (
                  <p className="mt-1 text-muted-foreground truncate max-w-[200px]">
                    {tooltip.stats.topCategories.slice(0, 3).join(', ')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(173, 50%, 25%)' }} /> 1-2</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(173, 60%, 30%)' }} /> 3-4</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(173, 70%, 35%)' }} /> 5-14</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(173, 80%, 40%)' }} /> 15+</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link to="/explorer">
            <Button variant="outline" className="gap-2">
              View Full Registry <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
