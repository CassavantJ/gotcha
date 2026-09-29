export interface Settings {
  sound: boolean;
  music: boolean;
  /** The furthest question reached, 1-based. */
  furthest: number;
  wins: number;
  /** Fewest lives lost in a winning run. */
  bestDeaths: number | null;
}

const KEY = 'gotcha.v1';
export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: true,
  furthest: 0,
  wins: 0,
  bestDeaths: null,
};

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const count = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : fallback;

export function loadSettings(store: Pick<Storage, 'getItem'> | null = storage()): Settings {
  try {
    const raw: unknown = JSON.parse(store?.getItem(KEY) ?? '{}');
    if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS;
    const record = raw as Record<string, unknown>;
    return {
      sound: typeof record.sound === 'boolean' ? record.sound : DEFAULT_SETTINGS.sound,
      music: typeof record.music === 'boolean' ? record.music : DEFAULT_SETTINGS.music,
      furthest: count(record.furthest, 0),
      wins: count(record.wins, 0),
      bestDeaths:
        record.bestDeaths === null
          ? null
          : count(record.bestDeaths, -1) === -1
            ? null
            : count(record.bestDeaths, 0),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(
  settings: Settings,
  store: Pick<Storage, 'setItem'> | null = storage(),
): void {
  try {
    store?.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private browsing: it only lasts for this visit.
  }
}

export function recordProgress(settings: Settings, reached: number): Settings {
  return reached > settings.furthest ? { ...settings, furthest: reached } : settings;
}

export function recordWin(settings: Settings, deaths: number): Settings {
  return {
    ...settings,
    wins: settings.wins + 1,
    bestDeaths: settings.bestDeaths === null ? deaths : Math.min(settings.bestDeaths, deaths),
  };
}
