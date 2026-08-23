import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Play, HelpCircle, Sparkles, X, MousePointerClick, Eye, Gift } from "lucide-react";
import { useGame } from "../context/GameContext";
import { BigButton, AudioButton, TalkingWaves } from "../components/ui/Kit";
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
      {/* hills */}
      <ellipse cx="20" cy="52" rx="40" ry="16" fill="#7cb342" />
      <ellipse cx="80" cy="54" rx="45" ry="18" fill="#8bc34a" />
      <rect x="0" y="52" width="100" height="12" fill="#8bc34a" />
      {/* houses */}
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
      {/* factory small in distance */}
      <g transform="translate(40 34)" opacity="0.95">
        <rect x="0" y="4" width="14" height="10" fill="#a1887f" />
        <rect x="10" y="-2" width="3" height="6" fill="#8d6e63" />
        <motion.circle cx="11.5" cy="-2" r="1.6" fill="#cfcfcf"
          animate={{ cy: -10, opacity: [0, 0.6, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      </g>
      {/* river */}
      <path d="M0 58 Q30 50 50 58 Q70 66 100 56 L100 62 L0 62 Z" fill="url(#heroRiver)" />
      {/* trees */}
      <Tree x={10} y={54} scale={1.1} />
      <Tree x={92} y={54} scale={0.9} />
      <Bush x={30} y={56} scale={1} />
      <Bush x={50} y={57} scale={0.9} />
      {/* animals */}
      <Critter x={22} y={56} type="rabbit" />
      <Critter x={66} y={57} type="hedgehog" />
      {/* birds */}
      <FlyingBird y={12} color="#5b8def" dur={16} />
      <FlyingBird y={20} color="#ef7d57" dur={20} delay={3} />
      <FlyingBird y={8} color="#7c5cff" dur={24} delay={6} />
    </svg>
  );
}

function HowItWorks({ onClose }) {
  const { say, speak, stopSpeaking } = useGame();
  const steps = [
    { icon: MousePointerClick, t: "Make a Choice", d: "Enter a real situation and pick what to do.", c: "#7c5cff" },
    { icon: Eye, t: "See What Happens", d: "Watch the world react to your decision.", c: "#22c55e" },
    { icon: Gift, t: "Learn & Earn", d: "Understand why, and collect XP and badges!", c: "#f59e0b" },
  ];

  useEffect(() => {
    const t = setTimeout(
      () => say(["How to play.", ...steps.map((s, i) => `${i + 1}. ${s.t}. ${s.d}`)]),
      300
    );
    return () => {
      clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h2 className="font-fun mb-6 text-center text-3xl font-extrabold text-purple-700">How to Play</h2>
        <div className="space-y-4">
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
                <p className="font-fun text-lg font-bold text-slate-800">{i + 1}. {s.t}</p>
                <p className="text-slate-500">{s.d}</p>
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
  const { player, say, speak, stopSpeaking, softStopSpeaking, speaking, playSound } = useGame();
  const [showHow, setShowHow] = useState(false);
  const greeted = useRef(false);

  // Greet the child out loud on their very first interaction (browsers require a gesture)
  useEffect(() => {
    const greet = (e) => {
      if (greeted.current) return;
      // If the very first tap was an action button, let that screen do the talking.
      if (e?.target?.closest?.("button, [role='button'], a")) {
        greeted.current = true;
        return;
      }
      greeted.current = true;
      setTimeout(
        () =>
          say([
            player ? `Welcome back, ${player.name}!` : "Welcome to Choice World!",
            "Your choices, your world.",
            "Press start playing to begin!",
          ]),
        350
      );
    };
    window.addEventListener("pointerdown", greet, { once: true });
    return () => {
      window.removeEventListener("pointerdown", greet);
      softStopSpeaking(2400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPlaying = () => {
    stopSpeaking();
    speak("Let's go!");
    navigate(player ? "/world" : "/create-player");
  };
  const playDemo = () => {
    stopSpeaking();
    navigate("/scenario/factory_smoke?demo=1");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Hero scene fills background */}
      <div className="absolute inset-0">
        <HeroWorld />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        {speaking && (
          <span className="font-fun flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-purple-700 shadow-md">
            <TalkingWaves active /> Speaking…
          </span>
        )}
        <AudioButton />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-10 text-center">
        <motion.div
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 90 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-purple-700 shadow-lg"
        >
          <Sparkles size={16} /> Smart Education Game
        </motion.div>

        <motion.h1
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="font-fun title-shadow text-5xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-7xl"
        >
          Your Choices.<br />
          <span className="text-yellow-300">Your World.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="font-fun mt-4 max-w-md text-lg font-semibold text-white drop-shadow sm:text-2xl"
        >
          Learn what happens when <span className="text-yellow-300">YOU</span> make the choice.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound("pop");
            say(["Your choices. Your world.", "Learn what happens when you make the choice!"]);
          }}
          className="font-fun mt-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-extrabold text-purple-700 shadow-lg"
        >
          🔊 Listen {speaking && <TalkingWaves active />}
        </motion.button>

        <motion.div
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <BigButton onClick={startPlaying} color="#22c55e" className="px-9 py-5 text-2xl">
            <Play size={26} fill="white" /> START PLAYING
          </BigButton>
          <BigButton onClick={() => setShowHow(true)} color="#7c5cff" className="text-lg">
            <HelpCircle size={22} /> HOW IT WORKS
          </BigButton>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          onClick={playDemo}
          className="font-fun mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold text-slate-800 shadow-lg btn-3d"
        >
          ⚡ PLAY DEMO — Try it now!
        </motion.button>
      </div>

      {/* preview strip */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 hidden h-28 lg:block" />

      {showHow && <HowItWorks onClose={() => setShowHow(false)} />}
    </div>
  );
}
