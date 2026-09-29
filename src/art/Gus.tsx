/**
 * Gus, the quizmaster: an egg in a top hat and bow tie. Drawn in a 100×120 box; place him with
 * `x`, `y` and `scale` inside any SVG.
 */
export type Mood = 'happy' | 'laugh' | 'sad' | 'sleep' | 'surprised';

export const INK = '#231a2e';
const SHELL = '#fff4d6';
const SHADE = '#f0dcae';
const TIE = '#e8454a';

interface GusProps {
  mood?: Mood;
  x?: number;
  y?: number;
  scale?: number;
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'sleep') {
    return (
      <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
        <path d="M34 62 q6 5 12 0" />
        <path d="M56 62 q6 5 12 0" />
      </g>
    );
  }
  if (mood === 'laugh') {
    return (
      <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
        <path d="M34 64 q6 -7 12 0" />
        <path d="M56 64 q6 -7 12 0" />
      </g>
    );
  }
  const big = mood === 'surprised';
  return (
    <g>
      <ellipse
        cx={40}
        cy={60}
        rx={big ? 8 : 7}
        ry={big ? 10 : 9}
        fill="#fff"
        stroke={INK}
        strokeWidth={2.5}
      />
      <ellipse
        cx={62}
        cy={60}
        rx={big ? 8 : 7}
        ry={big ? 10 : 9}
        fill="#fff"
        stroke={INK}
        strokeWidth={2.5}
      />
      <circle cx={42} cy={mood === 'sad' ? 64 : 61} r={big ? 3 : 3.6} fill={INK} />
      <circle cx={64} cy={mood === 'sad' ? 64 : 61} r={big ? 3 : 3.6} fill={INK} />
      {mood === 'sad' && (
        <g fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round">
          <path d="M31 50 l10 -4" />
          <path d="M71 50 l-10 -4" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'laugh':
      return (
        <path
          d="M36 76 q15 22 30 0 z"
          fill="#8a2331"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      );
    case 'sad':
      return (
        <path
          d="M40 84 q11 -9 22 0"
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    case 'surprised':
      return (
        <ellipse cx={51} cy={82} rx={5} ry={7} fill="#8a2331" stroke={INK} strokeWidth={2.5} />
      );
    case 'sleep':
      return (
        <path
          d="M46 80 q5 3 10 0"
          fill="none"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    default:
      return (
        <path
          d="M38 76 q13 13 26 0"
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
  }
}

export function Gus({ mood = 'happy', x = 0, y = 0, scale = 1 }: GusProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Egg body with a shaded side. */}
      <path
        d="M50 20 C78 20 92 58 92 80 C92 104 74 118 50 118 C26 118 8 104 8 80 C8 58 22 20 50 20 Z"
        fill={SHELL}
        stroke={INK}
        strokeWidth={3}
      />
      <path d="M18 70 C16 96 30 112 50 114 C34 106 24 92 22 70 Z" fill={SHADE} />
      <ellipse
        cx={70}
        cy={48}
        rx={6}
        ry={10}
        fill="#fff"
        opacity={0.7}
        transform="rotate(-25 70 48)"
      />
      {/* Cheeks. */}
      <ellipse cx={30} cy={74} rx={6} ry={4} fill="#ffb3a7" opacity={0.8} />
      <ellipse cx={72} cy={74} rx={6} ry={4} fill="#ffb3a7" opacity={0.8} />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {/* Bow tie. */}
      <path
        d="M50 100 L36 92 L36 108 Z M50 100 L64 92 L64 108 Z"
        fill={TIE}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <circle cx={50} cy={100} r={4} fill={TIE} stroke={INK} strokeWidth={2.5} />
      {/* Top hat, tipped a little. */}
      <g transform="rotate(-8 50 20)">
        <rect x={32} y={16} width={36} height={6} rx={2} fill={INK} />
        <rect x={38} y={-6} width={24} height={24} rx={3} fill={INK} />
        <rect x={38} y={10} width={24} height={4} fill={TIE} />
      </g>
    </g>
  );
}

/** Gus on his own, as an image. */
export function GusPicture({
  mood = 'happy',
  size = 120,
  label,
}: {
  mood?: Mood;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      viewBox="-4 -14 108 136"
      width={size}
      height={(size * 136) / 108}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Gus mood={mood} />
    </svg>
  );
}
