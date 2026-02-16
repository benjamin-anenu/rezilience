import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { useRegistryGeoData, CountryStats } from '@/hooks/useRegistryGeoData';
import { Button } from '@/components/ui/button';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric → alpha-2 mapping
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
  '-99': 'XK',
};

// Country centroids [lon, lat] for pulsing markers
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [-98, 39], CA: [-106, 56], MX: [-102, 23], BR: [-53, -10], AR: [-64, -34],
  GB: [-2, 54], FR: [2, 46], DE: [10, 51], ES: [-4, 40], IT: [12, 42],
  PT: [-8, 39], NL: [5, 52], BE: [4, 51], CH: [8, 47], AT: [14, 47],
  SE: [15, 62], NO: [8, 62], FI: [26, 64], DK: [10, 56], PL: [20, 52],
  CZ: [15, 50], RO: [25, 46], BG: [25, 43], GR: [22, 39], TR: [35, 39],
  RU: [100, 60], UA: [32, 49], IE: [-8, 53], IS: [-19, 65],
  IN: [79, 22], CN: [104, 35], JP: [138, 36], KR: [128, 36], TW: [121, 24],
  SG: [104, 1], MY: [102, 4], ID: [120, -2], TH: [101, 15], VN: [108, 16],
  PH: [122, 12], BD: [90, 24], PK: [70, 30], LK: [81, 7],
  AU: [134, -25], NZ: [174, -41],
  ZA: [25, -29], NG: [8, 10], KE: [38, 0], EG: [30, 27], MA: [-7, 32],
  GH: [-2, 8], ET: [39, 9], TZ: [35, -6], CM: [12, 6],
  AE: [54, 24], SA: [45, 24], IL: [35, 31], JO: [36, 31], QA: [51, 25],
  KW: [48, 29], BH: [51, 26],
  CO: [-74, 4], CL: [-71, -35], PE: [-76, -10], EC: [-78, -2],
  VE: [-66, 8], UY: [-56, -33], PY: [-58, -23], BO: [-64, -17],
  CR: [-84, 10], PA: [-80, 9], GT: [-90, 15], DO: [-70, 19],
  HK: [114, 22], KZ: [67, 48], GE: [44, 42], AM: [45, 40], AZ: [50, 41],
  EE: [26, 59], LV: [25, 57], LT: [24, 56], HR: [16, 45], RS: [21, 44],
  BA: [18, 44], ME: [19, 43], SK: [20, 49], SI: [15, 46], HU: [20, 47],
  LU: [6, 50], MT: [14, 36], CY: [33, 35],
};

function getFillColor(stats: CountryStats | undefined, isHovered: boolean): string {
  if (!stats) return isHovered ? 'hsl(216, 20%, 13%)' : 'hsl(216, 20%, 9%)';
  const count = stats.projectCount;
  if (isHovered) return 'hsl(174, 90%, 40%)';
  if (count >= 15) return 'hsl(174, 80%, 32%)';
  if (count >= 5) return 'hsl(174, 65%, 26%)';
  if (count >= 3) return 'hsl(174, 55%, 22%)';
  return 'hsl(174, 45%, 18%)';
}

function getPulseRadius(count: number): number {
  if (count >= 15) return 6;
  if (count >= 5) return 4.5;
  if (count >= 3) return 3.5;
  return 2.5;
}

export function EcosystemMapSection() {
  const { countryStats, summary, isLoading } = useRegistryGeoData();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; stats: CountryStats } | null>(null);

  const markers = useMemo(() => {
    const result: { code: string; coordinates: [number, number]; stats: CountryStats }[] = [];
    countryStats.forEach((stats, code) => {
      const coords = COUNTRY_CENTROIDS[code];
      if (coords) {
        result.push({ code, coordinates: coords, stats });
      }
    });
    return result;
  }, [countryStats]);

  const statItems = [
    { value: summary.totalCountries, label: 'Countries' },
    { value: summary.totalProjects, label: 'Projects Monitored' },
    { value: summary.mostActiveRegion, label: 'Most Active Region' },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Ambient glow behind map */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, hsl(174 100% 38% / 0.04) 0%, transparent 70%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
            <Activity className="w-3.5 h-3.5 text-primary pulse-subtle" />
            <span className="text-[11px] font-medium tracking-[0.15em] text-primary uppercase font-code">
              Live Registry
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display tracking-tight">
            Building Across the Globe
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Real-time distribution of protocols monitored by the Rezilience Registry — 
            live on-chain signals from every continent.
          </p>
        </motion.div>

        {/* Summary Stats */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center gap-0 mb-12 max-w-lg mx-auto"
          >
            {statItems.map((item, i) => (
              <div
                key={item.label}
                className={`flex-1 text-center py-3 px-4 ${
                  i < statItems.length - 1
                    ? 'border-r border-border/40'
                    : ''
                }`}
              >
                <p className="text-xl md:text-2xl font-bold text-foreground font-display">
                  {item.value}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] mt-1 font-code">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="relative w-full rounded-sm border border-border/30 bg-card/10 backdrop-blur-sm overflow-hidden"
          style={{
            boxShadow: '0 0 60px hsl(174 100% 38% / 0.03), inset 0 1px 0 hsl(174 100% 38% / 0.05)',
          }}
        >
          {/* Top edge accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 160, center: [0, 10] }}
            width={900}
            height={440}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* Defs for pulse animation */}
            <defs>
              <radialGradient id="pulseGlow">
                <stop offset="0%" stopColor="hsl(174, 100%, 45%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(174, 100%, 38%)" stopOpacity="0" />
              </radialGradient>
            </defs>

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
                      stroke="hsl(216, 20%, 14%)"
                      strokeWidth={0.3}
                      style={{
                        default: { outline: 'none', transition: 'fill 0.25s ease' },
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
                        setTooltip((prev) =>
                          prev ? {
                            ...prev,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top - 10,
                          } : null
                        );
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Pulsing markers on active countries */}
            {markers.map(({ code, coordinates, stats }) => {
              const r = getPulseRadius(stats.projectCount);
              return (
                <Marker key={code} coordinates={coordinates}>
                  {/* Outer pulse ring */}
                  <circle
                    r={r * 2.5}
                    fill="url(#pulseGlow)"
                    opacity={0.4}
                  >
                    <animate
                      attributeName="r"
                      from={String(r * 1.5)}
                      to={String(r * 3)}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Inner solid dot */}
                  <circle
                    r={r}
                    fill="hsl(174, 100%, 45%)"
                    stroke="hsl(174, 100%, 60%)"
                    strokeWidth={0.5}
                    opacity={0.9}
                  />
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute pointer-events-none z-20 px-4 py-3 rounded-sm border border-primary/20 bg-popover/95 backdrop-blur-md text-popover-foreground shadow-xl"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: 'translate(-50%, -100%)',
                  boxShadow: '0 8px 32px hsl(216 20% 7% / 0.6), 0 0 20px hsl(174 100% 38% / 0.08)',
                }}
              >
                <p className="font-semibold text-sm mb-1.5 font-display text-foreground">{tooltip.name}</p>
                <p className="text-muted-foreground text-xs font-code">
                  {tooltip.stats.projectCount} project{tooltip.stats.projectCount !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-3 mt-2 text-[10px] font-code">
                  <span style={{ color: 'hsl(174, 100%, 45%)' }}>● {tooltip.stats.activeCount} Active</span>
                  <span style={{ color: 'hsl(45, 90%, 55%)' }}>● {tooltip.stats.staleCount} Stale</span>
                  <span style={{ color: 'hsl(24, 100%, 50%)' }}>● {tooltip.stats.decayingCount} Decay</span>
                </div>
                {tooltip.stats.topCategories.length > 0 && (
                  <p className="mt-1.5 text-muted-foreground text-[10px] truncate max-w-[200px] font-code">
                    {tooltip.stats.topCategories.slice(0, 3).join(' · ')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-2 px-3 py-1.5 rounded-sm bg-background/60 backdrop-blur-sm border border-border/20 text-[9px] text-muted-foreground font-code tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(174, 45%, 18%)' }} /> 1–2
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(174, 55%, 22%)' }} /> 3–4
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(174, 65%, 26%)' }} /> 5–14
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(174, 80%, 32%)' }} /> 15+
            </span>
          </div>

          {/* Bottom edge accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-10"
        >
          <Link to="/explorer">
            <Button
              variant="outline"
              className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 font-display text-sm"
            >
              Explore the Registry <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
