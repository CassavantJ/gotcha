/**
 * The fifty questions, in order. Every one is original to this game.
 *
 * - `choice`: pick one of the answer tiles. `correct: null` means no tile is right and the answer
 *   is somewhere else on screen (`hud` names where).
 * - `key`: press a key (an on-screen keyboard covers touch screens).
 * - `type`: type a word and press Enter.
 * - `scene`: an interactive picture with its own rules (see components/scenes).
 *
 * `timer` puts a fuse on the question: when it burns down, you lose a life.
 */

export type ArtId = 'mitten' | 'clock';

export type SceneId =
  | 'wait'
  | 'lights'
  | 'balloon'
  | 'catch'
  | 'fish'
  | 'hold'
  | 'odd-face'
  | 'wake'
  | 'scroll'
  | 'mash'
  | 'ten'
  | 'fruit'
  | 'flash'
  | 'difference'
  | 'sort'
  | 'stars'
  | 'radio'
  | 'wires'
  | 'trophy';

export interface Answer {
  label: string;
  /** Drawn without a tile or text: there, but you can't see it. */
  invisible?: boolean;
}

interface Base {
  id: string;
  prompt: string;
  /** Seconds before the fuse burns out. */
  timer?: number;
  /** False where a pass can't be used. */
  passable?: boolean;
}

export interface ChoiceQuestion extends Base {
  kind: 'choice';
  answers: readonly Answer[];
  correct: number | null;
  /** Something on the HUD that is the real answer. */
  hud?: 'number' | 'hearts';
  art?: ArtId;
  /** A big word shown above the answers. */
  display?: { text: string; color: string; name: string };
}

export interface KeyQuestion extends Base {
  kind: 'key';
  key: string;
}

export interface TypeQuestion extends Base {
  kind: 'type';
  accept: readonly string[];
}

export interface SceneQuestion extends Base {
  kind: 'scene';
  scene: SceneId;
}

export type Question = ChoiceQuestion | KeyQuestion | TypeQuestion | SceneQuestion;

const a = (...labels: string[]): Answer[] => labels.map((label) => ({ label }));

export const QUESTIONS: readonly Question[] = [
  {
    kind: 'choice',
    id: 'start',
    prompt: "Let's start easy. Which answer is correct?",
    answers: a('Wrong', 'Incorrect', 'Correct', 'Nope'),
    correct: 2,
  },
  {
    kind: 'choice',
    id: 'letters',
    prompt: 'How many letters are in the right answer?',
    answers: a('Seven', 'Four', 'Twelve', 'Six'),
    correct: 1,
  },
  {
    kind: 'choice',
    id: 'colour',
    prompt: 'What colour is this word?',
    display: { text: 'BLUE', color: '#f08c00', name: 'Orange' },
    answers: a('Blue', 'Orange', 'Green', 'Red'),
    correct: 1,
  },
  {
    kind: 'choice',
    id: 'clock-maths',
    prompt: "What's 8 + 8 on a clock?",
    answers: a('16', '4', '0', '12'),
    correct: 1,
  },
  { kind: 'scene', id: 'wait', prompt: "Don't touch anything for five seconds.", scene: 'wait' },
  {
    kind: 'choice',
    id: 'fruit',
    prompt: 'Which of these is a fruit?',
    answers: a('Carrot', 'Tomato', 'Potato', 'Lettuce'),
    correct: 1,
  },
  {
    kind: 'choice',
    id: 'number',
    prompt: "Click this question's number.",
    answers: a('Seven', 'Here', 'Number', 'This one'),
    correct: null,
    hud: 'number',
  },
  {
    kind: 'choice',
    id: 'question',
    prompt: 'Answer this question with a question.',
    answers: a('Yes.', 'Why?', 'No.', 'Maybe.'),
    correct: 1,
  },
  {
    kind: 'key',
    id: 'after-q',
    prompt: 'Press the key that comes after Q on a keyboard.',
    key: 'w',
  },
  {
    kind: 'choice',
    id: 'mitten',
    prompt: 'How many fingers am I holding up?',
    art: 'mitten',
    answers: a('One', 'Three', 'Five', "Can't tell"),
    correct: 3,
  },
  { kind: 'scene', id: 'lights', prompt: 'Turn off the lights.', scene: 'lights' },
  {
    kind: 'choice',
    id: 'longest',
    prompt: 'Which answer is the longest?',
    answers: a('Longest', 'Tiny', 'This one right here', 'Big'),
    correct: 2,
  },
  {
    kind: 'choice',
    id: 'decimal',
    prompt: 'Quick! Which is biggest?',
    answers: a('0.45', '0.5', '0.405', '0.049'),
    correct: 1,
    timer: 6,
  },
  { kind: 'scene', id: 'balloon', prompt: 'Pop the balloon.', scene: 'balloon' },
  {
    kind: 'choice',
    id: 'legs',
    prompt: 'What has more legs: a spider, or a chair and a cat?',
    answers: a('The spider', 'The chair and the cat', 'Same', 'A centipede'),
    correct: 2,
  },
  {
    kind: 'choice',
    id: 'remember-two',
    prompt: 'What was the right answer to question 2?',
    answers: a('Six', 'Twelve', 'Four', 'Seven'),
    correct: 2,
  },
  { kind: 'scene', id: 'catch', prompt: 'Catch the answer!', scene: 'catch', timer: 8 },
  {
    kind: 'choice',
    id: 'spell',
    prompt: "How do you spell 'wrong'?",
    answers: a('R-O-N-G', 'W-R-O-N-G', 'I-N-C-O-R-R-E-C-T', 'W-R-O-N-G-E'),
    correct: 1,
  },
  { kind: 'type', id: 'magic', prompt: 'Type the magic word.', accept: ['please'] },
  {
    kind: 'choice',
    id: 'spare-life',
    prompt: 'Click your spare life.',
    answers: a("I haven't got one", 'Here', 'Life', 'Spare'),
    correct: null,
    hud: 'hearts',
  },
  {
    kind: 'choice',
    id: 'prime',
    prompt: 'Which of these is not a prime number?',
    answers: a('2', '3', '9', '11'),
    correct: 2,
  },
  { kind: 'scene', id: 'fish', prompt: 'Feed the fish.', scene: 'fish' },
  {
    kind: 'choice',
    id: 'order',
    prompt: "Quick! What's 3 + 3 × 3?",
    answers: a('18', '12', '27', '9'),
    correct: 1,
    timer: 5,
  },
  { kind: 'scene', id: 'hold', prompt: 'Hold the button down for three seconds.', scene: 'hold' },
  {
    kind: 'choice',
    id: 'what-time',
    prompt: 'What time is it?',
    art: 'clock',
    answers: a('Noon', 'Half past two', 'Quiz time', 'Midnight'),
    correct: 2,
  },
  { kind: 'scene', id: 'odd-face', prompt: 'Find the odd one out.', scene: 'odd-face', timer: 10 },
  {
    kind: 'choice',
    id: 'moose',
    prompt: "What's the plural of 'moose'?",
    answers: a('Meese', 'Mooses', 'Moose', 'Moosen'),
    correct: 2,
  },
  { kind: 'key', id: 'last-letter', prompt: 'Press the last letter of the alphabet.', key: 'z' },
  { kind: 'scene', id: 'wake', prompt: 'Wake him up!', scene: 'wake' },
  {
    kind: 'choice',
    id: 'three',
    prompt: 'How many answers does this question have?',
    answers: a('Two', 'Three', 'Four'),
    correct: 1,
  },
  { kind: 'scene', id: 'scroll', prompt: 'The answer is at the bottom.', scene: 'scroll' },
  {
    kind: 'choice',
    id: 'weight',
    prompt: 'Which weighs the most?',
    answers: a(
      'A kilo of steel',
      'A kilo of feathers',
      'Two kilos of popcorn',
      'They all weigh the same',
    ),
    correct: 2,
  },
  {
    kind: 'scene',
    id: 'mash',
    prompt: 'Tap the button 15 times before the fuse runs out!',
    scene: 'mash',
    timer: 4,
  },
  {
    kind: 'choice',
    id: 'name',
    prompt: "What's the name of this quiz?",
    answers: a('Quizzly', 'Gotcha', 'Brain Drain', 'The Hard One'),
    correct: 1,
  },
  { kind: 'scene', id: 'ten', prompt: 'Pick three numbers that add up to 10.', scene: 'ten' },
  {
    kind: 'choice',
    id: 'planet',
    prompt: "Quick! Which of these isn't a planet?",
    answers: a('Mars', 'Neptune', 'Pluto', 'Venus'),
    correct: 2,
    timer: 7,
  },
  { kind: 'scene', id: 'fruit-maths', prompt: 'How much is the banana worth?', scene: 'fruit' },
  { kind: 'scene', id: 'flash', prompt: 'Remember this number!', scene: 'flash' },
  {
    kind: 'choice',
    id: 'spelling',
    prompt: 'Which of these is spelled wrong?',
    answers: a('Separate', 'Definately', 'Necessary', 'Rhythm'),
    correct: 1,
  },
  {
    kind: 'scene',
    id: 'difference',
    prompt: 'Click the difference in the right-hand picture.',
    scene: 'difference',
    timer: 12,
  },
  {
    kind: 'choice',
    id: 'bridge',
    prompt: 'What do you get if you cross a river with a bridge?',
    answers: a('Wet feet', 'The other side', 'A troll', 'A toll'),
    correct: 1,
  },
  { kind: 'scene', id: 'sort', prompt: 'Tap these from smallest to biggest.', scene: 'sort' },
  { kind: 'scene', id: 'stars', prompt: 'How many stars are there?', scene: 'stars', timer: 12 },
  {
    kind: 'type',
    id: 'alphabet',
    prompt: "Type how many letters are in the word 'alphabet'.",
    accept: ['8', 'eight'],
  },
  { kind: 'scene', id: 'radio', prompt: "It's too loud in here. Fix it.", scene: 'radio' },
  {
    kind: 'choice',
    id: 'not-wrong',
    prompt: "Quick! What's the opposite of 'not wrong'?",
    answers: a('Right', 'Wrong', 'Correct', 'Not right'),
    correct: 1,
    timer: 5,
  },
  {
    kind: 'choice',
    id: 'invisible',
    prompt: 'Click the invisible answer.',
    answers: [
      { label: 'Here' },
      { label: 'There' },
      { label: 'Everywhere' },
      { label: 'Nowhere', invisible: true },
    ],
    correct: 3,
  },
  {
    kind: 'choice',
    id: 'remember-colour',
    prompt: 'What colour was the word in question 3?',
    answers: a('Blue', 'Orange', 'Green', 'Red'),
    correct: 1,
  },
  {
    kind: 'scene',
    id: 'wires',
    prompt: "Defuse it! Cut the wire that isn't a primary colour.",
    scene: 'wires',
    timer: 12,
  },
  {
    kind: 'scene',
    id: 'trophy',
    prompt: 'Last one! Grab your trophy.',
    scene: 'trophy',
    passable: false,
  },
];

export const TOTAL = QUESTIONS.length;
