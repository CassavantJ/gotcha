export interface SceneProps {
  onCorrect: () => void;
  onWrong: () => void;
  /** Picks up a hidden ticket (a free pass). */
  onTicket: (id: string) => void;
  /** Tickets already found this run, so they don't show again. */
  tickets: readonly string[];
  reducedMotion: boolean;
}
