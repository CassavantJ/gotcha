import { useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from 'react';

import { INK } from '../../art/Gus';
import { Tiles } from '../Tiles';
import styles from './scenes.module.css';
import type { SceneProps } from './types';

/** Calls `done` after `seconds`, reporting the whole seconds left along the way. */
function useCountdown(seconds: number, done: () => void): number {
  const [left, setLeft] = useState(seconds);
  const finish = useEffectEvent(done);
  useEffect(() => {
    const start = performance.now();
    const timer = window.setInterval(() => {
      const remaining = seconds - (performance.now() - start) / 1000;
      if (remaining <= 0) {
        window.clearInterval(timer);
        finish();
      } else setLeft(Math.ceil(remaining));
    }, 100);
    return () => {
      window.clearInterval(timer);
    };
  }, [seconds]);
  return left;
}

/** Hands off: every tempting button is a trap until the count runs out. */
export function Wait({ onCorrect, onWrong }: SceneProps) {
  const left = useCountdown(5, onCorrect);
  return (
    <div className={styles.stack}>
      <p className={styles.bigCount} aria-live="off">
        {left}
      </p>
      <Tiles answers={['Next question', 'Free life!', 'Click me', 'Hurry up']} onPick={onWrong} />
    </div>
  );
}

const HOLD_S = 3;

/** Press and hold for three seconds; letting go early just resets. */
export function Hold({ onCorrect }: SceneProps) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const holding = useRef(false);

  // The loop lives in the press handler; letting go cancels it.
  const start = () => {
    if (holding.current) return;
    holding.current = true;
    const began = performance.now();
    const tick = (now: number) => {
      if (!holding.current) return;
      const share = Math.min(1, (now - began) / (HOLD_S * 1000));
      setProgress(share);
      if (share >= 1) {
        holding.current = false;
        onCorrect();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    holding.current = false;
    cancelAnimationFrame(frame.current);
    setProgress(0);
  };
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  const circumference = 2 * Math.PI * 70;
  return (
    <div className={styles.center}>
      <button
        type="button"
        className={styles.holdButton}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        onKeyDown={(event) => {
          if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) start();
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') stop();
        }}
      >
        <svg viewBox="0 0 160 160" aria-hidden="true" className={styles.holdRing}>
          <circle cx={80} cy={80} r={70} fill="none" stroke="#e9ecef" strokeWidth={12} />
          <circle
            cx={80}
            cy={80}
            r={70}
            fill="none"
            stroke="#40c057"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 80 80)"
          />
        </svg>
        <span>Hold me</span>
      </button>
    </div>
  );
}

const MASH_TARGET = 15;

/** Tap fast. Holding a key down doesn't count; each press must be its own. */
export function Mash({ onCorrect }: SceneProps) {
  const [count, setCount] = useState(0);
  const press = () => {
    const next = count + 1;
    setCount(next);
    if (next === MASH_TARGET) onCorrect();
  };
  const blockRepeat = (event: KeyboardEvent) => {
    if (event.repeat) event.preventDefault();
  };
  return (
    <div className={styles.center}>
      <button type="button" className={styles.mashButton} onClick={press} onKeyDown={blockRepeat}>
        Tap!
      </button>
      <p className={styles.caption} aria-live="polite">
        {Math.min(count, MASH_TARGET)} / {MASH_TARGET}
      </p>
    </div>
  );
}

/** The answer won't sit still. */
export function Catch({ onCorrect, reducedMotion }: SceneProps) {
  const area = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const box = area.current;
    const target = button.current;
    if (!box || !target) return;
    let x = 20;
    let y = 20;
    let vx = 190;
    let vy = 140;
    let last = performance.now();
    let frame = 0;
    let hop = 0;
    const move = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const maxX = box.clientWidth - target.offsetWidth;
      const maxY = box.clientHeight - target.offsetHeight;
      if (reducedMotion) {
        // Jumps once a second instead of gliding.
        hop += dt;
        if (hop > 1) {
          hop = 0;
          x = Math.random() * maxX;
          y = Math.random() * maxY;
        }
      } else {
        x += vx * dt;
        y += vy * dt;
        if (x < 0 || x > maxX) vx = -vx;
        if (y < 0 || y > maxY) vy = -vy;
        x = Math.min(Math.max(x, 0), maxX);
        y = Math.min(Math.max(y, 0), maxY);
      }
      target.style.transform = `translate(${x}px, ${y}px)`;
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div ref={area} className={styles.arena}>
      <button ref={button} type="button" className={styles.runner} onClick={onCorrect}>
        Answer
      </button>
    </div>
  );
}

/** The trophy dodges three times, then gives up. */
export function Trophy({ onCorrect }: SceneProps) {
  const spots = [
    { x: 50, y: 50 },
    { x: 12, y: 18 },
    { x: 84, y: 70 },
    { x: 80, y: 16 },
  ] as const;
  const [dodges, setDodges] = useState(0);
  const [caught, setCaught] = useState(false);
  const spot = spots[Math.min(dodges, spots.length - 1)] ?? spots[0];
  const lines = ['', 'Too slow!', 'Nope!', 'Fine, fine. It’s yours.'];

  return (
    <div className={styles.arena}>
      <button
        type="button"
        className={styles.trophy}
        data-caught={caught || undefined}
        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        onClick={() => {
          if (caught) return;
          if (dodges < 3) setDodges(dodges + 1);
          else {
            setCaught(true);
            window.setTimeout(onCorrect, 600);
          }
        }}
      >
        <svg viewBox="0 0 80 90" aria-hidden="true">
          <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
            <path d="M18 8 h44 v14 c0 20 -10 32 -22 32 c-12 0 -22 -12 -22 -32 z" fill="#ffd43b" />
            <path d="M18 14 c-14 0 -14 22 4 24 M62 14 c14 0 14 22 -4 24" fill="none" />
            <rect x={34} y={54} width={12} height={14} fill="#fab005" />
            <rect x={22} y={68} width={36} height={12} rx={3} fill="#8b5a2b" />
          </g>
          <path
            d="M28 16 c0 12 4 22 10 26"
            stroke="#fff3bf"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">Trophy</span>
      </button>
      <p className={styles.caption} aria-live="polite">
        {lines[dodges] ?? ''}
      </p>
    </div>
  );
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other] as T, copy[index] as T];
  }
  return copy;
}

/** A number shows for a moment, then you pick it from lookalikes. */
export function Flash({ onCorrect, onWrong }: SceneProps) {
  const [round] = useState(() => {
    const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const value = digits.join('');
    const swapped = [digits[1], digits[0], digits[2], digits[3]].join('');
    const lastSwap = [digits[0], digits[1], digits[3], digits[2]].join('');
    const changed = [digits[0], digits[1], ((digits[2] ?? 0) % 9) + 1, digits[3]].join('');
    return { value, options: shuffle([value, swapped, lastSwap, changed]) };
  });
  const [showing, setShowing] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowing(false);
    }, 1600);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  if (showing) {
    return (
      <p className={styles.flashNumber} aria-live="assertive">
        {round.value}
      </p>
    );
  }
  return (
    <div className={styles.stack}>
      <p className={styles.caption}>Which number was it?</p>
      <Tiles
        answers={round.options}
        onPick={(index) => {
          if (round.options[index] === round.value) onCorrect();
          else onWrong();
        }}
      />
    </div>
  );
}

const NUMBERS = [4, 1, 9, 2, 6, 7] as const;

/** Choose three tiles adding up to ten. Only 1 + 2 + 7 works. */
export function Ten({ onCorrect, onWrong }: SceneProps) {
  const [picked, setPicked] = useState<number[]>([]);
  const toggle = (index: number) => {
    if (picked.includes(index)) {
      setPicked(picked.filter((value) => value !== index));
      return;
    }
    const next = [...picked, index];
    setPicked(next);
    if (next.length === 3) {
      const sum = next.reduce((total, value) => total + (NUMBERS[value] ?? 0), 0);
      if (sum === 10) onCorrect();
      else onWrong();
    }
  };
  return (
    <div className={styles.numberGrid}>
      {NUMBERS.map((value, index) => (
        <button
          key={index}
          type="button"
          className={styles.numberTile}
          aria-pressed={picked.includes(index)}
          onClick={() => {
            toggle(index);
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

const ANIMALS = ['Horse', 'Mouse', 'Whale', 'Cat'] as const;
const BY_SIZE = ['Mouse', 'Cat', 'Horse', 'Whale'] as const;

/** Tap from smallest to biggest; a wrong tap costs a life. */
export function Sort({ onCorrect, onWrong }: SceneProps) {
  const [done, setDone] = useState(0);
  return (
    <div className={styles.numberGrid} data-columns="2">
      {ANIMALS.map((animal) => {
        const place = BY_SIZE.indexOf(animal);
        const tapped = place < done;
        return (
          <button
            key={animal}
            type="button"
            className={styles.numberTile}
            aria-pressed={tapped}
            onClick={() => {
              if (tapped) return;
              if (place !== done) {
                onWrong();
                return;
              }
              const next = done + 1;
              setDone(next);
              if (next === BY_SIZE.length) onCorrect();
            }}
          >
            {tapped && <span className={styles.order}>{place + 1}</span>}
            {animal}
          </button>
        );
      })}
    </div>
  );
}
