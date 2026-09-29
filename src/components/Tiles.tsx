import type { Answer } from '../quiz/questions';
import styles from './Tiles.module.css';

interface TilesProps {
  answers: readonly (Answer | string)[];
  onPick: (index: number) => void;
}

/** The answer tiles: two by two, one color each. */
export function Tiles({ answers, onPick }: TilesProps) {
  return (
    <div className={styles.tiles} data-count={answers.length}>
      {answers.map((entry, index) => {
        const answer = typeof entry === 'string' ? { label: entry } : entry;
        return (
          <button
            key={index}
            type="button"
            className={styles.tile}
            data-slot={index}
            data-invisible={answer.invisible ?? undefined}
            onClick={() => {
              onPick(index);
            }}
          >
            {answer.invisible ? <span className="sr-only">{answer.label}</span> : answer.label}
          </button>
        );
      })}
    </div>
  );
}
