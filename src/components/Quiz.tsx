import { Heart, Ticket } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState, type SyntheticEvent } from 'react';

import { GusPicture } from '../art/Gus';
import { Illustration } from '../art/Illustrations';
import type { QuizAudio } from '../audio';
import {
  QUESTIONS,
  TOTAL,
  type KeyQuestion,
  type Question,
  type TypeQuestion,
} from '../quiz/questions';
import { collectTicket, correct, LIVES, spendPass, wrong, type Run } from '../quiz/run';
import { useReducedMotion } from '../useReducedMotion';
import styles from './Quiz.module.css';
import { SCENES } from './scenes';
import { Tiles } from './Tiles';

interface QuizProps {
  run: Run;
  onRun: (run: Run) => void;
  audio: QuizAudio;
}

type Feedback = 'right' | 'wrong' | null;

const RIGHT_MS = 550;
const WRONG_MS = 1100;

/** The fuse on timed questions: burns down, and calls `expire` when it's gone. */
function Fuse({
  seconds,
  paused,
  expire,
  tick,
}: {
  seconds: number;
  paused: boolean;
  expire: () => void;
  tick: () => void;
}) {
  const [left, setLeft] = useState(1);
  const onExpire = useEffectEvent(expire);
  const onTick = useEffectEvent(tick);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let elapsed = 0;
    let last = performance.now();
    let lastWhole = seconds;
    let frame = 0;
    const step = (now: number) => {
      if (!pausedRef.current) elapsed += (now - last) / 1000;
      last = now;
      const share = Math.max(0, 1 - elapsed / seconds);
      setLeft(share);
      const whole = Math.ceil(seconds - elapsed);
      if (whole < lastWhole && whole <= 3 && whole > 0) onTick();
      lastWhole = whole;
      if (share <= 0) {
        onExpire();
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [seconds]);

  return (
    <div className={styles.fuse} role="timer" aria-label={`${seconds} second fuse`}>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <line x1={0} y1={5} x2={100} y2={5} className={styles.fuseBurnt} />
        <line x1={0} y1={5} x2={left * 100} y2={5} className={styles.fuseRope} />
      </svg>
      <span className={styles.spark} style={{ left: `${left * 100}%` }} aria-hidden="true" />
    </div>
  );
}

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const;

function KeyPrompt({
  question,
  onAnswer,
}: {
  question: KeyQuestion;
  onAnswer: (right: boolean) => void;
}) {
  const answer = useEffectEvent((key: string) => {
    onAnswer(key.toLowerCase() === question.key);
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      // Letters and numbers only; Tab, arrows and the like stay free for moving around.
      if (event.key.length !== 1 || !/[a-z0-9]/i.test(event.key)) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea')) return;
      event.preventDefault();
      answer(event.key);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  return (
    <div className={styles.keyboard} role="group" aria-label="On-screen keyboard">
      {KEY_ROWS.map((row) => (
        <div key={row} className={styles.keyRow}>
          {Array.from(row).map((key) => (
            <button
              key={key}
              type="button"
              className={styles.key}
              onClick={() => {
                onAnswer(key === question.key);
              }}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function TypePrompt({
  question,
  onAnswer,
}: {
  question: TypeQuestion;
  onAnswer: (right: boolean) => void;
}) {
  const [text, setText] = useState('');
  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    onAnswer(question.accept.includes(text.trim().toLowerCase()));
  };
  return (
    <form className={styles.typeForm} onSubmit={submit}>
      <input
        className={styles.typeInput}
        value={text}
        aria-label="Your answer"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <button type="submit" className={styles.enter}>
        Enter
      </button>
    </form>
  );
}

function Body({
  question,
  run,
  onAnswer,
  onTicket,
  reducedMotion,
}: {
  question: Question;
  run: Run;
  onAnswer: (right: boolean) => void;
  onTicket: (id: string) => void;
  reducedMotion: boolean;
}) {
  switch (question.kind) {
    case 'choice':
      return (
        <div className={styles.body}>
          {question.art && <Illustration art={question.art} />}
          {question.display && (
            <p className={styles.display} style={{ color: question.display.color }}>
              {question.display.text}
            </p>
          )}
          <Tiles
            answers={question.answers}
            onPick={(index) => {
              onAnswer(index === question.correct);
            }}
          />
        </div>
      );
    case 'key':
      return <KeyPrompt question={question} onAnswer={onAnswer} />;
    case 'type':
      return <TypePrompt question={question} onAnswer={onAnswer} />;
    case 'scene': {
      const Scene = SCENES[question.scene];
      return (
        <Scene
          onCorrect={() => {
            onAnswer(true);
          }}
          onWrong={() => {
            onAnswer(false);
          }}
          onTicket={onTicket}
          tickets={run.tickets}
          reducedMotion={reducedMotion}
        />
      );
    }
  }
}

export function Quiz({ run, onRun, audio }: QuizProps) {
  const question = QUESTIONS[run.index] ?? QUESTIONS[0];
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [attempt, setAttempt] = useState(0);
  const [toast, setToast] = useState('');
  const reducedMotion = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = feedback !== null;

  // Each new question (or retry) gets focus on its prompt, so screen readers read it.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [run.index, attempt]);

  if (!question) return null;
  const passable = question.passable !== false;

  const answer = (right: boolean) => {
    if (busy) return;
    audio.play(right ? 'right' : 'wrong');
    setFeedback(right ? 'right' : 'wrong');
    window.setTimeout(
      () => {
        setFeedback(null);
        if (right) onRun(correct(run, TOTAL));
        else {
          const next = wrong(run);
          if (next.status === 'game-over') audio.play('over');
          onRun(next);
          setAttempt((value) => value + 1);
        }
      },
      right ? RIGHT_MS : WRONG_MS,
    );
  };

  const ticket = (id: string) => {
    const next = collectTicket(run, id);
    if (next === run) return;
    audio.play('ticket');
    setToast('+1 pass!');
    window.setTimeout(() => {
      setToast('');
    }, 1400);
    onRun(next);
  };

  const hud = question.kind === 'choice' ? question.hud : undefined;

  return (
    <main className={styles.quiz} data-feedback={feedback ?? undefined}>
      <h1 className="sr-only">
        Gotcha! Question {run.index + 1} of {TOTAL}
      </h1>
      <div className={styles.hud}>
        {hud === 'number' ? (
          <button
            type="button"
            className={styles.number}
            onClick={() => {
              answer(true);
            }}
          >
            {run.index + 1}
          </button>
        ) : (
          <span className={styles.number}>
            <span className="sr-only">Question </span>
            {run.index + 1}
          </span>
        )}
        <div className={styles.lives} aria-label={`${run.lives} of ${LIVES} lives`} role="img">
          {Array.from({ length: LIVES }, (_, index) =>
            hud === 'hearts' && index < run.lives ? (
              <button
                key={index}
                type="button"
                className={styles.heartButton}
                aria-label="A life"
                onClick={() => {
                  answer(true);
                }}
              >
                <Heart aria-hidden="true" className={styles.heart} data-full />
              </button>
            ) : (
              <Heart
                key={index}
                aria-hidden="true"
                className={styles.heart}
                data-full={index < run.lives || undefined}
              />
            ),
          )}
        </div>
        <button
          type="button"
          className={styles.pass}
          disabled={run.passes === 0 || !passable || busy}
          onClick={() => {
            audio.play('click');
            onRun(spendPass(run, TOTAL, passable));
          }}
        >
          <Ticket aria-hidden="true" className={styles.passIcon} />
          Pass <span className={styles.passCount}>{run.passes}</span>
        </button>
      </div>

      {question.timer !== undefined && (
        <Fuse
          key={`${run.index}-${attempt}`}
          seconds={question.timer}
          paused={busy}
          expire={() => {
            answer(false);
          }}
          tick={() => {
            audio.play('tick');
          }}
        />
      )}

      <section className={styles.card} aria-labelledby="prompt">
        <h2 id="prompt" ref={heading} tabIndex={-1} className={styles.prompt}>
          {question.prompt}
        </h2>
        <Body
          key={`${run.index}-${attempt}`}
          question={question}
          run={run}
          onAnswer={answer}
          onTicket={ticket}
          reducedMotion={reducedMotion}
        />
      </section>

      {feedback && (
        <div className={styles.feedback} role="status">
          <GusPicture mood={feedback === 'right' ? 'happy' : 'laugh'} size={90} />
          <p>{feedback === 'right' ? 'Correct!' : 'Gotcha!'}</p>
        </div>
      )}
      {toast && (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      )}
    </main>
  );
}
