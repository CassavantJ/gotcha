/**
 * Sound effects and a little background tune, synthesized with Web Audio (no audio files).
 * The tune is an original eight-bar loop in C major.
 */

export type Sfx = 'right' | 'wrong' | 'tick' | 'ticket' | 'win' | 'over' | 'click';

const NOTE = (name: string): number => {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Number(name.slice(-1));
  const index = names.indexOf(name.slice(0, -1));
  return 440 * 2 ** ((index - 9) / 12 + (octave - 4));
};

/** Melody as [note or rest, beats]; bass as one root per bar. */
const MELODY: readonly (readonly [string | null, number])[] = [
  ['E5', 1],
  ['G5', 0.5],
  ['A5', 0.5],
  ['G5', 1],
  ['E5', 1],
  ['D5', 1],
  ['C5', 0.5],
  ['D5', 0.5],
  ['E5', 2],
  ['C5', 1],
  ['E5', 0.5],
  ['F5', 0.5],
  ['E5', 1],
  ['C5', 1],
  ['D5', 1.5],
  [null, 0.5],
  ['G4', 2],
  ['E5', 1],
  ['G5', 0.5],
  ['A5', 0.5],
  ['C6', 1],
  ['A5', 1],
  ['G5', 1],
  ['E5', 0.5],
  ['D5', 0.5],
  ['C5', 2],
  ['F5', 1],
  ['E5', 1],
  ['D5', 1],
  ['B4', 1],
  ['C5', 3],
  [null, 1],
];
const BASS = ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'F2', 'G2'] as const;
const BEAT_S = 60 / 132;

export class QuizAudio {
  #context: AudioContext | null = null;
  #sfx: GainNode | null = null;
  #music: GainNode | null = null;
  #timer = 0;
  #nextBar = 0;
  #bar = 0;
  sound: boolean;
  musicOn: boolean;

  constructor(sound: boolean, music: boolean) {
    this.sound = sound;
    this.musicOn = music;
  }

  /** Call from a click: browsers only start audio after one. */
  unlock(): void {
    if (!this.#context) {
      if (typeof AudioContext === 'undefined') return;
      const context = new AudioContext();
      const sfx = context.createGain();
      sfx.gain.value = 0.35;
      sfx.connect(context.destination);
      const music = context.createGain();
      music.gain.value = 0.09;
      music.connect(context.destination);
      this.#context = context;
      this.#sfx = sfx;
      this.#music = music;
    }
    void this.#context.resume();
    if (this.musicOn) this.#startMusic();
  }

  setSound(on: boolean): void {
    this.sound = on;
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    if (on) this.unlock();
    else this.#stopMusic();
  }

  suspend(): void {
    void this.#context?.suspend();
  }

  resume(): void {
    void this.#context?.resume();
  }

  close(): void {
    this.#stopMusic();
    void this.#context?.close();
    this.#context = null;
  }

  #tone(
    out: AudioNode,
    at: number,
    frequency: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'square',
    slideTo?: number,
  ) {
    const context = this.#context;
    if (!context) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, at + duration);
    // From silence, so there's no click at the start.
    envelope.gain.value = 0;
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(volume, at + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(envelope).connect(out);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
  }

  play(name: Sfx): void {
    const context = this.#context;
    const out = this.#sfx;
    if (!this.sound || !context || !out || context.state !== 'running') return;
    const now = context.currentTime;
    switch (name) {
      case 'right':
        [NOTE('C5'), NOTE('E5'), NOTE('G5'), NOTE('C6')].forEach((frequency, index) => {
          this.#tone(out, now + index * 0.06, frequency, 0.18, 0.18, 'triangle');
        });
        break;
      case 'wrong':
        this.#tone(out, now, 200, 0.35, 0.22, 'sawtooth', 90);
        this.#tone(out, now + 0.05, 150, 0.35, 0.18, 'square', 70);
        break;
      case 'tick':
        this.#tone(out, now, 1400, 0.04, 0.1, 'square');
        break;
      case 'ticket':
        [NOTE('G5'), NOTE('C6'), NOTE('E6')].forEach((frequency, index) => {
          this.#tone(out, now + index * 0.07, frequency, 0.15, 0.14, 'square');
        });
        break;
      case 'win':
        [NOTE('C5'), NOTE('E5'), NOTE('G5'), NOTE('C6'), NOTE('G5'), NOTE('C6')].forEach(
          (frequency, index) => {
            this.#tone(out, now + index * 0.12, frequency, 0.3, 0.16, 'triangle');
          },
        );
        break;
      case 'over':
        [NOTE('G4'), NOTE('F4'), NOTE('E4'), NOTE('C4')].forEach((frequency, index) => {
          this.#tone(out, now + index * 0.2, frequency, 0.35, 0.16, 'triangle');
        });
        break;
      case 'click':
        this.#tone(out, now, 900, 0.03, 0.08, 'triangle');
        break;
    }
  }

  #startMusic() {
    const context = this.#context;
    if (!context || this.#timer) return;
    this.#nextBar = context.currentTime + 0.1;
    this.#bar = 0;
    // A small lookahead scheduler: queue each bar a little before it's due.
    const schedule = () => {
      const now = context.currentTime;
      while (this.#nextBar < now + 1) {
        this.#scheduleBar(this.#bar, this.#nextBar);
        this.#nextBar += BEAT_S * 4;
        this.#bar = (this.#bar + 1) % BASS.length;
      }
    };
    schedule();
    this.#timer = window.setInterval(schedule, 250);
  }

  #stopMusic() {
    window.clearInterval(this.#timer);
    this.#timer = 0;
  }

  #scheduleBar(bar: number, start: number) {
    const out = this.#music;
    if (!out) return;
    const root = BASS[bar] ?? 'C3';
    for (let beat = 0; beat < 4; beat++) {
      this.#tone(out, start + beat * BEAT_S, NOTE(root), BEAT_S * 0.8, 0.5, 'triangle');
    }
    // The melody notes that fall in this bar.
    let position = 0;
    for (const [note, beats] of MELODY) {
      const barOfNote = Math.floor(position / 4);
      if (barOfNote === bar && note) {
        this.#tone(
          out,
          start + (position - bar * 4) * BEAT_S,
          NOTE(note),
          beats * BEAT_S * 0.9,
          0.35,
          'square',
        );
      }
      position += beats;
    }
  }
}
