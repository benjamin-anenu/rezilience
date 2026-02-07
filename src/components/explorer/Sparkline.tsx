import { useMemo } from 'react';

interface SparklineProps {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Lightweight SVG sparkline component for displaying mini trend charts
 */
export function Sparkline({ 
  values, 
  className = '', 
  width = 60, 
  height = 20 
}: SparklineProps) {
  const { points, trend } = useMemo(() => {
    if (values.length === 0) {
      return { points: '', trend: 'stable' as const };
    }

    // Handle single value case
    if (values.length === 1) {
      const y = height / 2;
      return { 
        points: `0,${y} ${width},${y}`, 
        trend: 'stable' as const 
      };
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = 2; // Padding from top/bottom

    const pointsStr = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = padding + ((max - v) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    // Determine trend based on first and last values
    const first = values[0];
    const last = values[values.length - 1];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (last > first * 1.02) trend = 'up';
    else if (last < first * 0.98) trend = 'down';

    return { points: pointsStr, trend };
  }, [values, width, height]);

  const strokeColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'hsl(var(--primary))';
      case 'down': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted-foreground))';
    }
  }, [trend]);

  if (values.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-[10px] text-muted-foreground">—</span>
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline 
        points={points} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
