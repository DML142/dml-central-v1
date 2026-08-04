import { buildConstellation, pointOpacity, pointRadius } from '@/lib/constellation';

const FIELD = buildConstellation();

/**
 * Rendered on the server: the field is deterministic, so it costs the client no JavaScript at all.
 * It stands in for the WebGL hero until phase 4 and stays on afterwards as the no-WebGL fallback.
 */
export function Constellation() {
  return (
    <div aria-hidden="true" className="hero-glow absolute inset-0 -z-10 overflow-hidden">
      <svg
        viewBox={`0 0 ${FIELD.width} ${FIELD.height}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        className="size-full"
      >
        <g>
          {FIELD.lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1.toFixed(1)}
              y1={line.y1.toFixed(1)}
              x2={line.x2.toFixed(1)}
              y2={line.y2.toFixed(1)}
              stroke="var(--color-violet-bright)"
              strokeOpacity={line.alpha.toFixed(3)}
              strokeWidth={0.6}
            />
          ))}
        </g>
        <g>
          {FIELD.points.map((point, index) => (
            <circle
              key={index}
              cx={point.x.toFixed(1)}
              cy={point.y.toFixed(1)}
              r={pointRadius(point.depth).toFixed(2)}
              fill="var(--color-violet-bright)"
              fillOpacity={pointOpacity(point.depth).toFixed(3)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
