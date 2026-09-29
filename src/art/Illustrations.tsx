import type { ArtId } from '../quiz/questions';
import { INK } from './Gus';

/** A raised mitten: impossible to count the fingers. */
function Mitten() {
  return (
    <svg viewBox="0 0 200 150" className="art" role="img" aria-label="A hand held up in a mitten">
      <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
        {/* Sleeve. */}
        <rect x={72} y={112} width={56} height={40} rx={6} fill="#4dabf7" />
        {/* Mitten body and thumb. */}
        <path d="M76 116 C70 80 70 40 100 30 C130 22 138 60 132 116 Z" fill="#e8454a" />
        <path d="M76 96 C60 92 52 70 62 64 C72 58 80 76 84 84" fill="#e8454a" />
        {/* Cuff. */}
        <rect x={72} y={108} width={62} height={14} rx={5} fill="#f4efe6" />
      </g>
      {/* Knitted stripes. */}
      <g stroke="#ffb3b3" strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M84 60 q20 -8 40 0" />
        <path d="M80 80 q24 -8 48 0" />
      </g>
    </svg>
  );
}

/** A clock with no hands. */
function Clock() {
  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * Math.PI) / 6;
    const inner = index % 3 === 0 ? 46 : 50;
    return {
      x1: 100 + Math.sin(angle) * inner,
      y1: 75 - Math.cos(angle) * inner,
      x2: 100 + Math.sin(angle) * 56,
      y2: 75 - Math.cos(angle) * 56,
    };
  });
  return (
    <svg viewBox="0 0 200 150" className="art" role="img" aria-label="A clock with no hands">
      <circle cx={100} cy={75} r={66} fill="#ffd43b" stroke={INK} strokeWidth={4} />
      <circle cx={100} cy={75} r={58} fill="#fffdf4" stroke={INK} strokeWidth={3} />
      <g stroke={INK} strokeWidth={3} strokeLinecap="round">
        {ticks.map((tick, index) => (
          <line key={index} {...tick} />
        ))}
      </g>
      <circle cx={100} cy={75} r={4} fill={INK} />
    </svg>
  );
}

export function Illustration({ art }: { art: ArtId }) {
  return art === 'mitten' ? <Mitten /> : <Clock />;
}
