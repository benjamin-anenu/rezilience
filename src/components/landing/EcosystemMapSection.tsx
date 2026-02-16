import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useRegistryGeoData, CountryStats } from '@/hooks/useRegistryGeoData';
import { Button } from '@/components/ui/button';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → alpha-2 mapping for countries we care about
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF','008': 'AL','012': 'DZ','020': 'AD','024': 'AO','028': 'AG','032': 'AR','036': 'AU',
  '040': 'AT','031': 'AZ','044': 'BS','048': 'BH','050': 'BD','051': 'AM','052': 'BB','056': 'BE',
  '060': 'BM','064': 'BT','068': 'BO','070': 'BA','072': 'BW','076': 'BR','084': 'BZ','090': 'SB',
  '096': 'BN','100': 'BG','104': 'MM','108': 'BI','116': 'KH','120': 'CM','124': 'CA','132': 'CV',
  '140': 'CF','144': 'LK','148': 'TD','152': 'CL','156': 'CN','170': 'CO','174': 'KM','178': 'CG',
  '180': 'CD','188': 'CR','191': 'HR','192': 'CU','196': 'CY','203': 'CZ','208': 'DK','262': 'DJ',
  '212': 'DM','214': 'DO','218': 'EC','818': 'EG','222': 'SV','226': 'GQ','232': 'ER','233': 'EE',
  '231': 'ET','242': 'FJ','246': 'FI','250': 'FR','266': 'GA','270': 'GM','268': 'GE','276': 'DE',
  '288': 'GH','300': 'GR','308': 'GD','320': 'GT','324': 'GN','328': 'GY','332': 'HT','340': 'HN',
  '344': 'HK','348': 'HU','352': 'IS','356': 'IN','360': 'ID','364': 'IR','368': 'IQ','372': 'IE',
  '376': 'IL','380': 'IT','388': 'JM','392': 'JP','400': 'JO','398': 'KZ','404': 'KE','408': 'KP',
  '410': 'KR','414': 'KW','417': 'KG','418': 'LA','428': 'LV','422': 'LB','426': 'LS','430': 'LR',
  '434': 'LY','438': 'LI','440': 'LT','442': 'LU','450': 'MG','454': 'MW','458': 'MY','462': 'MV',
  '466': 'ML','470': 'MT','478': 'MR','480': 'MU','484': 'MX','498': 'MD','496': 'MN','499': 'ME',
  '504': 'MA','508': 'MZ','516': 'NA','524': 'NP','528': 'NL','540': 'NC','554': 'NZ','558': 'NI',
  '562': 'NE','566': 'NG','578': 'NO','512': 'OM','586': 'PK','591': 'PA','598': 'PG','600': 'PY',
  '604': 'PE','608': 'PH','616': 'PL','620': 'PT','634': 'QA','642': 'RO','643': 'RU','646': 'RW',
  '662': 'LC','670': 'VC','682': 'SA','686': 'SN','688': 'RS','694': 'SL','702': 'SG','703': 'SK',
  '705': 'SI','706': 'SO','710': 'ZA','724': 'ES','736': 'SD','740': 'SR','748': 'SZ','752': 'SE',
  '756': 'CH','760': 'SY','158': 'TW','762': 'TJ','834': 'TZ','764': 'TH','768': 'TG','780': 'TT',
  '788': 'TN','792': 'TR','795': 'TM','800': 'UG','804': 'UA','784': 'AE','826': 'GB','840': 'US',
  '858': 'UY','860': 'UZ','862': 'VE','704': 'VN','887': 'YE','894': 'ZM','716': 'ZW',
  '-99': 'XK', // Kosovo
};

function getFillColor(stats: CountryStats | undefined, isHovered: boolean): string {
  if (!stats) return isHovered ? 'hsl(214, 18%, 20%)' : 'hsl(214, 18%, 14%)';
  const count = stats.projectCount;
  if (isHovered) return 'hsl(173, 85%, 45%)';
  if (count >= 15) return 'hsl(173, 80%, 40%)';
  if (count >= 5) return 'hsl(173, 70%, 35%)';
  if (count >= 3) return 'hsl(173, 60%, 30%)';
  return 'hsl(173, 50%, 25%)';
}

export function EcosystemMapSection() {
  const { countryStats, summary, isLoading } = useRegistryGeoData();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; stats: CountryStats } | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  });

  const handleZoomIn = useCallback(() => {
    setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  }, []);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

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
          className="relative w-full rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden"
        >
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {[
              { icon: ZoomIn, action: handleZoomIn, label: 'Zoom in' },
              { icon: ZoomOut, action: handleZoomOut, label: 'Zoom out' },
              { icon: RotateCcw, action: handleReset, label: 'Reset' },
            ].map(({ icon: Icon, action, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={action}
                className="w-8 h-8 rounded-md bg-card/80 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 147, center: [0, 20] }}
            width={800}
            height={450}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup
              center={position.coordinates}
              zoom={position.zoom}
              onMoveEnd={handleMoveEnd}
              minZoom={1}
              maxZoom={8}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const numericCode = geo.id;
                    const alpha2 = NUMERIC_TO_ALPHA2[numericCode];
                    const stats = alpha2 ? countryStats.get(alpha2) : undefined;
                    const countryName = geo.properties?.name ?? numericCode;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getFillColor(stats, false)}
                        stroke="hsl(var(--border))"
                        strokeWidth={0.4}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.2s' },
                          hover: {
                            fill: getFillColor(stats, true),
                            outline: 'none',
                            cursor: stats ? 'pointer' : 'default',
                          },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={(e) => {
                          if (!stats) return;
                          const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                          if (!rect) return;
                          setTooltip({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 10,
                            name: countryName,
                            stats,
                          });
                        }}
                        onMouseMove={(e) => {
                          if (!tooltip) return;
                          const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                          if (!rect) return;
                          setTooltip(prev => prev ? {
                            ...prev,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 10,
                          } : null);
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

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
                <p className="font-semibold text-sm mb-1">{tooltip.name}</p>
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
