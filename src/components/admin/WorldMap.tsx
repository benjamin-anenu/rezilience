import { useState, useMemo } from 'react';
import { WORLD_COUNTRIES, COUNTRY_NAME_TO_ISO, type CountryPath } from './world-map-paths';

interface GeoEntry {
  country: string;
  count: number;
}

interface WorldMapProps {
  data: GeoEntry[];
}

export function WorldMap({ data }: WorldMapProps) {
  const [hovered, setHovered] = useState<{ entry: GeoEntry; path: CountryPath } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const totalEvents = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  // Build ISO → count lookup
  const isoCountMap = useMemo(() => {
    const map: Record<string, { count: number; entry: GeoEntry }> = {};
    data.forEach(entry => {
      const iso = COUNTRY_NAME_TO_ISO[entry.country];
      if (iso) map[iso] = { count: entry.count, entry };
    });
    return map;
  }, [data]);

  const getFill = (id: string) => {
    const info = isoCountMap[id];
    if (!info) return 'hsl(214, 18%, 14%)';
    const ratio = info.count / maxCount;
    const l = 14 + ratio * 22; // 14% → 36% lightness
    return `hsl(174, 80%, ${l}%)`;
  };

  const getStroke = (id: string) => {
    return isoCountMap[id] ? 'hsl(174, 60%, 30%)' : 'hsl(214, 18%, 22%)';
  };

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 420"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        {/* Graticule grid lines */}
        {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map(x => (
          <line key={`gx-${x}`} x1={x} y1={0} x2={x} y2={420} stroke="hsl(214, 18%, 12%)" strokeWidth="0.3" />
        ))}
        {[70, 140, 210, 280, 350].map(y => (
          <line key={`gy-${y}`} x1={0} y1={y} x2={800} y2={y} stroke="hsl(214, 18%, 12%)" strokeWidth="0.3" />
        ))}

        {/* Country paths */}
        {WORLD_COUNTRIES.map(country => {
          const active = !!isoCountMap[country.id];
          return (
            <path
              key={country.id}
              d={country.d}
              fill={getFill(country.id)}
              stroke={getStroke(country.id)}
              strokeWidth={active ? 0.8 : 0.4}
              className="transition-all duration-300 cursor-pointer"
              style={{ filter: active ? 'brightness(1.1)' : undefined }}
              onMouseEnter={() => {
                const info = isoCountMap[country.id];
                if (info) setHovered({ entry: info.entry, path: country });
              }}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Animated glow dots on active countries */}
        {WORLD_COUNTRIES.filter(c => isoCountMap[c.id]).map(country => {
          const ratio = isoCountMap[country.id].count / maxCount;
          const r = 3 + ratio * 6;
          return (
            <g key={`glow-${country.id}`}>
              {/* Outer pulse */}
              <circle
                cx={country.cx}
                cy={country.cy}
                r={r + 4}
                fill="none"
                stroke="hsl(174, 100%, 45%)"
                strokeWidth="1"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  values={`${r + 2};${r + 8};${r + 2}`}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Core glow */}
              <circle
                cx={country.cx}
                cy={country.cy}
                r={r}
                fill="hsl(174, 100%, 45%)"
                opacity={0.5 + ratio * 0.5}
                className="cursor-pointer"
                onMouseEnter={() => {
                  const info = isoCountMap[country.id];
                  if (info) setHovered({ entry: info.entry, path: country });
                }}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-md"
          style={{
            left: Math.min(mousePos.x + 12, 280),
            top: mousePos.y - 40,
            background: 'hsl(214, 18%, 10%)',
            border: '1px solid hsl(174, 60%, 25%)',
            color: 'hsl(0, 0%, 92%)',
            boxShadow: '0 4px 20px hsl(174, 100%, 30%, 0.15)',
          }}
        >
          <div className="text-[11px] font-semibold">{hovered.entry.country}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-mono text-primary">{hovered.entry.count.toLocaleString()} events</span>
            <span className="text-[9px] font-mono text-muted-foreground">
              {totalEvents > 0 ? ((hovered.entry.count / totalEvents) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
