import { useMemo } from 'react';

interface SparklineProps {
  values: number[];
  className?: string;
  width?: number;
  height?: number;
  showDots?: boolean;
}

/**
 * Generate a smooth SVG path using Catmull-Rom spline interpolation
 * This creates fluid, wave-like curves through all data points
 */
function generateSmoothPath(
  values: number[],
  width: number,
  height: number,
  padding = 2
): string {
  if (values.length === 0) return '';
  
  if (values.length === 1) {
    const y = height / 2;
    return `M 0,${y} L ${width},${y}`;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  // Convert values to points
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: padding + ((max - v) / range) * (height - padding * 2),
  }));

  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  // Generate smooth curve using quadratic bezier curves
  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Calculate control point (midpoint between current and next)
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    if (i === 0) {
      // First segment: straight line to midpoint, then curve
      path += ` Q ${current.x},${current.y} ${midX},${midY}`;
    } else {
      // Use smooth curve continuation
      path += ` T ${midX},${midY}`;
    }
  }

  // Final point
  const lastPoint = points[points.length - 1];
  path += ` T ${lastPoint.x},${lastPoint.y}`;

  return path;
}

/**
 * Lightweight SVG sparkline component with smooth wave-like curves
 */
export function Sparkline({ 
  values, 
  className = '', 
  width = 60, 
  height = 20,
  showDots = false,
}: SparklineProps) {
  const { path, trend, points } = useMemo(() => {
    if (values.length === 0) {
      return { path: '', trend: 'stable' as const, points: [] };
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = 2;

    // Calculate points for dots
    const pointsArray = values.map((v, i) => ({
      x: values.length === 1 ? width / 2 : (i / (values.length - 1)) * width,
      y: padding + ((max - v) / range) * (height - padding * 2),
    }));

    const pathStr = generateSmoothPath(values, width, height);

    // Determine trend based on first and last values
    const first = values[0];
    const last = values[values.length - 1];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (last > first * 1.02) trend = 'up';
    else if (last < first * 0.98) trend = 'down';

    return { path: pathStr, trend, points: pointsArray };
  }, [values, width, height]);

  const strokeColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'hsl(var(--primary))';
      case 'down': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted-foreground))';
    }
  }, [trend]);

  // Show "Building..." when insufficient data
  if (values.length < 3) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-[9px] text-muted-foreground italic">Building...</span>
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
      <path 
        d={path} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="1.5"
          fill={strokeColor}
        />
      ))}
    </svg>
  );
}
