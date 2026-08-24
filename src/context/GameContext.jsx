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
  const [lang, setLangState] = useState(settings.lang || "en");
  const [voiceSpeed, setVoiceSpeedState] = useState(settings.voiceSpeed ?? 1);
  const [speaking, setSpeaking] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const unlockedRef = useRef(false);

  useEffect(() => voiceService.subscribe(setSpeaking), []);

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

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/scenario")) return;
    musicService.setMood(ROUTE_MOOD[path] || "menu");
    soundService.stopAmbient();
  }, [location.pathname]);

  useEffect(() => {
    voiceService.cancelStale(2600);
  }, [location.pathname]);

  useEffect(() => () => {
    voiceService.cancel();
    musicService.stop();
    soundService.stopAmbient();
  }, []);

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
      if (next) voiceService.speak(next ? (lang === "hi" ? "आवाज़ चालू है!" : "Voice is on!") : "");
      return next;
    });
  }, [lang]);

  const setLang = useCallback((l) => {
    const next = voiceService.setLang(l);
    setLangState(next);
    // quick confirmation in new language
    setTimeout(() => {
      if (voiceOn) voiceService.speak(next === "hi" ? "हिन्दी चुनी गई" : "English selected");
    }, 120);
  }, [voiceOn]);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "hi" : "en");
  }, [lang, setLang]);

  const setVoiceSpeed = useCallback((s) => {
    voiceService.setSpeed(s);
    setVoiceSpeedState(s);
  }, []);

  const anyAudioOn = sfxOn || musicOn || voiceOn;

  const value = {
    player,
    setPlayer,
    progress,
    world,
    recordChoice,
    refresh,
    resetProgress,

    sfxOn,
    musicOn,
    voiceOn,
    lang,
    voiceSpeed,
    speaking,
    audioReady,
    anyAudioOn,
    toggleSfx,
    toggleMusic,
    toggleVoice,
    setLang,
    toggleLang,
    setVoiceSpeed,

    playSound: (n) => soundService.play(n),
    startAmbient: (k) => soundService.startAmbient(k),
    stopAmbient: () => soundService.stopAmbient(),
    setMusicMood: (m) => musicService.setMood(m),
    speak: (text, opts) => voiceService.speak(text, opts),
    say: (lines, opts) => voiceService.say(lines, opts),
    speakAs: (text, kind, opts) => voiceService.character(text, kind, opts),
    stopSpeaking: () => voiceService.cancel(),
    softStopSpeaking: (g) => voiceService.cancelStale(g),
    voiceSupported: voiceService.isSupported(),
    // helper to get localized string from scenario
    L: (scenario, field) => {
      if (!scenario) return "";
      // field like "intro" -> scenario.en.intro or scenario.hi.intro
      const pack = scenario[lang] || scenario.en || {};
      if (field.includes(".")) {
        const [a, b] = field.split(".");
        return pack[a]?.[b] || scenario.en?.[a]?.[b] || "";
      }
      return pack[field] || scenario[field] || "";
    },
    choiceL: (scenario, idx, field) => {
      if (!scenario) return "";
      const pack = scenario[lang] || scenario.en || {};
      const choice = pack.choices?.[idx];
      if (!choice) return "";
      return choice[field] || "";
    }
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
