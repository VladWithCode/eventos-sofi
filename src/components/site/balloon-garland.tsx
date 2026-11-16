/**
 * Balloon garland that hugs an arch frame — the business's signature decor.
 * Drawn in the frame's own coordinates (300 × 420, semicircular top) and
 * overflowing it by 20% on every side.
 */

const PALETTE = ["blue", "pearl", "mist", "gold", "white"] as const;
type BalloonColor = (typeof PALETTE)[number];

const STOPS: Record<BalloonColor, [string, string, string]> = {
  blue: ["#c3ced5", "#8a9ba5", "#667984"],
  mist: ["#eef2f4", "#c5d0d6", "#9fb0b9"],
  pearl: ["#fffdf8", "#ece3d4", "#cdbfa9"],
  white: ["#ffffff", "#f6f1e8", "#d9d0c2"],
  gold: ["#f3dfb3", "#cfa862", "#9c7735"],
};

const BALLOON_COUNT = 30;
const ARCH_RADIUS = 150;

/** Stable pseudo-random in [0, 1): the same on server and client. */
function noise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

type Balloon = { x: number; y: number; r: number; color: BalloonColor; order: number };

function layout(): Balloon[] {
  const balloons: Balloon[] = [];
  for (let index = 0; index < BALLOON_COUNT; index += 1) {
    const t = index / (BALLOON_COUNT - 1);
    // Over the top of the arch (right shoulder to left edge), then down the left side.
    const onArc = t < 0.64;
    const arcT = t / 0.64;
    const angle = ((-38 - arcT * 142) * Math.PI) / 180;
    const pathX = onArc ? 150 + ARCH_RADIUS * Math.cos(angle) : 0;
    const pathY = onArc ? 150 + ARCH_RADIUS * Math.sin(angle) : 150 + ((t - 0.64) / 0.36) * 190;
    // Fullest at the shoulder, tapering toward both ends.
    const fullness = 0.55 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.08));
    const r = (11 + noise(index + 1) * 15) * fullness;
    const spread = (noise(index + 41) - 0.5) * 34 * fullness;
    balloons.push({
      x: pathX + spread * (onArc ? Math.cos(angle) : 1),
      y: pathY + spread * (onArc ? Math.sin(angle) : 0.25),
      r,
      color: PALETTE[Math.floor(noise(index + 87) * PALETTE.length)],
      order: index,
    });
  }
  // Big balloons at the back, small ones in front.
  return balloons.sort((a, b) => b.r - a.r);
}

const BALLOONS = layout();

export function BalloonGarland({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="-60 -84 420 588"
      className={`pointer-events-none absolute -inset-[20%] size-[140%] ${className ?? ""}`}
    >
      <defs>
        {PALETTE.map((color) => (
          <radialGradient key={color} id={`balloon-${color}`} cx="34%" cy="30%" r="75%">
            <stop offset="0%" stopColor={STOPS[color][0]} />
            <stop offset="55%" stopColor={STOPS[color][1]} />
            <stop offset="100%" stopColor={STOPS[color][2]} />
          </radialGradient>
        ))}
      </defs>
      {BALLOONS.map((balloon) => (
        <g
          key={balloon.order}
          className="animate-pop"
          style={{
            animationDelay: `${520 + balloon.order * 38}ms`,
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        >
          <circle cx={balloon.x} cy={balloon.y} r={balloon.r} fill={`url(#balloon-${balloon.color})`} />
          <ellipse
            cx={balloon.x - balloon.r * 0.36}
            cy={balloon.y - balloon.r * 0.42}
            rx={balloon.r * 0.2}
            ry={balloon.r * 0.11}
            fill="#ffffff"
            opacity="0.7"
            transform={`rotate(-38 ${balloon.x - balloon.r * 0.36} ${balloon.y - balloon.r * 0.42})`}
          />
        </g>
      ))}
    </svg>
  );
}
