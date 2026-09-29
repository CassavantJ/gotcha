/**
 * One attempt at the quiz: which question you're on, lives, passes and hidden tickets found.
 * Pure functions over plain data, so the rules are easy to test.
 */

export const LIVES = 3;
export const STARTING_PASSES = 2;

export type Status = 'playing' | 'game-over' | 'won';

export interface Run {
  /** Zero-based index of the current question. */
  index: number;
  lives: number;
  passes: number;
  /** Hidden bonus tickets already picked up this run, by id. */
  tickets: readonly string[];
  /** Lives lost over the whole run, for the final score. */
  deaths: number;
  status: Status;
}

export function newRun(): Run {
  return {
    index: 0,
    lives: LIVES,
    passes: STARTING_PASSES,
    tickets: [],
    deaths: 0,
    status: 'playing',
  };
}

/** Right answer: on to the next question, or the win at the end. */
export function correct(run: Run, total: number): Run {
  if (run.status !== 'playing') return run;
  const index = run.index + 1;
  return index >= total ? { ...run, index: total - 1, status: 'won' } : { ...run, index };
}

/** Wrong answer or time out: lose a life and try the same question again, or it's game over. */
export function wrong(run: Run): Run {
  if (run.status !== 'playing') return run;
  const lives = run.lives - 1;
  return { ...run, lives, deaths: run.deaths + 1, status: lives <= 0 ? 'game-over' : 'playing' };
}

/** Spends a pass to skip the current question. */
export function spendPass(run: Run, total: number, allowed: boolean): Run {
  if (run.status !== 'playing' || run.passes <= 0 || !allowed) return run;
  return correct({ ...run, passes: run.passes - 1 }, total);
}

/** Picks up a hidden ticket: one extra pass, once per run. */
export function collectTicket(run: Run, id: string): Run {
  if (run.tickets.includes(id)) return run;
  return { ...run, passes: run.passes + 1, tickets: [...run.tickets, id] };
}
