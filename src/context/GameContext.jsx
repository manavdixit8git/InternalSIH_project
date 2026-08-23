import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { storageService } from "../services/storageService";
import { progressService } from "../services/progressService";
import { soundService } from "../services/soundService";
import { musicService } from "../services/musicService";
import { voiceService } from "../services/voiceService";

const GameContext = createContext(null);

const ROUTE_MOOD = {
  "/": "menu",
  "/create-player": "happy",
  "/world": "world",
  "/progress": "calm",
  "/rewards": "happy",
  "/parent": "calm",
};

export function GameProvider({ children }) {
  const location = useLocation();
  const [player, setPlayerState] = useState(() => storageService.getPlayer());
  const [progress, setProgress] = useState(() => storageService.getProgress());
  const [world, setWorld] = useState(() => storageService.getWorld());

  const settings = storageService.getSettings();
  const [sfxOn, setSfxOn] = useState(settings.sfx !== false);
  const [musicOn, setMusicOn] = useState(settings.music !== false);
  const [voiceOn, setVoiceOn] = useState(settings.voice !== false);
  const [speaking, setSpeaking] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const unlockedRef = useRef(false);

  /* ---------- Track speech so the UI can animate a talking character ---------- */
  useEffect(() => voiceService.subscribe(setSpeaking), []);

  /* ---------- Unlock audio + start music on the first user gesture ---------- */
  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      soundService.unlock();
      musicService.setEnabled(musicOn);
      if (musicOn) musicService.start();
      setAudioReady(true);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [musicOn]);

  /* ---------- Music mood follows the route ---------- */
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/scenario")) return; // scenario controls its own mood
    musicService.setMood(ROUTE_MOOD[path] || "menu");
    soundService.stopAmbient();
  }, [location.pathname]);

  /* ---------- Stop stale narration when navigating ---------- */
  useEffect(() => {
    voiceService.cancelStale(2400);
  }, [location.pathname]);

  /* ---------- Cleanup on unmount ---------- */
  useEffect(
    () => () => {
      voiceService.cancel();
      musicService.stop();
      soundService.stopAmbient();
    },
    []
  );

  const setPlayer = useCallback((p) => {
    storageService.setPlayer(p);
    setPlayerState(p);
  }, []);

  const recordChoice = useCallback((scenario, choice) => {
    const result = progressService.recordChoice(scenario, choice);
    setProgress({ ...result.progress });
    setWorld({ ...result.world });
    return result;
  }, []);

  const refresh = useCallback(() => {
    setProgress(storageService.getProgress());
    setWorld(storageService.getWorld());
    setPlayerState(storageService.getPlayer());
  }, []);

  const resetProgress = useCallback(() => {
    progressService.reset();
    refresh();
  }, [refresh]);

  /* ---------- Audio toggles ---------- */
  const toggleSfx = useCallback(() => {
    setSfxOn((v) => {
      const next = !v;
      soundService.setEnabled(next);
      if (next) soundService.play("pop");
      return next;
    });
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicOn((v) => {
      const next = !v;
      const s = storageService.getSettings();
      s.music = next;
      storageService.setSettings(s);
      musicService.setEnabled(next);
      return next;
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      const next = !v;
      voiceService.setEnabled(next);
      if (next) voiceService.speak("Voice is on! Let's play!");
      return next;
    });
  }, []);

  /** Master switch — true when at least one audio channel is on. */
  const anyAudioOn = sfxOn || musicOn || voiceOn;
  const toggleAllAudio = useCallback(() => {
    const turnOff = sfxOn || musicOn || voiceOn;
    const next = !turnOff;
    setSfxOn(next);
    soundService.setEnabled(next);
    setMusicOn(next);
    musicService.setEnabled(next);
    setVoiceOn(next);
    voiceService.setEnabled(next);
    const s = storageService.getSettings();
    s.music = next;
    storageService.setSettings(s);
  }, [sfxOn, musicOn, voiceOn]);

  const value = {
    player,
    setPlayer,
    progress,
    world,
    recordChoice,
    refresh,
    resetProgress,

    // audio state
    sfxOn,
    musicOn,
    voiceOn,
    speaking,
    audioReady,
    anyAudioOn,
    toggleSfx,
    toggleMusic,
    toggleVoice,
    toggleAllAudio,

    // audio actions
    playSound: (n) => soundService.play(n),
    startAmbient: (k) => soundService.startAmbient(k),
    stopAmbient: () => soundService.stopAmbient(),
    setMusicMood: (m) => musicService.setMood(m),
    speak: (text, opts) => voiceService.speak(text, opts),
    say: (lines, opts) => voiceService.say(lines, opts),
    speakAs: (text, kind, opts) => voiceService.character(text, kind, opts),
    stopSpeaking: () => voiceService.cancel(),
    softStopSpeaking: (grace) => voiceService.cancelStale(grace),
    voiceSupported: voiceService.isSupported(),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
