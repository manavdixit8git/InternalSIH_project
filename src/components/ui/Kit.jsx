import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Mic, Music, Sparkles as SparkIcon, Languages } from "lucide-react";
import { useGame } from "../../context/GameContext";

/* Big chunky 3D button */
export function BigButton({ children, onClick, color = "#7c5cff", className = "", type = "button", ...rest }) {
  const { playSound } = useGame();
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => playSound("hover")}
      onClick={(e) => {
        playSound("click");
        onClick?.(e);
      }}
      className={`btn-3d font-fun inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-lg font-extrabold text-white ${className}`}
      style={{ background: color }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* Player avatar bubble — pulses while the voice is talking */
export function PlayerAvatar({ emoji, color = "#7c5cff", size = 56, ring = true, talking = false }) {
  return (
    <motion.div
      className="relative flex shrink-0 items-center justify-center rounded-full shadow-inner"
      animate={talking ? { scale: [1, 1.07, 1] } : { scale: 1 }}
      transition={talking ? { duration: 0.35, repeat: Infinity } : {}}
      style={{
        width: size,
        height: size,
        background: `${color}33`,
        border: ring ? `3px solid ${color}` : "none",
        fontSize: size * 0.55,
      }}
    >
      <span>{emoji}</span>
      {talking && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 6px ${color}44`, animation: "pulse-ring 1s ease-out infinite" }}
        />
      )}
    </motion.div>
  );
}

/* Animated "talking" sound-wave bars */
export function TalkingWaves({ active, color = "#7c5cff" }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color }}
          animate={{ height: [5, 15, 7, 17, 6] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </span>
  );
}

/* Small "tap to hear" speaker button */
export function SpeakButton({ text, kind = "guide", className = "", label = "Hear this" }) {
  const { speakAs, voiceOn, speaking } = useGame();
  if (!voiceOn) return null;
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        speakAs(text, kind);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          speakAs(text, kind);
        }
      }}
      className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-600 transition hover:bg-purple-200 active:scale-90 ${className}`}
    >
      <Volume2 size={18} className={speaking ? "animate-pulse" : ""} />
    </span>
  );
}

/* XP progress bar */
export function XPBar({ xp = 0, className = "" }) {
  const level = Math.floor(xp / 100) + 1;
  const pct = xp % 100;
  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-white/90">
        <span>Lv {level}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/30 shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

/* ===== Language Toggle - EN / हिंदी ===== */
export function LangToggle({ className = "" }) {
  const { lang, toggleLang, playSound } = useGame();
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        playSound("pop");
        toggleLang();
      }}
      aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      className={`font-fun flex h-11 items-center gap-1.5 rounded-full bg-white/90 px-3 text-sm font-extrabold shadow-md ${className}`}
    >
      <Languages size={18} />
      <span className={lang === "en" ? "text-purple-700" : "text-slate-400"}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={lang === "hi" ? "text-purple-700" : "text-slate-400"}>हिं</span>
    </motion.button>
  );
}

/* ===== Audio settings ===== */
function ToggleRow({ icon: Icon, emoji, title, subtitle, on, onToggle, color }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-slate-100"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-white"
        style={{ background: on ? color : "#cbd5e1" }}
      >
        {emoji ? <span>{emoji}</span> : <Icon size={24} />}
      </div>
      <div className="flex-1">
        <p className="font-fun text-lg font-extrabold text-slate-800">{title}</p>
        <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <div
        className="relative h-8 w-14 shrink-0 rounded-full transition"
        style={{ background: on ? color : "#cbd5e1" }}
      >
        <motion.div
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
          animate={{ left: on ? 30 : 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      </div>
    </button>
  );
}

export function AudioSettings({ onClose }) {
  const { sfxOn, musicOn, voiceOn, lang, voiceSpeed, toggleSfx, toggleMusic, toggleVoice, setLang, setVoiceSpeed, speak, voiceSupported } = useGame();
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-fun text-2xl font-extrabold text-purple-700">🔊 {lang === "hi" ? "आवाज़" : "Sound"}</h3>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2" aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        {/* Language */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            { id: "en", label: "English", flag: "🇬🇧" },
            { id: "hi", label: "हिन्दी", flag: "🇮🇳" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`font-fun flex items-center justify-center gap-2 rounded-2xl py-3 text-lg font-extrabold transition ${
                lang === l.id ? "bg-purple-600 text-white shadow" : "bg-slate-100 text-slate-600"
              }`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <ToggleRow
            icon={Mic} emoji="🎙️" title={lang === "hi" ? "बोलने वाली आवाज़" : "Talking Voice"}
            subtitle={voiceSupported ? (lang === "hi" ? "कहानी सुनो" : "Hear the story") : "Not supported"}
            on={voiceOn} onToggle={toggleVoice} color="#7c5cff"
          />
          <ToggleRow
            icon={Music} emoji="🎵" title={lang === "hi" ? "संगीत" : "Music"}
            subtitle={lang === "hi" ? "प्यारी धुन" : "Happy tunes"}
            on={musicOn} onToggle={toggleMusic} color="#22c55e"
          />
          <ToggleRow
            icon={SparkIcon} emoji="🐦" title={lang === "hi" ? "जानवरों की आवाज़" : "Animal Sounds"}
            subtitle={lang === "hi" ? "चहचहाहट, छपाक" : "Chirps, splashes"}
            on={sfxOn} onToggle={toggleSfx} color="#f59e0b"
          />
        </div>

        {/* Speed - normal */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <p className="font-fun mb-2 text-sm font-bold text-slate-600">
            {lang === "hi" ? "बोलने की गति — सामान्य" : "Speech speed — normal"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs">🐢</span>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="h-2 flex-1 accent-purple-600"
            />
            <span className="text-xs">🐰</span>
            <span className="font-fun ml-2 text-sm font-bold text-purple-700">{voiceSpeed.toFixed(2)}x</span>
          </div>
        </div>

        <button
          onClick={() => speak(lang === "hi" ? "नमस्ते! मैं आपका गाइड हूँ। चलो अच्छा चुनाव करते हैं!" : "Hello! I am your guide. Let's make great choices together!")}
          className="font-fun btn-3d mt-5 w-full rounded-2xl bg-purple-600 py-3.5 text-lg font-extrabold text-white"
        >
          🗣️ {lang === "hi" ? "आवाज़ सुनो" : "Test Voice"}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* Speaker / settings button used in headers */
export function AudioButton({ className = "" }) {
  const { anyAudioOn, speaking } = useGame();
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        aria-label="Sound settings"
        className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md ${className}`}
      >
        {anyAudioOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        {speaking && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-purple-500" />
        )}
        {speaking && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-purple-500" />}
      </motion.button>
      <AnimatePresence>{open && <AudioSettings onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

/* Back-compat alias */
export const MuteButton = AudioButton;

/* Soft rounded card */
export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`rounded-3xl bg-white shadow-xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* Animated sky background wrapper for whole pages */
export function SkyBackground({ children, variant = "day" }) {
  const grads = {
    day: "from-sky-400 via-sky-300 to-emerald-200",
    sunset: "from-orange-300 via-pink-300 to-purple-300",
    night: "from-indigo-900 via-purple-800 to-slate-900",
  };
  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-b ${grads[variant]}`}>
      {["8%", "20%", "34%"].map((top, i) => (
        <div
          key={i}
          className="cloud-drift pointer-events-none absolute"
          style={{ top, animationDuration: `${70 + i * 25}s`, animationDelay: `${-i * 20}s` }}
        >
          <div className="rounded-full bg-white/80 blur-[1px]" style={{ width: 120 + i * 30, height: 44 + i * 10 }} />
        </div>
      ))}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
