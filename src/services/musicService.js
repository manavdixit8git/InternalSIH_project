import { getCtx, getMusicGain, fadeMusic } from "./audioCore";

// Procedural, royalty-free background music.
// Gentle pentatonic arpeggios + soft pad + nature ambience. No audio files needed.

const MOODS = {
  menu: {
    scale: [523.25, 587.33, 659.25, 783.99, 880.0],
    bass: [130.81, 174.61],
    tempo: 0.4,
    birds: 0.07,
    vol: 0.5,
  },
  world: {
    scale: [587.33, 659.25, 783.99, 880.0, 1046.5],
    bass: [146.83, 196.0],
    tempo: 0.34,
    birds: 0.09,
    vol: 0.5,
  },
  happy: {
    scale: [659.25, 783.99, 880.0, 1046.5, 1174.66],
    bass: [164.81, 220.0],
    tempo: 0.26,
    birds: 0.14,
    vol: 0.6,
  },
  calm: {
    scale: [440.0, 523.25, 587.33, 659.25, 783.99],
    bass: [110.0, 146.83],
    tempo: 0.5,
    birds: 0.05,
    vol: 0.42,
  },
  tense: {
    scale: [392.0, 415.3, 466.16, 523.25, 622.25],
    bass: [98.0, 116.54],
    tempo: 0.58,
    birds: 0,
    vol: 0.4,
  },
};

// A gentle repeating melodic shape (indices into the scale, -1 = rest)
const PATTERN = [0, 2, 4, 2, 1, 3, -1, 2, 0, 3, 4, -1, 1, 2, 3, -1];

let mood = "menu";
let playing = false;
let timer = null;
let nextTime = 0;
let step = 0;
let enabled = true;

function note(freq, time, dur, gain, type = "triangle") {
  const ac = getCtx();
  const out = getMusicGain();
  if (!ac || !out) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(out);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

// tiny synthesized bird chirp for ambience
function chirp(time) {
  const ac = getCtx();
  const out = getMusicGain();
  if (!ac || !out) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  const base = 1800 + Math.random() * 900;
  osc.frequency.setValueAtTime(base, time);
  osc.frequency.exponentialRampToValueAtTime(base * 1.7, time + 0.05);
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, time + 0.11);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(0.08, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
  osc.connect(g);
  g.connect(out);
  osc.start(time);
  osc.stop(time + 0.2);
}

function scheduleStep(t) {
  const m = MOODS[mood] || MOODS.menu;
  const idx = PATTERN[step % PATTERN.length];

  if (idx >= 0) {
    const f = m.scale[idx];
    note(f, t, m.tempo * 1.9, 0.075);
    // soft octave shimmer every 4th note
    if (step % 4 === 0) note(f * 2, t + 0.02, m.tempo * 1.2, 0.028, "sine");
  }

  // bass pad every 8 steps
  if (step % 8 === 0) {
    const b = m.bass[(step / 8) % m.bass.length];
    note(b, t, m.tempo * 7, 0.06, "sine");
    note(b * 1.5, t, m.tempo * 7, 0.025, "sine");
  }

  // nature ambience
  if (m.birds && Math.random() < m.birds) chirp(t + Math.random() * 0.3);

  step++;
}

function loop() {
  const ac = getCtx();
  if (!ac || !playing) return;
  while (nextTime < ac.currentTime + 0.4) {
    scheduleStep(nextTime);
    nextTime += (MOODS[mood] || MOODS.menu).tempo;
  }
}

export const musicService = {
  start() {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac || playing) return;
    playing = true;
    nextTime = ac.currentTime + 0.1;
    timer = setInterval(loop, 160);
    fadeMusic((MOODS[mood] || MOODS.menu).vol * 0.22, 2);
  },
  stop() {
    fadeMusic(0.0001, 0.7);
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
  },
  setMood(next) {
    if (!MOODS[next] || next === mood) return;
    mood = next;
    if (playing && enabled) {
      fadeMusic((MOODS[mood] || MOODS.menu).vol * 0.22, 1.4);
    }
  },
  getMood: () => mood,
  setEnabled(v) {
    enabled = v;
    if (v) this.start();
    else this.stop();
  },
  isEnabled: () => enabled,
  isPlaying: () => playing,
};
