import { storageService } from "./storageService";
import { getCtx, getSfxGain, unlockAudio } from "./audioCore";

// Procedural sound-effect + animal-vocal engine (no audio files required).
let enabled = storageService.getSettings().sfx !== false;

function out() {
  return getSfxGain();
}

function tone({
  freq = 440,
  dur = 0.15,
  type = "sine",
  when = 0,
  gain = 0.2,
  slideTo = null,
  slideVia = null,
}) {
  const ac = getCtx();
  const dest = out();
  if (!ac || !dest) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + when;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideVia) osc.frequency.exponentialRampToValueAtTime(slideVia, t0 + dur * 0.45);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.06);
}

function noise({ dur = 0.3, when = 0, gain = 0.12, cutoff = 1200, type = "lowpass", q = 1 }) {
  const ac = getCtx();
  const dest = out();
  if (!ac || !dest) return;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = cutoff;
  filter.Q.value = q;
  g.gain.value = gain;
  src.buffer = buffer;
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(ac.currentTime + when);
}

/* ===================== ANIMAL VOCALS ===================== */

// Happy bird chirp (2–3 quick whistles)
function birdChirp(when = 0, high = true) {
  const base = high ? 1900 : 1400;
  [0, 0.13, 0.24].forEach((d, i) => {
    tone({
      freq: base + i * 180,
      slideVia: base * 1.7,
      slideTo: base * 1.05,
      dur: 0.11,
      type: "sine",
      when: when + d,
      gain: 0.16,
    });
  });
}

// Sad / droopy bird
function birdSad(when = 0) {
  tone({ freq: 1200, slideTo: 500, dur: 0.4, type: "sine", when, gain: 0.13 });
  tone({ freq: 900, slideTo: 380, dur: 0.45, type: "sine", when: when + 0.28, gain: 0.11 });
}

// Coughing (filtered noise bursts)
function cough(when = 0) {
  [0, 0.28, 0.55].forEach((d) => {
    noise({ dur: 0.16, when: when + d, gain: 0.16, cutoff: 700, type: "bandpass", q: 2 });
    tone({ freq: 190, slideTo: 110, dur: 0.16, type: "sawtooth", when: when + d, gain: 0.07 });
  });
}

// Cat meow (formant-ish sweep)
function catMeow(when = 0) {
  tone({ freq: 620, slideVia: 900, slideTo: 480, dur: 0.55, type: "sawtooth", when, gain: 0.1 });
  tone({ freq: 1240, slideVia: 1800, slideTo: 960, dur: 0.55, type: "sine", when, gain: 0.04 });
}

// Content purring cat
function catPurr(when = 0) {
  for (let i = 0; i < 8; i++) {
    tone({ freq: 60, dur: 0.07, type: "sawtooth", when: when + i * 0.08, gain: 0.14 });
  }
  tone({ freq: 700, slideVia: 950, slideTo: 620, dur: 0.4, type: "sine", when: when + 0.6, gain: 0.07 });
}

function catSad(when = 0) {
  tone({ freq: 520, slideTo: 300, dur: 0.7, type: "sawtooth", when, gain: 0.09 });
}

// Fish bubble bloop
function fishBloop(when = 0) {
  [0, 0.12, 0.26].forEach((d, i) => {
    tone({
      freq: 300 + i * 90,
      slideTo: 900 + i * 150,
      dur: 0.13,
      type: "sine",
      when: when + d,
      gain: 0.14,
    });
  });
}

// Water sounds
function splash(when = 0) {
  noise({ dur: 0.45, when, gain: 0.16, cutoff: 2600, type: "bandpass", q: 0.7 });
  tone({ freq: 220, slideTo: 90, dur: 0.35, type: "sine", when, gain: 0.08 });
}
function drip(when = 0) {
  tone({ freq: 900, slideTo: 1700, dur: 0.09, type: "sine", when, gain: 0.14 });
  tone({ freq: 620, slideTo: 1300, dur: 0.09, type: "sine", when: when + 0.42, gain: 0.1 });
}
function waterOff(when = 0) {
  noise({ dur: 0.5, when, gain: 0.1, cutoff: 3200 });
  tone({ freq: 700, slideTo: 200, dur: 0.4, type: "sine", when, gain: 0.07 });
  tone({ freq: 880, dur: 0.14, type: "triangle", when: when + 0.45, gain: 0.12 });
}

// Environment
function treeFall(when = 0) {
  noise({ dur: 0.9, when, gain: 0.14, cutoff: 500 });
  tone({ freq: 120, slideTo: 45, dur: 0.8, type: "sawtooth", when: when + 0.15, gain: 0.1 });
}
function carHonk(when = 0) {
  tone({ freq: 440, dur: 0.28, type: "square", when, gain: 0.1 });
  tone({ freq: 554, dur: 0.28, type: "square", when, gain: 0.09 });
  tone({ freq: 440, dur: 0.2, type: "square", when: when + 0.36, gain: 0.09 });
}
function thud(when = 0) {
  tone({ freq: 150, slideTo: 60, dur: 0.24, type: "sine", when, gain: 0.14 });
  noise({ dur: 0.16, when, gain: 0.08, cutoff: 400 });
}
function sparkle(when = 0) {
  [1200, 1600, 2000, 2600].forEach((f, i) =>
    tone({ freq: f, dur: 0.16, type: "sine", when: when + i * 0.06, gain: 0.09 })
  );
}
function sad(when = 0) {
  [523, 466, 415, 349].forEach((f, i) =>
    tone({ freq: f, dur: 0.28, type: "triangle", when: when + i * 0.14, gain: 0.12 })
  );
}

// Children cheering — layered noise swell + bright chord
function cheer(when = 0) {
  noise({ dur: 1.1, when, gain: 0.09, cutoff: 1800, type: "bandpass", q: 0.5 });
  [784, 988, 1175].forEach((f, i) =>
    tone({ freq: f, dur: 0.6, type: "triangle", when: when + i * 0.05, gain: 0.09 })
  );
  [1568, 1976].forEach((f, i) =>
    tone({ freq: f, dur: 0.4, type: "sine", when: when + 0.35 + i * 0.08, gain: 0.06 })
  );
}

/* ===================== UI + GAME SFX ===================== */
const SOUNDS = {
  click: () => tone({ freq: 520, dur: 0.08, type: "triangle", gain: 0.14 }),
  hover: () => tone({ freq: 700, dur: 0.05, type: "sine", gain: 0.05 }),
  pop: () => tone({ freq: 700, slideTo: 1200, dur: 0.11, type: "square", gain: 0.1 }),
  whoosh: () => {
    noise({ dur: 0.32, gain: 0.08, cutoff: 1400, type: "bandpass", q: 0.8 });
    tone({ freq: 220, slideTo: 900, dur: 0.28, type: "sine", gain: 0.07 });
  },
  positive: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.2, type: "triangle", when: i * 0.09, gain: 0.15 })
    );
    sparkle(0.3);
  },
  negative: () => {
    tone({ freq: 300, slideTo: 120, dur: 0.4, type: "sawtooth", gain: 0.11 });
    noise({ dur: 0.32, gain: 0.07, cutoff: 600 });
  },
  reward: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.24, type: "triangle", when: i * 0.1, gain: 0.15 })
    );
    cheer(0.25);
  },
  badge: () => {
    [784, 988, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.32, type: "sine", when: i * 0.12, gain: 0.16 })
    );
    sparkle(0.4);
  },
  world: () => tone({ freq: 440, slideTo: 680, dur: 0.13, type: "sine", gain: 0.1 }),
  lock: () => tone({ freq: 200, slideTo: 140, dur: 0.2, type: "square", gain: 0.09 }),
  levelUp: () => {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) =>
      tone({ freq: f, dur: 0.18, type: "square", when: i * 0.07, gain: 0.1 })
    );
  },
  // animal vocals
  birdChirp: () => birdChirp(0),
  birdSad: () => birdSad(0),
  cough: () => cough(0),
  catMeow: () => catMeow(0),
  catPurr: () => catPurr(0),
  catSad: () => catSad(0),
  fishBloop: () => fishBloop(0),
  splash: () => splash(0),
  drip: () => drip(0),
  waterOff: () => waterOff(0),
  treeFall: () => treeFall(0),
  carHonk: () => carHonk(0),
  thud: () => thud(0),
  sparkle: () => sparkle(0),
  cheer: () => cheer(0),
  sad: () => sad(0),
};

/* ===================== AMBIENT LOOPS ===================== */
let ambientTimer = null;
let ambientKind = "none";

const AMBIENT = {
  birds: () => {
    if (Math.random() < 0.65) birdChirp(Math.random() * 0.5, Math.random() > 0.5);
  },
  water: () => {
    noise({ dur: 1.4, gain: 0.022, cutoff: 900, type: "bandpass", q: 0.4 });
    if (Math.random() < 0.3) drip(Math.random());
  },
  city: () => {
    noise({ dur: 1.8, gain: 0.02, cutoff: 400 });
    if (Math.random() < 0.15) carHonk(Math.random() * 1.2);
  },
  none: () => {},
};

export const soundService = {
  play(name) {
    if (!enabled) return;
    SOUNDS[name]?.();
  },

  startAmbient(kind) {
    this.stopAmbient();
    if (!enabled || !kind || kind === "none" || !AMBIENT[kind]) return;
    ambientKind = kind;
    AMBIENT[kind]();
    ambientTimer = setInterval(() => {
      if (enabled) AMBIENT[ambientKind]?.();
    }, 2600);
  },

  stopAmbient() {
    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = null;
    ambientKind = "none";
  },

  isEnabled: () => enabled,
  setEnabled(v) {
    enabled = v;
    const s = storageService.getSettings();
    s.sfx = v;
    storageService.setSettings(s);
    if (!v) this.stopAmbient();
  },

  unlock: () => unlockAudio(),
};
