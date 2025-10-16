"use client";

export interface RingData {
  name: string;
  actual: number;
  goal: number;
  color: string;
  unit?: string;
}

interface CircularRingsProps {
  rings: RingData[];
  centerContent?: {
    label: string;
    actual: number;
    goal: number;
    unit?: string;
  };
  showLegend?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    container: 32,
    viewBox: 128,
    center: 64,
    baseRadius: 56,
    radiusStep: 16,
    strokeWidth: 8,
  },
  md: {
    container: 48,
    viewBox: 192,
    center: 96,
    baseRadius: 88,
    radiusStep: 20,
    strokeWidth: 12,
  },
  lg: {
    container: 64,
    viewBox: 256,
    center: 128,
    baseRadius: 116,
    radiusStep: 28,
    strokeWidth: 16,
  },
};

export function CircularRings({
  rings,
  centerContent,
  showLegend = true,
  size = "md",
}: CircularRingsProps) {
  const config = sizeConfig[size];

  // Limit to 3 rings max
  const limitedRings = rings.slice(0, 3);

  // Calculate ring configurations (from outer to inner)
  const ringConfigs = limitedRings.map((ring, index) => {
    const percent = Math.min((ring.actual / ring.goal) * 100, 100);
    const radius = config.baseRadius - index * config.radiusStep;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent / 100);

    return {
      ...ring,
      percent,
      radius,
      circumference,
      offset,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Rings and Center Content */}
      <div className="flex items-center gap-6">
        {/* Circular Rings */}
        <div
          className="relative"
          style={{
            width: `${config.container * 4}px`,
            height: `${config.container * 4}px`,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
          >
            {ringConfigs.map((ring, index) => (
              <g key={index}>
                {/* Background ring */}
                <circle
                  cx={config.center}
                  cy={config.center}
                  r={ring.radius}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth={config.strokeWidth}
                  opacity="0.2"
                />
                {/* Progress ring */}
                <circle
                  cx={config.center}
                  cy={config.center}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={config.strokeWidth}
                  strokeDasharray={ring.circumference}
                  strokeDashoffset={ring.offset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Center Content (optional) */}
        {centerContent && (
          <div className="flex flex-col">
            <p className="p3 text-muted-foreground">{centerContent.label}</p>
            <p className="t3 font-bold">
              {centerContent.actual}
              {centerContent.unit || ""} / {centerContent.goal}
              {centerContent.unit || ""}
            </p>
          </div>
        )}
      </div>

      {/* Legend (optional) */}
      {showLegend && (
        <div
          className="grid gap-4 w-full"
          style={{
            gridTemplateColumns: `repeat(${limitedRings.length}, minmax(0, 1fr))`,
          }}
        >
          {ringConfigs.map((ring) => (
            <div key={ring.name} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ring.color }}
                />
                <p className="p3 text-muted-foreground">{ring.name}</p>
              </div>
              <p className="p2 font-medium">
                {ring.actual}
                {ring.unit || ""} / {ring.goal}
                {ring.unit || ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
