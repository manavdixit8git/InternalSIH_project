import { storageService } from "./storageService";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

let voices = [];
let voiceEn = null;
let voiceHi = null;
let lastStart = 0;

let settings = storageService.getSettings();
let enabled = settings.voice !== false;
let lang = settings.lang || "en"; // en | hi
let speed = settings.voiceSpeed ?? 1; // 0.85 - 1.15

let speaking = false;
const listeners = new Set();

const PREFERRED_EN = [
  "google uk english female",
  "google us english",
  "samantha",
  "karen",
  "tessa",
  "zira",
  "female",
];

const PREFERRED_HI = [
  "google हिन्दी",
  "hindi",
  "lekha",
  "kalpana",
  "hemant",
];

function refreshVoices() {
  if (!synth) return;
  voices = synth.getVoices() || [];
  const enList = voices.filter((v) => /^en/i.test(v.lang));
  const hiList = voices.filter((v) => /^hi/i.test(v.lang) || /hindi/i.test(v.name.toLowerCase()));

  // English pick
  voiceEn = null;
  for (const key of PREFERRED_EN) {
    const hit = enList.find((v) => v.name.toLowerCase().includes(key));
    if (hit) { voiceEn = hit; break; }
  }
  if (!voiceEn) voiceEn = enList[0] || voices.find(v => /^en/i.test(v.lang)) || voices[0] || null;

  // Hindi pick
  voiceHi = null;
  for (const key of PREFERRED_HI) {
    const hit = hiList.find((v) => v.name.toLowerCase().includes(key) || v.lang.toLowerCase().includes(key));
    if (hit) { voiceHi = hit; break; }
  }
  if (!voiceHi) voiceHi = hiList[0] || null;
}

if (synth) {
  refreshVoices();
  synth.addEventListener?.("voiceschanged", refreshVoices);
}

function emit(v) {
  speaking = v;
  listeners.forEach((fn) => {
    try { fn(v); } catch { /* ignore */ }
  });
}

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

function getVoiceForLang(l) {
  if (l === "hi" && voiceHi) return voiceHi;
  return voiceEn || voiceHi || voices[0] || null;
}

function utter(text, { rate = 1, pitch = 1, volume = 1, langOverride, onEnd } = {}) {
  if (!synth || !enabled || !text) {
    onEnd?.();
    return null;
  }
  const useLang = langOverride || lang;
  const u = new SpeechSynthesisUtterance(String(text));
  const v = getVoiceForLang(useLang);
  if (v) u.voice = v;
  // Normal speed: clamp around 0.9 - 1.05 for natural speech
  const baseRate = Math.max(0.75, Math.min(1.15, rate * speed));
  u.rate = baseRate;
  u.pitch = pitch;
  u.volume = volume;
  u.lang = v?.lang || (useLang === "hi" ? "hi-IN" : "en-US");
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
  try { synth.speak(u); } catch { onEnd?.(); }
  return u;
}

export const voiceService = {
  speak(text, opts = {}) {
    if (!synth || !enabled) { opts.onEnd?.(); return; }
    try { synth.cancel(); } catch { /* ignore */ }
    setTimeout(() => utter(text, opts), 90);
  },

  say(lines, opts = {}) {
    const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    if (!synth || !enabled || !list.length) { opts.onEnd?.(); return; }
    try { synth.cancel(); } catch { /* ignore */ }
    setTimeout(() => {
      list.forEach((line, i) =>
        utter(line, { ...opts, onEnd: i === list.length - 1 ? opts.onEnd : undefined })
      );
    }, 90);
  },

  character(text, kind = "guide", opts = {}) {
    // Normal, not too fast, not too slow — adjusted per character but all ~1.0
    const presets = {
      guide:    { rate: 0.98, pitch: 1.15 },
      bird:     { rate: 1.02, pitch: 1.45 },
      cat:      { rate: 0.96, pitch: 1.35 },
      fish:     { rate: 0.94, pitch: 1.25 },
      water:    { rate: 0.92, pitch: 1.15 },
      tree:     { rate: 0.88, pitch: 0.92 },
      kid:      { rate: 1.0,  pitch: 1.3 },
      narrator: { rate: 0.95, pitch: 1.05 },
    };
    this.speak(text, { ...(presets[kind] || presets.guide), ...opts });
  },

  cancel() {
    if (!synth) return;
    try { synth.cancel(); } catch { /* ignore */ }
    emit(false);
    stopKeepAlive();
  },

  cancelStale(graceMs = 2400) {
    if (Date.now() - lastStart < graceMs) return;
    this.cancel();
  },

  isSpeaking: () => speaking,
  isSupported: () => !!synth,
  isEnabled: () => enabled,
  getLang: () => lang,
  getSpeed: () => speed,
  getVoiceName: () => (lang === "hi" ? voiceHi?.name : voiceEn?.name) || "Default",

  setEnabled(v) {
    enabled = v;
    settings = storageService.getSettings();
    settings.voice = v;
    storageService.setSettings(settings);
    if (!v) this.cancel();
  },

  setLang(l) {
    lang = l === "hi" ? "hi" : "en";
    settings = storageService.getSettings();
    settings.lang = lang;
    storageService.setSettings(settings);
    // If currently speaking, restart in new language? Just cancel.
    this.cancel();
    return lang;
  },

  setSpeed(s) {
    speed = Math.max(0.75, Math.min(1.25, s));
    settings = storageService.getSettings();
    settings.voiceSpeed = speed;
    storageService.setSettings(settings);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
