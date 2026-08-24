import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, MousePointerClick, Eye, Gift } from "lucide-react";
import { useGame } from "../context/GameContext";
import { BigButton, AudioButton, LangToggle, TalkingWaves } from "../components/ui/Kit";
import { Sun, FlyingBird, Tree, Bush, Critter, Cloud } from "../components/scene/SceneAtoms";

function HeroWorld() {
  return (
    <svg viewBox="0 0 100 62" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5db8ff" />
          <stop offset="100%" stopColor="#c8f0ff" />
        </linearGradient>
        <linearGradient id="heroRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#0288d1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="62" fill="url(#heroSky)" />
      <Sun x={86} y={12} />
      <Cloud x={22} y={12} scale={1.1} />
      <Cloud x={52} y={9} scale={0.8} />
      <ellipse cx="20" cy="52" rx="40" ry="16" fill="#7cb342" />
      <ellipse cx="80" cy="54" rx="45" ry="18" fill="#8bc34a" />
      <rect x="0" y="52" width="100" height="12" fill="#8bc34a" />
      <g transform="translate(60 38)">
        <rect x="0" y="4" width="12" height="9" fill="#ffcc80" />
        <path d="M-1 4 L6 -2 L13 4 Z" fill="#ef5350" />
        <rect x="4" y="8" width="4" height="5" fill="#8d6e63" />
      </g>
      <g transform="translate(74 40)">
        <rect x="0" y="3" width="10" height="8" fill="#b3e5fc" />
        <path d="M-1 3 L5 -2 L11 3 Z" fill="#7c5cff" />
        <rect x="3.5" y="6" width="3" height="5" fill="#5d4037" />
      </g>
      <g transform="translate(40 34)" opacity="0.95">
        <rect x="0" y="4" width="14" height="10" fill="#a1887f" />
        <rect x="10" y="-2" width="3" height="6" fill="#8d6e63" />
        <motion.circle cx="11.5" cy="-2" r="1.6" fill="#cfcfcf"
          animate={{ cy: -10, opacity: [0, 0.6, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      </g>
      <path d="M0 58 Q30 50 50 58 Q70 66 100 56 L100 62 L0 62 Z" fill="url(#heroRiver)" />
      <Tree x={10} y={54} scale={1.1} />
      <Tree x={92} y={54} scale={0.9} />
      <Bush x={30} y={56} scale={1} />
      <Bush x={50} y={57} scale={0.9} />
      <Critter x={22} y={56} type="rabbit" />
      <Critter x={66} y={57} type="hedgehog" />
      <FlyingBird y={12} color="#5b8def" dur={16} />
      <FlyingBird y={20} color="#ef7d57" dur={20} delay={3} />
      <FlyingBird y={8} color="#7c5cff" dur={24} delay={6} />
    </svg>
  );
}

function HowItWorks({ onClose }) {
  const { say, speak, stopSpeaking, lang } = useGame();
  const steps = lang === "hi" ? [
    { icon: MousePointerClick, t: "चुनो", d: "असली जैसी स्थिति देखो और चुनो।", c: "#7c5cff" },
    { icon: Eye, t: "देखो", d: "देखो तुम्हारे चुनाव से दुनिया कैसे बदलती है।", c: "#22c55e" },
    { icon: Gift, t: "सीखो", d: "समझो क्यों, और XP-बैज पाओ!", c: "#f59e0b" },
  ] : [
    { icon: MousePointerClick, t: "Choose", d: "See a real situation and pick.", c: "#7c5cff" },
    { icon: Eye, t: "Watch", d: "Watch the world react.", c: "#22c55e" },
    { icon: Gift, t: "Learn", d: "Understand why, earn XP!", c: "#f59e0b" },
  ];

  useEffect(() => {
    const t = setTimeout(() => say(steps.map((s, i) => `${s.t}. ${s.d}`)), 300);
    return () => { clearTimeout(t); stopSpeaking(); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-slate-100 p-2" aria-label="Close">
          <X size={20} />
        </button>
        <h2 className="font-fun mb-6 text-center text-3xl font-extrabold text-purple-700">
          {lang === "hi" ? "कैसे खेलें" : "How to Play"}
        </h2>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => speak(`${s.t}. ${s.d}`)}
              onKeyDown={(e) => e.key === "Enter" && speak(`${s.t}. ${s.d}`)}
              className="flex cursor-pointer items-center gap-4 rounded-2xl bg-slate-50 p-4 transition hover:bg-purple-50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: s.c }}>
                <s.icon size={28} />
              </div>
              <div>
                <p className="font-fun text-lg font-bold text-slate-800">{s.t}</p>
                <p className="text-sm text-slate-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { player, say, speak, stopSpeaking, softStopSpeaking, speaking, playSound, lang } = useGame();
  const [showHow, setShowHow] = useState(false);
  const greeted = useRef(false);

  useEffect(() => {
    const greet = (e) => {
      if (greeted.current) return;
      if (e?.target?.closest?.("button, [role='button'], a")) {
        greeted.current = true;
        return;
      }
      greeted.current = true;
      setTimeout(
        () =>
          say(
            lang === "hi"
              ? ["चॉइस वर्ल्ड में स्वागत है!", "तुम्हारी पसंद, तुम्हारी दुनिया।"]
              : ["Welcome to Choice World!", "Your choices, your world."]
          ),
        350
      );
    };
    window.addEventListener("pointerdown", greet, { once: true });
    return () => {
      window.removeEventListener("pointerdown", greet);
      softStopSpeaking(2400);
    };
  }, [lang]);

  const startPlaying = () => {
    stopSpeaking();
    speak(lang === "hi" ? "चलो!" : "Let's go!");
    navigate(player ? "/world" : "/create-player");
  };
  const playDemo = () => {
    stopSpeaking();
    navigate("/scenario/factory_smoke?demo=1");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <HeroWorld />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

      <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
        {speaking && (
          <span className="font-fun hidden items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-purple-700 shadow-md sm:flex">
            <TalkingWaves active /> {lang === "hi" ? "बोल रहा..." : "Speaking…"}
          </span>
        )}
        <LangToggle />
        <AudioButton />
      </div>

      {/* Big visual title */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-10 text-center">
        {/* floating badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-purple-700 shadow-lg"
        >
          🌍 {lang === "hi" ? "बच्चों का स्मार्ट गेम" : "Smart Game for Kids"}
        </motion.div>

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 80 }}
          className="font-fun title-shadow text-5xl font-extrabold leading-[0.9] text-white drop-shadow-xl sm:text-7xl"
        >
          {lang === "hi" ? (
            <>
              तुम्हारी<br />
              <span className="text-yellow-300">दुनिया</span>
            </>
          ) : (
            <>
              Your Choices.<br />
              <span className="text-yellow-300">Your World.</span>
            </>
          )}
        </motion.h1>

        {/* Tiny sub - minimal text */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="font-fun mt-3 max-w-xs text-base font-semibold text-white drop-shadow"
        >
          {lang === "hi" ? "तुम चुनो, दुनिया बदलेगी" : "You choose, world changes"}
        </motion.p>

        {/* Visual CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
          className="mt-7 flex flex-col items-center gap-3"
        >
          <BigButton onClick={startPlaying} color="#22c55e" className="px-10 py-5 text-2xl">
            <Play size={28} fill="white" /> {lang === "hi" ? "खेलो" : "PLAY"}
          </BigButton>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowHow(true)}
              className="font-fun rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-purple-700 shadow"
            >
              {lang === "hi" ? "कैसे खेलें?" : "How?"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={playDemo}
              className="font-fun rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-extrabold text-slate-800 shadow btn-3d"
            >
              ⚡ DEMO
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound("pop");
                say(
                  lang === "hi"
                    ? ["तुम्हारी पसंद, तुम्हारी दुनिया", "तुम चुनो, दुनिया बदलेगी"]
                    : ["Your choices, your world", "You choose, world changes"]
                );
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-purple-700 shadow"
              aria-label="Listen"
            >
              🔊
            </motion.button>
          </div>
        </motion.div>

        {/* Mini visual preview strip - real photos */}
        <motion.div
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-10 flex gap-2"
        >
          {[
            "https://images.pexels.com/photos/33944133/pexels-photo-33944133.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
            "https://images.pexels.com/photos/15060366/pexels-photo-15060366.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
            "https://images.pexels.com/photos/34953675/pexels-photo-34953675.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
            "https://images.pexels.com/photos/8150287/pexels-photo-8150287.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200",
          ].map((src, i) => (
            <div key={i} className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-white shadow-lg sm:h-16 sm:w-16">
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>{showHow && <HowItWorks onClose={() => setShowHow(false)} />}</AnimatePresence>
    </div>
  );
}
