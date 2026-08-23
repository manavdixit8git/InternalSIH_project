// Shared Web Audio graph used by sound effects and background music.
let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;

export function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 1;
      sfxGain.connect(master);
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function getMusicGain() {
  getCtx();
  return musicGain;
}

export function getSfxGain() {
  getCtx();
  return sfxGain;
}

export function fadeMusic(to, seconds = 1.2) {
  const ac = getCtx();
  if (!ac || !musicGain) return;
  const now = ac.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), now);
  musicGain.gain.linearRampToValueAtTime(to, now + seconds);
}

export function setSfxVolume(v) {
  getCtx();
  if (sfxGain) sfxGain.gain.value = v;
}

export function unlockAudio() {
  const ac = getCtx();
  if (ac && ac.state === "suspended") ac.resume();
  return ac;
}
