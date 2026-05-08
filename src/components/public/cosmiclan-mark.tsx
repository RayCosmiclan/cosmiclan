import type { CSSProperties } from "react";

const DOTS = [
  [18, 24],
  [34, 16],
  [49, 26],
  [15, 43],
  [33, 41],
  [52, 45],
  [70, 18],
  [73, 39],
  [68, 61],
  [37, 64],
  [20, 72],
] as const;

const BARS = [
  [78, 17, 48],
  [92, 30, 74],
  [79, 43, 59],
  [95, 56, 81],
  [82, 69, 50],
  [100, 82, 66],
] as const;

type MarkProps = {
  className?: string;
  style?: CSSProperties;
};

export function CosmiclanMark({ className = "", style }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={style}
      viewBox="0 0 190 110"
      role="img"
    >
      <g fill="currentColor">
        {DOTS.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            className="cosmiclan-mark-dot"
            cx={cx}
            cy={cy}
            r={index % 3 === 0 ? 3.2 : 2.7}
          />
        ))}
        {BARS.map(([x, y, width], index) => (
          <rect
            key={`${x}-${y}`}
            className="cosmiclan-mark-bar"
            x={x}
            y={y}
            width={width}
            height="6"
            rx="1"
            style={{ animationDelay: `${index * 90}ms` }}
          />
        ))}
      </g>
    </svg>
  );
}

export function CosmiclanWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "wordmark wordmark-compact" : "wordmark"}>
      <CosmiclanMark className="wordmark-mark" />
      <span>COSMICLAN</span>
    </div>
  );
}
