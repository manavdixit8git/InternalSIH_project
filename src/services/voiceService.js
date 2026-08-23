import { storageService } from "./storageService";

// ===== Real spoken vocals using the browser Speech Synthesis API =====
// Falls back silently (never throws) if the API is unavailable.

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

let voices = [];
let chosenVoice = null;
let enabled = storageService.getSettings().voice !== false;
let speaking = false;
let lastStart = 0;
const listeners = new Set();

// Friendly / higher-pitched voices work best for children
const PREFERRED = [
  "google uk english female",
  "google us english",
  "samantha",
  "karen",
  "tessa",
  "moira",
  "fiona",
  "victoria",
  "zira",
  "susan",
  "female",
];

function pickVoice() {
  if (!synth) return null;
  voices = synth.getVoices() || [];
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  for (const key of PREFERRED) {
    const hit = pool.find((v) => v.name.toLowerCase().includes(key));
    if (hit) return hit;
  }
  return pool[0];
}

if (synth) {
  chosenVoice = pickVoice();
  synth.addEventListener?.("voiceschanged", () => {
    chosenVoice = pickVoice();
  });
}

function emit(v) {
  speaking = v;
  listeners.forEach((fn) => {
    try {
      fn(v);
    } catch {
      /* ignore */
    }
  });
}

// Chrome pauses long utterances — keep it alive
let keepAlive = null;
function startKeepAlive() {
  if (keepAlive || !synth) return;
  keepAlive = setInterval(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      synth.resume();
    }
  }, 8000);
}
function stopKeepAlive() {
  if (keepAlive) clearInterval(keepAlive);
  keepAlive = null;
}

function utter(text, { rate = 0.96, pitch = 1.28, volume = 1, onEnd } = {}) {
  if (!synth || !enabled || !text) {
    onEnd?.();
    return null;
  }
  const u = new SpeechSynthesisUtterance(String(text));
  if (!chosenVoice) chosenVoice = pickVoice();
  if (chosenVoice) u.voice = chosenVoice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = volume;
  u.lang = chosenVoice?.lang || "en-US";
  u.onstart = () => {
    emit(true);
    lastStart = Date.now();
    startKeepAlive();
  };
  u.onend = () => {
    if (!synth.speaking) {
      emit(false);
      stopKeepAlive();
    }
    onEnd?.();
  };
  u.onerror = () => {
    emit(false);
    stopKeepAlive();
    onEnd?.();
  };
  try {
    synth.speak(u);
  } catch {
    onEnd?.();
  }
  return u;
}

export const voiceService = {
  /** Speak a single line, interrupting anything currently spoken. */
  speak(text, opts = {}) {
    if (!synth || !enabled) {
      opts.onEnd?.();
      return;
    }
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    // small delay avoids the Chrome cancel/speak race condition
    setTimeout(() => utter(text, opts), 90);
  },

  /** Speak several lines back-to-back (natural pauses between them). */
  say(lines, opts = {}) {
    const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    if (!synth || !enabled || !list.length) {
      opts.onEnd?.();
      return;
    }
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      list.forEach((line, i) =>
        utter(line, {
          ...opts,
          onEnd: i === list.length - 1 ? opts.onEnd : undefined,
        })
      );
    }, 90);
  },

  /** Character voice: change pitch/rate to sound like different characters. */
  character(text, kind = "guide", opts = {}) {
    const presets = {
      guide: { rate: 0.97, pitch: 1.3 },
      bird: { rate: 1.12, pitch: 1.9 },
      cat: { rate: 1.0, pitch: 1.8 },
      fish: { rate: 0.92, pitch: 1.7 },
      water: { rate: 0.95, pitch: 1.6 },
      tree: { rate: 0.82, pitch: 0.85 },
      kid: { rate: 1.05, pitch: 1.55 },
      narrator: { rate: 0.92, pitch: 1.05 },
    };
    this.speak(text, { ...(presets[kind] || presets.guide), ...opts });
  },

  cancel() {
    if (!synth) return;
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
    emit(false);
    stopKeepAlive();
  },

  /**
   * Gentle stop used on navigation: a line that *just* started (e.g. the
   * "Let's go to Green Valley!" transition cue) is allowed to finish.
   */
  cancelStale(graceMs = 2200) {
    if (Date.now() - lastStart < graceMs) return;
    this.cancel();
  },

  isSpeaking: () => speaking,
  isSupported: () => !!synth,
  isEnabled: () => enabled,

  setEnabled(v) {
    enabled = v;
    const s = storageService.getSettings();
    s.voice = v;
    storageService.setSettings(s);
    if (!v) this.cancel();
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  voiceName: () => chosenVoice?.name || "Default voice",
};
