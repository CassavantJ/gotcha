import { useState } from 'react';

import { Gus, INK } from '../../art/Gus';
import { Tiles } from '../Tiles';
import { Hit } from './Hit';
import styles from './scenes.module.css';
import type { SceneProps } from './types';

/** Runs `then` after a beat, so the player sees what their click did. */
const after = (ms: number, then: () => void) => {
  window.setTimeout(then, ms);
};

function Bubble({ x, y, text }: { x: number; y: number; text: string }) {
  const width = text.length * 7.4 + 20;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={26}
        rx={12}
        fill="#fff"
        stroke={INK}
        strokeWidth={2.5}
      />
      <path
        d={`M${x + 18} ${y + 25} l-6 10 l14 -9`}
        fill="#fff"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <text x={x + width / 2} y={y + 18} textAnchor="middle" className={styles.svgText}>
        {text}
      </text>
    </g>
  );
}

function Ticket({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path
        d="M0 0 h34 v6 a4 4 0 0 0 0 8 v6 h-34 v-6 a4 4 0 0 0 0 -8 z"
        fill="#ffd43b"
        stroke={INK}
        strokeWidth={2}
      />
      <text x={17} y={14} textAnchor="middle" className={styles.ticketText}>
        PASS
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------------------------

export function Lights({ onCorrect, onWrong, onTicket, tickets }: SceneProps) {
  const [off, setOff] = useState(false);
  const [wobble, setWobble] = useState(false);
  const [lifted, setLifted] = useState(false);
  const found = tickets.includes('rug');
  return (
    <div className={styles.stack}>
      <svg
        viewBox="0 0 400 220"
        className={styles.picture}
        role="group"
        aria-label="A room with a lamp"
      >
        <rect width={400} height={170} fill={off ? '#2b2a4a' : '#ffe8cc'} />
        <rect y={170} width={400} height={50} fill={off ? '#3b2f2f' : '#c08457'} />
        {/* Window with a night sky. */}
        <rect x={40} y={30} width={90} height={70} fill="#1c2a5a" stroke={INK} strokeWidth={4} />
        <path d="M85 30 v70 M40 65 h90" stroke={INK} strokeWidth={3} />
        <circle cx={110} cy={48} r={8} fill="#fff3bf" />
        {/* Lamp. */}
        <Hit
          label="Lamp"
          onPress={() => {
            setWobble(true);
            after(400, () => {
              setWobble(false);
            });
          }}
        >
          <g className={wobble ? styles.wobble : undefined}>
            {!off && <path d="M232 70 L196 170 L300 170 L264 70 Z" fill="#fff3bf" opacity={0.7} />}
            <rect
              x={244}
              y={100}
              width={8}
              height={70}
              fill="#868e96"
              stroke={INK}
              strokeWidth={2}
            />
            <ellipse cx={248} cy={172} rx={22} ry={6} fill="#868e96" stroke={INK} strokeWidth={2} />
            <path
              d="M226 72 L270 72 L260 46 L236 46 Z"
              fill={off ? '#5c3d8a' : '#9775fa'}
              stroke={INK}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          </g>
        </Hit>
        {/* The switch. */}
        <Hit
          label="Light switch"
          onPress={() => {
            if (off) return;
            setOff(true);
            after(700, onCorrect);
          }}
        >
          <rect
            x={330}
            y={86}
            width={22}
            height={34}
            rx={4}
            fill="#f8f9fa"
            stroke={INK}
            strokeWidth={3}
          />
          <rect
            x={337}
            y={off ? 104 : 92}
            width={8}
            height={12}
            rx={2}
            fill="#adb5bd"
            stroke={INK}
            strokeWidth={2}
          />
        </Hit>
        {/* A rug with something poking out from under it. Lifting the rug shows it all. */}
        {!found && !lifted && <Ticket x={88} y={184} rotate={-12} />}
        <Hit
          label={lifted ? 'Rug, lifted' : 'Rug'}
          onPress={() => {
            setLifted(!lifted);
          }}
        >
          <ellipse
            cx={lifted ? 200 : 150}
            cy={lifted ? 206 : 198}
            rx={80}
            ry={lifted ? 8 : 14}
            fill={off ? '#5c2b35' : '#e8454a'}
            stroke={INK}
            strokeWidth={3}
          />
        </Hit>
        {!found && lifted && (
          <Hit
            label="Ticket"
            onPress={() => {
              onTicket('rug');
            }}
          >
            <Ticket x={96} y={180} rotate={-8} />
          </Hit>
        )}
        {off && <rect width={400} height={220} fill="#000" opacity={0.35} />}
      </svg>
      <Tiles answers={['Off', 'Dark', 'Sleep', 'Night']} onPick={onWrong} />
    </div>
  );
}

export function Balloon({ onCorrect }: SceneProps) {
  const [holding, setHolding] = useState(false);
  const [bounces, setBounces] = useState(0);
  const [popped, setPopped] = useState(false);
  const size = 1 + Math.min(bounces, 4) * 0.06;
  return (
    <svg
      viewBox="0 0 400 240"
      className={styles.picture}
      role="group"
      aria-label="A balloon and a pin"
    >
      <rect width={400} height={240} fill="#e7f5ff" />
      {!popped ? (
        <Hit
          label="Balloon"
          onPress={() => {
            if (holding) {
              setPopped(true);
              after(600, onCorrect);
            } else setBounces(bounces + 1);
          }}
        >
          <g transform={`translate(200 110) scale(${size}) translate(-200 -110)`}>
            <path d="M200 150 q-8 30 6 70" fill="none" stroke={INK} strokeWidth={2} />
            <ellipse
              cx={200}
              cy={100}
              rx={48}
              ry={58}
              fill="#e8454a"
              stroke={INK}
              strokeWidth={4}
            />
            <path
              d="M194 156 l6 -8 l6 8 z"
              fill="#e8454a"
              stroke={INK}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <ellipse
              cx={180}
              cy={78}
              rx={10}
              ry={16}
              fill="#fff"
              opacity={0.55}
              transform="rotate(-20 180 78)"
            />
          </g>
        </Hit>
      ) : (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round">
          {Array.from({ length: 8 }, (_, index) => {
            const angle = (index * Math.PI) / 4;
            return (
              <line
                key={index}
                x1={200 + Math.cos(angle) * 20}
                y1={100 + Math.sin(angle) * 20}
                x2={200 + Math.cos(angle) * 48}
                y2={100 + Math.sin(angle) * 48}
              />
            );
          })}
          <text x={200} y={108} textAnchor="middle" className={styles.pop} stroke="none">
            POP!
          </text>
        </g>
      )}
      <Hit
        label={holding ? 'Pin, picked up' : 'Pin'}
        onPress={() => {
          setHolding(true);
        }}
      >
        <g transform={holding ? 'translate(250 150) rotate(-30)' : 'translate(340 30) rotate(35)'}>
          <line x1={0} y1={0} x2={0} y2={38} stroke="#868e96" strokeWidth={3} />
          <circle cx={0} cy={0} r={8} fill="#fab005" stroke={INK} strokeWidth={3} />
        </g>
      </Hit>
      {holding && !popped && <Bubble x={20} y={20} text="Got the pin." />}
    </svg>
  );
}

export function Fish({ onCorrect, onWrong }: SceneProps) {
  const [fed, setFed] = useState(false);
  const [blub, setBlub] = useState(false);
  return (
    <div className={styles.stack}>
      <svg
        viewBox="0 0 400 200"
        className={styles.picture}
        role="group"
        aria-label="A fishbowl and a tub of food"
      >
        <rect width={400} height={200} fill="#fff9db" />
        <rect y={170} width={400} height={30} fill="#c08457" />
        {/* Bowl. */}
        <path
          d="M130 60 q-60 20 -40 80 q20 36 80 36 q60 0 80 -36 q20 -60 -40 -80 z"
          fill="#a5d8ff"
          stroke={INK}
          strokeWidth={4}
          opacity={0.9}
        />
        <Hit
          label="Fish"
          onPress={() => {
            setBlub(true);
          }}
        >
          <g className={fed ? styles.rise : styles.swim}>
            <ellipse
              cx={170}
              cy={130}
              rx={22}
              ry={13}
              fill="#ff922b"
              stroke={INK}
              strokeWidth={3}
            />
            <path
              d="M148 130 l-16 -12 v24 z"
              fill="#ff922b"
              stroke={INK}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <circle cx={180} cy={126} r={3} fill={INK} />
          </g>
        </Hit>
        {blub && !fed && <Bubble x={200} y={70} text="Blub." />}
        {fed &&
          [0, 1, 2, 3, 4].map((flake) => (
            <rect
              key={flake}
              x={150 + flake * 10}
              y={64 + (flake % 2) * 8}
              width={4}
              height={4}
              fill="#8b5a2b"
              className={styles.fall}
            />
          ))}
        {/* Food tub on the shelf. */}
        <rect x={290} y={60} width={100} height={8} fill="#8b5a2b" stroke={INK} strokeWidth={2} />
        <Hit
          label="Tub of fish food"
          onPress={() => {
            if (fed) return;
            setFed(true);
            after(1100, onCorrect);
          }}
        >
          <rect
            x={318}
            y={22}
            width={34}
            height={38}
            rx={4}
            fill="#74c0fc"
            stroke={INK}
            strokeWidth={3}
          />
          <rect
            x={314}
            y={16}
            width={42}
            height={10}
            rx={3}
            fill="#e8454a"
            stroke={INK}
            strokeWidth={3}
          />
          <text x={335} y={46} textAnchor="middle" className={styles.labelText}>
            FOOD
          </text>
        </Hit>
      </svg>
      <Tiles answers={['Feed', 'Fish food', 'Yum', 'Blub']} onPick={onWrong} />
    </div>
  );
}

export function Wake({ onCorrect, onWrong }: SceneProps) {
  const [ringing, setRinging] = useState(false);
  const [mumble, setMumble] = useState(false);
  return (
    <div className={styles.stack}>
      <svg
        viewBox="0 0 400 220"
        className={styles.picture}
        role="group"
        aria-label="Gus asleep in bed, next to an alarm clock"
      >
        <rect width={400} height={220} fill="#dbe4ff" />
        {/* Bed. */}
        <rect
          x={60}
          y={150}
          width={220}
          height={40}
          rx={6}
          fill="#8b5a2b"
          stroke={INK}
          strokeWidth={3}
        />
        <rect
          x={50}
          y={110}
          width={14}
          height={90}
          rx={4}
          fill="#8b5a2b"
          stroke={INK}
          strokeWidth={3}
        />
        <Hit
          label="Gus"
          onPress={() => {
            setMumble(true);
          }}
        >
          <Gus mood={ringing ? 'surprised' : 'sleep'} x={120} y={ringing ? 10 : 40} scale={0.95} />
        </Hit>
        <path d="M70 140 q100 -26 206 0 v18 h-206 z" fill="#74c0fc" stroke={INK} strokeWidth={3} />
        {!ringing && (
          <text x={230} y={50} className={styles.zzz}>
            z Z z
          </text>
        )}
        {mumble && !ringing && <Bubble x={200} y={70} text="Five more minutes…" />}
        {/* Nightstand and alarm clock. */}
        <rect x={300} y={150} width={60} height={50} fill="#a0522d" stroke={INK} strokeWidth={3} />
        <Hit
          label="Alarm clock"
          onPress={() => {
            if (ringing) return;
            setRinging(true);
            after(900, onCorrect);
          }}
        >
          <g className={ringing ? styles.ring : undefined}>
            <circle cx={330} cy={128} r={20} fill="#ffd43b" stroke={INK} strokeWidth={3} />
            <circle cx={330} cy={128} r={14} fill="#fff" stroke={INK} strokeWidth={2} />
            <path d="M330 120 v8 l6 4" stroke={INK} strokeWidth={2} fill="none" />
            <circle cx={314} cy={108} r={6} fill="#ffd43b" stroke={INK} strokeWidth={2} />
            <circle cx={346} cy={108} r={6} fill="#ffd43b" stroke={INK} strokeWidth={2} />
          </g>
        </Hit>
      </svg>
      <Tiles answers={['WAKE UP!', 'Shake him', 'Hello?', 'Poke']} onPick={onWrong} />
    </div>
  );
}

export function Radio({ onCorrect, onWrong }: SceneProps) {
  const [unplugged, setUnplugged] = useState(false);
  const [stuck, setStuck] = useState(false);
  return (
    <div className={styles.stack}>
      <svg
        viewBox="0 0 400 200"
        className={styles.picture}
        role="group"
        aria-label="A loud radio plugged into the wall"
      >
        <rect width={400} height={200} fill="#fff4e6" />
        <rect y={160} width={400} height={40} fill="#c08457" />
        {/* Radio. */}
        <rect
          x={60}
          y={80}
          width={150}
          height={80}
          rx={10}
          fill="#e8454a"
          stroke={INK}
          strokeWidth={4}
        />
        <circle cx={100} cy={120} r={24} fill="#495057" stroke={INK} strokeWidth={3} />
        <Hit
          label="Volume knob"
          onPress={() => {
            setStuck(true);
          }}
        >
          <circle cx={170} cy={110} r={12} fill="#f8f9fa" stroke={INK} strokeWidth={3} />
        </Hit>
        <rect
          x={150}
          y={132}
          width={40}
          height={10}
          rx={3}
          fill="#fff"
          stroke={INK}
          strokeWidth={2}
        />
        {stuck && !unplugged && <Bubble x={150} y={30} text="It's stuck!" />}
        {!unplugged && (
          <g className={styles.notes}>
            <text x={70} y={60}>
              ♪
            </text>
            <text x={130} y={50}>
              ♫
            </text>
            <text x={190} y={64}>
              ♪
            </text>
          </g>
        )}
        {/* Cord to the wall socket. */}
        <path
          d={`M210 140 q60 20 ${unplugged ? 80 : 110} -30`}
          fill="none"
          stroke={INK}
          strokeWidth={3}
        />
        <rect
          x={330}
          y={88}
          width={34}
          height={44}
          rx={6}
          fill="#f8f9fa"
          stroke={INK}
          strokeWidth={3}
        />
        <Hit
          label="Plug"
          onPress={() => {
            if (unplugged) return;
            setUnplugged(true);
            after(700, onCorrect);
          }}
        >
          <rect
            x={unplugged ? 282 : 312}
            y={100}
            width={22}
            height={18}
            rx={3}
            fill="#495057"
            stroke={INK}
            strokeWidth={2}
          />
        </Hit>
      </svg>
      <Tiles answers={['Turn it down', 'Shh!', 'Mute', 'Earmuffs']} onPick={onWrong} />
    </div>
  );
}

const WIRES = [
  { color: '#e8454a', name: 'Red wire' },
  { color: '#339af0', name: 'Blue wire' },
  { color: '#40c057', name: 'Green wire' },
  { color: '#fcc419', name: 'Yellow wire' },
] as const;

export function Wires({ onCorrect, onWrong }: SceneProps) {
  const [cut, setCut] = useState<string | null>(null);
  return (
    <svg
      viewBox="0 0 400 220"
      className={styles.picture}
      role="group"
      aria-label="A bomb with four wires"
    >
      <rect width={400} height={220} fill="#f1f3f5" />
      {/* Bomb. */}
      <circle cx={80} cy={120} r={52} fill="#343a40" stroke={INK} strokeWidth={4} />
      <rect x={70} y={56} width={20} height={14} fill="#495057" stroke={INK} strokeWidth={3} />
      <path d="M80 56 q10 -24 30 -20" fill="none" stroke="#8b5a2b" strokeWidth={4} />
      <circle cx={112} cy={36} r={5} fill="#ff922b" className={styles.spark} />
      <rect
        x={250}
        y={50}
        width={110}
        height={140}
        rx={8}
        fill="#dee2e6"
        stroke={INK}
        strokeWidth={3}
      />
      {WIRES.map((wire, index) => {
        const y = 80 + index * 30;
        const snipped = cut === wire.name;
        return (
          <Hit
            key={wire.name}
            label={wire.name}
            onPress={() => {
              if (cut) return;
              setCut(wire.name);
              if (wire.color === '#40c057') after(500, onCorrect);
              else after(300, onWrong);
            }}
          >
            {/* A wide invisible band makes the thin wire easy to hit. */}
            <rect x={130} y={y - 10} width={130} height={20} fill="transparent" />
            <path
              d={
                snipped
                  ? `M130 ${y} h55 M205 ${y} h55`
                  : `M130 ${y} q65 ${index % 2 === 0 ? -12 : 12} 130 0`
              }
              fill="none"
              stroke={wire.color}
              strokeWidth={7}
              strokeLinecap="round"
            />
          </Hit>
        );
      })}
    </svg>
  );
}

const STAR_SPOTS = [
  [60, 50],
  [140, 30],
  [220, 70],
  [300, 40],
  [350, 110],
  [110, 120],
  [262, 128],
] as const;

export function Stars({ onCorrect, onWrong }: SceneProps) {
  return (
    <div className={styles.stack}>
      <svg
        viewBox="0 0 400 180"
        className={styles.picture}
        role="img"
        aria-label="A night sky with stars and a cloud"
      >
        <rect width={400} height={180} fill="#1c2a5a" />
        <circle cx={40} cy={140} r={20} fill="#fff3bf" />
        {STAR_SPOTS.map(([x, y], index) => (
          <path
            key={index}
            transform={`translate(${x} ${y})`}
            d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2.5 L7.5 11 L0 6.5 L-7.5 11 L-5.5 2.5 L-12 -3.5 L-3.5 -4 Z"
            fill="#ffe066"
            stroke={INK}
            strokeWidth={1.5}
          />
        ))}
        {/* A cloud drifting over part of one star. */}
        <g fill="#dee2e6" stroke={INK} strokeWidth={2}>
          <ellipse cx={288} cy={138} rx={30} ry={14} />
          <ellipse cx={272} cy={130} rx={16} ry={12} />
        </g>
      </svg>
      <Tiles
        answers={['6', '7', '8', '9']}
        onPick={(index) => {
          if (index === 1) onCorrect();
          else onWrong();
        }}
      />
    </div>
  );
}

function Landscape({ bird }: { bird: boolean }) {
  return (
    <>
      <rect width={180} height={150} fill="#a5d8ff" />
      <rect y={120} width={180} height={30} fill="#69db7c" />
      <circle cx={150} cy={28} r={14} fill="#ffd43b" stroke={INK} strokeWidth={2} />
      <rect x={30} y={70} width={60} height={50} fill="#ffa8a8" stroke={INK} strokeWidth={2.5} />
      <path
        d="M24 72 L60 44 L96 72 Z"
        fill="#c92a2a"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <rect x={52} y={92} width={16} height={28} fill="#8b5a2b" stroke={INK} strokeWidth={2} />
      <rect x={128} y={90} width={10} height={32} fill="#8b5a2b" stroke={INK} strokeWidth={2} />
      <circle cx={133} cy={82} r={20} fill="#2f9e44" stroke={INK} strokeWidth={2.5} />
      {bird && (
        <path
          d="M96 30 q6 -6 12 0 q6 -6 12 0"
          fill="none"
          stroke={INK}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
    </>
  );
}

export function Difference({ onCorrect, onWrong }: SceneProps) {
  return (
    <svg
      viewBox="0 0 380 150"
      className={styles.picture}
      role="group"
      aria-label="Two pictures of a house"
    >
      <g>
        <Landscape bird={false} />
      </g>
      <g transform="translate(200 0)">
        <Hit label="Right-hand picture" onPress={onWrong}>
          <Landscape bird={false} />
        </Hit>
        <Hit label="Bird" onPress={onCorrect}>
          <rect x={92} y={20} width={32} height={18} fill="transparent" />
          <path
            d="M96 30 q6 -6 12 0 q6 -6 12 0"
            fill="none"
            stroke={INK}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Hit>
      </g>
    </svg>
  );
}

function Face({ wink }: { wink: boolean }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx={20} cy={20} r={17} fill="#ffe066" stroke={INK} strokeWidth={2.5} />
      <circle cx={14} cy={16} r={2.5} fill={INK} />
      {wink ? (
        <path d="M23 16 h6" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <circle cx={26} cy={16} r={2.5} fill={INK} />
      )}
      <path d="M12 24 q8 7 16 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

export function OddFace({ onCorrect, onWrong }: SceneProps) {
  const [odd] = useState(() => Math.floor(Math.random() * 16));
  return (
    <div className={styles.faces}>
      {Array.from({ length: 16 }, (_, index) => (
        <button
          key={index}
          type="button"
          className={styles.face}
          aria-label={`Face ${index + 1}`}
          onClick={index === odd ? onCorrect : onWrong}
        >
          <Face wink={index === odd} />
        </button>
      ))}
    </div>
  );
}

function Apple() {
  return (
    <svg viewBox="0 0 40 40" className={styles.fruit} role="img" aria-label="apple">
      <path
        d="M20 12 c-10 -6 -18 4 -14 14 c3 8 9 10 14 7 c5 3 11 1 14 -7 c4 -10 -4 -20 -14 -14 z"
        fill="#e8454a"
        stroke={INK}
        strokeWidth={2.5}
      />
      <path d="M20 12 q0 -6 4 -9" fill="none" stroke="#8b5a2b" strokeWidth={2.5} />
      <path d="M22 8 q6 -4 9 1 q-6 3 -9 -1 z" fill="#40c057" stroke={INK} strokeWidth={1.5} />
    </svg>
  );
}

function Banana() {
  return (
    <svg viewBox="0 0 40 40" className={styles.fruit} role="img" aria-label="banana">
      <path
        d="M8 10 c2 18 12 26 26 22 c-2 -3 -4 -3 -7 -3 c-10 0 -14 -8 -15 -19 z"
        fill="#ffd43b"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path d="M8 10 l-2 -4" stroke="#8b5a2b" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

export function FruitMaths({ onCorrect, onWrong }: SceneProps) {
  return (
    <div className={styles.stack}>
      <div className={styles.equations}>
        <p>
          <Apple /> + <Apple /> = 10
        </p>
        <p>
          <Apple /> + <Banana /> = 8
        </p>
        <p>
          <Banana /> = ?
        </p>
      </div>
      <Tiles
        answers={['5', '3', '2', '8']}
        onPick={(index) => {
          if (index === 1) onCorrect();
          else onWrong();
        }}
      />
    </div>
  );
}

const SCROLL_LINES = [
  'Keep going…',
  'Not here.',
  'Nope, not this either.',
  'Getting warmer…',
  'Still scrolling?',
  'You really are.',
  'Nearly there.',
  'Almost…',
  'Any moment now.',
  'Trust me.',
  'Just a bit more…',
];

export function Scroll({ onCorrect, onWrong, onTicket, tickets }: SceneProps) {
  const found = tickets.includes('scroll');
  return (
    <div className={styles.stack}>
      <Tiles answers={['Bottom', 'Down', 'The end', 'Scroll']} onPick={onWrong} />
      {/* Keyboard users reach the list by tabbing to its buttons, which scrolls it. */}
      <div className={styles.scroller}>
        {SCROLL_LINES.map((line, index) => (
          <p key={line} className={styles.scrollLine}>
            {line}
            {index === 5 && !found && (
              <button
                type="button"
                className={styles.inlineTicket}
                onClick={() => {
                  onTicket('scroll');
                }}
              >
                A free pass!
              </button>
            )}
          </p>
        ))}
        <button type="button" className={styles.found} onClick={onCorrect}>
          Here it is!
        </button>
      </div>
    </div>
  );
}
