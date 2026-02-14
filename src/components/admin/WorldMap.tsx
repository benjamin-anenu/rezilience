import { useState } from 'react';

interface GeoEntry {
  country: string;
  count: number;
}

interface WorldMapProps {
  data: GeoEntry[];
}

// Simplified continent outlines (Natural Earth inspired, heavily simplified)
const CONTINENT_PATHS = [
  // North America
  'M60,80 L120,50 L160,55 L170,80 L150,110 L130,130 L100,140 L80,120 L60,100Z',
  // South America
  'M110,150 L130,140 L150,155 L145,200 L130,240 L115,250 L100,230 L95,190 L105,160Z',
  // Europe
  'M280,55 L310,45 L330,55 L340,70 L330,85 L310,90 L290,85 L275,70Z',
  // Africa
  'M280,100 L310,90 L340,100 L350,130 L340,170 L320,190 L290,185 L270,160 L265,130Z',
  // Asia
  'M340,40 L420,30 L470,50 L480,80 L460,100 L420,110 L380,105 L350,90 L330,70Z',
  // Oceania
  'M440,160 L480,150 L500,165 L495,185 L470,195 L445,185Z',
  // Australia
  'M430,185 L470,175 L490,190 L485,215 L460,225 L435,215 L425,200Z',
];

// Country name -> [x, y] on a 560x300 viewBox (Mercator-ish)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'United States': [120, 95],
  'Canada': [120, 65],
  'Mexico': [100, 125],
  'Brazil': [125, 200],
  'Argentina': [115, 240],
  'Colombia': [110, 155],
  'Chile': [105, 235],
  'Peru': [100, 180],
  'United Kingdom': [290, 60],
  'Germany': [310, 62],
  'France': [295, 72],
  'Spain': [285, 82],
  'Italy': [310, 78],
  'Netherlands': [300, 58],
  'Sweden': [315, 45],
  'Norway': [305, 42],
  'Poland': [320, 60],
  'Ukraine': [335, 62],
  'Romania': [330, 72],
  'Turkey': [345, 80],
  'Russia': [380, 50],
  'India': [410, 105],
  'China': [440, 75],
  'Japan': [480, 75],
  'South Korea': [468, 80],
  'Indonesia': [455, 155],
  'Philippines': [468, 120],
  'Vietnam': [450, 110],
  'Thailand': [440, 110],
  'Singapore': [445, 140],
  'Malaysia': [445, 135],
  'Pakistan': [395, 95],
  'Bangladesh': [420, 100],
  'Saudi Arabia': [360, 100],
  'UAE': [370, 100],
  'Israel': [345, 90],
  'Iran': [370, 85],
  'Nigeria': [290, 140],
  'South Africa': [310, 200],
  'Kenya': [330, 155],
  'Egypt': [320, 100],
  'Ghana': [275, 140],
  'Ethiopia': [340, 140],
  'Morocco': [270, 95],
  'Australia': [460, 200],
  'New Zealand': [500, 225],
};

export function WorldMap({ data }: WorldMapProps) {
  const [hovered, setHovered] = useState<GeoEntry | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 560 300"
        className="w-full h-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        {/* Continent outlines */}
        {CONTINENT_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="hsl(214, 18%, 16%)"
            stroke="hsl(214, 18%, 25%)"
            strokeWidth="0.5"
          />
        ))}

        {/* Country dots */}
        {data.map((entry) => {
          const coords = COUNTRY_COORDS[entry.country];
          if (!coords) return null;
          const ratio = entry.count / maxCount;
          const r = 3 + ratio * 8;
          return (
            <g key={entry.country}>
              {/* Glow */}
              <circle
                cx={coords[0]}
                cy={coords[1]}
                r={r + 3}
                fill="hsl(174, 100%, 38%)"
                opacity={0.15 + ratio * 0.15}
              />
              {/* Dot */}
              <circle
                cx={coords[0]}
                cy={coords[1]}
                r={r}
                fill="hsl(174, 100%, 38%)"
                opacity={0.6 + ratio * 0.4}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHovered(entry)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-10 px-2 py-1 rounded text-[10px] font-mono"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 30,
            background: 'hsl(214, 18%, 12%)',
            border: '1px solid hsl(214, 18%, 22%)',
            color: 'hsl(0, 0%, 90%)',
          }}
        >
          {hovered.country}: <span className="font-semibold text-primary">{hovered.count}</span>
        </div>
      )}
    </div>
  );
}
