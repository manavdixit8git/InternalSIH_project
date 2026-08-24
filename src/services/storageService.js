// Central localStorage access. Swap this out for Firebase later.
const KEYS = {
  PLAYER: "cw_player",
  PROGRESS: "cw_progress",
  WORLD: "cw_world",
  SETTINGS: "cw_settings",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const DEFAULT_SETTINGS = {
  sfx: true,
  music: true,
  voice: true,
  lang: "en", // en | hi
  voiceSpeed: 1, // 0.85 .. 1.15  (normal)
};

export const storageService = {
  KEYS,
  getPlayer: () => read(KEYS.PLAYER, null),
  setPlayer: (p) => write(KEYS.PLAYER, p),

  getProgress: () =>
    read(KEYS.PROGRESS, {
      xp: 0,
      stars: 0,
      completed: {},
      badges: [],
      categoryStats: {},
    }),
  setProgress: (p) => write(KEYS.PROGRESS, p),

  getWorld: () =>
    read(KEYS.WORLD, {
      sky: "neutral",
      river: "neutral",
      water: "neutral",
      trees: "neutral",
      safety: "neutral",
      kindness: "neutral",
      school: "neutral",
      social: "neutral",
    }),
  setWorld: (w) => write(KEYS.WORLD, w),

  getSettings: () => {
    const s = read(KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...s };
  },
  setSettings: (s) => write(KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...s }),

  resetAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
