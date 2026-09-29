import { describe, expect, it } from 'vitest';

import { QUESTIONS, TOTAL } from './questions';
import { collectTicket, correct, LIVES, newRun, STARTING_PASSES, spendPass, wrong } from './run';

const find = (id: string) => {
  const question = QUESTIONS.find((candidate) => candidate.id === id);
  if (!question) throw new Error(`no question ${id}`);
  return question;
};

const rightAnswer = (id: string) => {
  const question = find(id);
  if (question.kind !== 'choice' || question.correct === null) throw new Error(`${id} has no tile`);
  return question.answers[question.correct]?.label;
};

describe('questions', () => {
  it('has fifty, with unique ids', () => {
    expect(TOTAL).toBe(50);
    expect(new Set(QUESTIONS.map(({ id }) => id)).size).toBe(TOTAL);
  });

  it('points every choice at a real answer or at the HUD', () => {
    for (const question of QUESTIONS) {
      if (question.kind !== 'choice') continue;
      expect(question.answers.length).toBeGreaterThanOrEqual(3);
      if (question.correct === null) expect(question.hud).toBeDefined();
      else expect(question.answers[question.correct]).toBeDefined();
    }
  });

  it('keeps the self-referential answers true', () => {
    // Question 2: the right answer has as many letters as it says.
    expect(rightAnswer('letters')).toBe('Four');
    expect(rightAnswer('letters')?.length).toBe(4);
    // Longest really is longest.
    const longest = find('longest');
    if (longest.kind === 'choice' && longest.correct !== null) {
      const lengths = longest.answers.map((answer) => answer.label.length);
      expect(lengths[longest.correct]).toBe(Math.max(...lengths));
    }
    // "How many answers" has as many answers as its right answer says.
    const three = find('three');
    if (three.kind === 'choice') expect(three.answers).toHaveLength(3);
  });

  it('remembers earlier answers correctly', () => {
    expect(QUESTIONS.findIndex(({ id }) => id === 'letters')).toBe(1);
    expect(rightAnswer('remember-two')).toBe(rightAnswer('letters'));
    const colour = find('colour');
    expect(QUESTIONS.indexOf(colour)).toBe(2);
    if (colour.kind === 'choice') expect(rightAnswer('remember-colour')).toBe(colour.display?.name);
    expect(rightAnswer('colour')).toBe(colour.kind === 'choice' ? colour.display?.name : '');
  });

  it("puts the number question where its answer tiles don't give it away", () => {
    const index = QUESTIONS.findIndex(({ id }) => id === 'number');
    const question = find('number');
    if (question.kind === 'choice') {
      expect(question.answers.map((answer) => answer.label)).not.toContain(String(index + 1));
    }
  });

  it('ends on a question that cannot be passed', () => {
    expect(QUESTIONS.at(-1)?.passable).toBe(false);
  });
});

describe('run', () => {
  it('moves on when right and wins after the last question', () => {
    let run = newRun();
    for (let index = 0; index < TOTAL - 1; index++) run = correct(run, TOTAL);
    expect(run).toMatchObject({ index: TOTAL - 1, status: 'playing' });
    expect(correct(run, TOTAL).status).toBe('won');
  });

  it('costs a life when wrong, and ends the run after three', () => {
    let run = correct(newRun(), TOTAL);
    run = wrong(run);
    expect(run).toMatchObject({ index: 1, lives: LIVES - 1, deaths: 1, status: 'playing' });
    run = wrong(wrong(run));
    expect(run.status).toBe('game-over');
    // Nothing changes once it's over.
    expect(correct(run, TOTAL)).toBe(run);
  });

  it('spends passes, only where allowed', () => {
    const run = newRun();
    const passed = spendPass(run, TOTAL, true);
    expect(passed).toMatchObject({ index: 1, passes: STARTING_PASSES - 1 });
    expect(spendPass(run, TOTAL, false)).toBe(run);
    const empty = { ...run, passes: 0 };
    expect(spendPass(empty, TOTAL, true)).toBe(empty);
  });

  it('gives a pass for each hidden ticket, once', () => {
    const once = collectTicket(newRun(), 'rug');
    expect(once.passes).toBe(STARTING_PASSES + 1);
    expect(collectTicket(once, 'rug')).toBe(once);
  });
});
