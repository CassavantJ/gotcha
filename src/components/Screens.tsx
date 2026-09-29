import { Music, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { app } from '../app.config';
import { GusPicture } from '../art/Gus';
import { TOTAL } from '../quiz/questions';
import { LIVES, STARTING_PASSES } from '../quiz/run';
import type { Settings } from '../settings';
import styles from './Screens.module.css';

interface Toggles {
  settings: Settings;
  onSound: (on: boolean) => void;
  onMusic: (on: boolean) => void;
}

function SoundToggles({ settings, onSound, onMusic }: Toggles) {
  return (
    <div className={styles.toggles}>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={settings.sound}
        onClick={() => {
          onSound(!settings.sound);
        }}
      >
        {settings.sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        Sound
      </button>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={settings.music}
        onClick={() => {
          onMusic(!settings.music);
        }}
      >
        <Music aria-hidden="true" />
        Music
      </button>
    </div>
  );
}

/** Moves focus to a screen's main button when it appears. */
function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

export function Title({ onStart, ...toggles }: Toggles & { onStart: () => void }) {
  const { settings } = toggles;
  return (
    <main className={styles.screen}>
      <GusPicture mood="happy" size={140} label="Gus, the quizmaster" />
      <h1 className={styles.logo}>{app.title}!</h1>
      <p className={styles.lead}>
        {TOTAL} trick questions. {LIVES} lives. Lose them all and it's back to question 1.
      </p>
      <ul className={styles.rules}>
        <li>Read every question carefully. Then read it again.</li>
        <li>Not every answer is on a button.</li>
        <li>A burning fuse means hurry.</li>
        <li>
          You get {STARTING_PASSES} passes to skip questions, and there are a couple more hidden
          somewhere.
        </li>
      </ul>
      <button type="button" className={styles.start} onClick={onStart}>
        <Play aria-hidden="true" className={`${styles.startIcon} ${styles.filled}`} />
        Start
      </button>
      {settings.furthest > 0 && (
        <p className={styles.record}>
          {settings.wins > 0
            ? `Beaten ${settings.wins} ${settings.wins === 1 ? 'time' : 'times'}, losing as few as ${settings.bestDeaths ?? 0} ${settings.bestDeaths === 1 ? 'life' : 'lives'}.`
            : `Your best: question ${settings.furthest} of ${TOTAL}.`}
        </p>
      )}
      <SoundToggles {...toggles} />
    </main>
  );
}

export function GameOver({ reached, onRetry }: { reached: number; onRetry: () => void }) {
  const button = useFocus<HTMLButtonElement>();
  return (
    <main className={styles.screen}>
      <GusPicture mood="laugh" size={140} label="Gus, laughing" />
      <h1 className={styles.heading}>Game over</h1>
      <p className={styles.lead}>
        You made it to question {reached} of {TOTAL}. Back to the start!
      </p>
      <button ref={button} type="button" className={styles.start} onClick={onRetry}>
        <RotateCcw aria-hidden="true" className={styles.startIcon} />
        Try again
      </button>
    </main>
  );
}

export function Won({ deaths, onAgain }: { deaths: number; onAgain: () => void }) {
  const button = useFocus<HTMLButtonElement>();
  return (
    <main className={styles.screen}>
      <GusPicture mood="surprised" size={140} label="Gus, amazed" />
      <h1 className={styles.logo}>You did it!</h1>
      <p className={styles.lead}>
        All {TOTAL} questions,{' '}
        {deaths === 0
          ? 'without losing a single life.'
          : `losing only ${deaths} ${deaths === 1 ? 'life' : 'lives'} on the way.`}{' '}
        Gus is speechless.
      </p>
      <button ref={button} type="button" className={styles.start} onClick={onAgain}>
        <RotateCcw aria-hidden="true" className={styles.startIcon} />
        Play again
      </button>
    </main>
  );
}
